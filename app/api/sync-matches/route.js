import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Helper to calculate points based on our fair point system rules
function calculatePoints(prediction, actualHomeScore, actualAwayScore) {
  let basePoints = 0;
  
  const predHomeScore = prediction.home_score;
  const predAwayScore = prediction.away_score;
  
  const predGoalDiff = predHomeScore - predAwayScore;
  const actualGoalDiff = actualHomeScore - actualAwayScore;
  
  const predWinner = predGoalDiff > 0 ? 'home' : predGoalDiff < 0 ? 'away' : 'draw';
  const actualWinner = actualGoalDiff > 0 ? 'home' : actualGoalDiff < 0 ? 'away' : 'draw';

  if (predHomeScore === actualHomeScore && predAwayScore === actualAwayScore) {
    basePoints = 5; // Exact score
  } else if (predGoalDiff === actualGoalDiff) {
    basePoints = 3; // Correct goal difference
  } else if (predWinner === actualWinner) {
    basePoints = 2; // Correct winner only
  }

  // Penalty calculation: 10% reduction per modification
  const penaltyPercentage = 0.10 * (prediction.modifications || 0);
  const deduction = basePoints * penaltyPercentage;
  
  // Ensure we don't go below 0 for a winning bet, though max deduction could be 100% if modified 10 times.
  const finalPoints = Math.max(0, basePoints - deduction);
  
  return finalPoints;
}

export async function GET(request) {
  // Security check: ensure only cron can call this (usually via a secret header in Vercel)
  const authHeader = request.headers.get('authorization');
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // 1. Fetch live matches from public API (api-football)
    // Note: This uses the direct API-Football dashboard subscription.
    const res = await fetch('https://v3.football.api-sports.io/fixtures?league=1&season=2026', {
      headers: {
        'x-apisports-key': process.env.API_SPORTS_KEY || ''
      }
    });
    
    // For local mocking if API fails/unavailable
    let fixtures = [];
    if (res.ok) {
      const data = await res.json();
      fixtures = data.response || [];
    }

    // 2. Iterate and update matches in DB, and compute points for finished ones
    for (const fixture of fixtures) {
      const matchId = fixture.fixture.id.toString();
      const shortStatus = fixture.fixture.status.short;
      let status = 'in_progress';
      if (['NS', 'TBD', 'PST'].includes(shortStatus)) {
        status = 'upcoming';
      } else if (['FT', 'AET', 'PEN', 'CANC', 'ABD', 'AWD', 'WO'].includes(shortStatus)) {
        status = 'finished';
      }
      const homeScore = fixture.goals.home;
      const awayScore = fixture.goals.away;

      // Update match
      await supabase.from('matches').upsert({
        id: matchId,
        home_team: fixture.teams.home.name,
        away_team: fixture.teams.away.name,
        home_team_code: fixture.teams.home.name.substring(0, 2).toLowerCase(), // Mocking code
        away_team_code: fixture.teams.away.name.substring(0, 2).toLowerCase(), // Mocking code
        start_time: fixture.fixture.date,
        home_score: homeScore,
        away_score: awayScore,
        status: status
      });

      // If finished, calculate points for all predictions related to this match
      if (status === 'finished' && homeScore !== null && awayScore !== null) {
        const { data: predictions } = await supabase
          .from('predictions')
          .select('*')
          .eq('match_id', matchId)
          .is('points_awarded', null);

        if (predictions && predictions.length > 0) {
          for (const pred of predictions) {
            const earned = calculatePoints(pred, homeScore, awayScore);
            
            // Update prediction points
            await supabase
              .from('predictions')
              .update({ points_awarded: earned })
              .eq('id', pred.id);

            // Fetch user to update total points safely
            const { data: profile } = await supabase
              .from('profiles')
              .select('points')
              .eq('id', pred.user_id)
              .single();

            if (profile) {
              await supabase
                .from('profiles')
                .update({ points: Number(profile.points) + earned })
                .eq('id', pred.user_id);
            }
          }
        }
      }
    }

    return NextResponse.json({ success: true, message: 'Sync complete' });
  } catch (error) {
    console.error('Error syncing matches:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
