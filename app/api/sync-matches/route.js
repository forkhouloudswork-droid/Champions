import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

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

  // Penalty calculation: Static 5% reduction if modified at least once
  const penaltyPercentage = prediction.modifications > 0 ? 0.05 : 0;
  const deduction = basePoints * penaltyPercentage;
  
  // Apply deduction and then apply Golden Ball multiplier
  let finalPoints = Math.max(0, basePoints - deduction);
  
  if (prediction.used_golden_ball) {
    finalPoints *= 2; // +100% score
  }
  
  return finalPoints;
}

export async function GET(request) {

  try {
    const hasApiKey = !!process.env.API_SPORTS_KEY;
    const hasSupabaseUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL;
    const hasServiceRole = !!process.env.SUPABASE_SERVICE_ROLE_KEY;

    console.log('--- SYNC DEBUG START ---');
    console.log('API_SPORTS_KEY present:', hasApiKey);
    console.log('SUPABASE URL present:', hasSupabaseUrl);
    console.log('SERVICE_ROLE present:', hasServiceRole);

    // 1. Fetch live matches from public API (football-data.org)
    // The FIFA World Cup competition code is 'WC'. We explicitly request the 2026 season.
    const url = 'https://api.football-data.org/v4/competitions/WC/matches?season=2026';
    
    const headers = {
      'X-Auth-Token': process.env.API_SPORTS_KEY || ''
    };

    let fixtures = [];
    let apiResponse = null;
    let apiStatus = 500;
    let upsertErrors = [];
    let upsertCount = 0;

    try {
      const response = await fetch(url, { headers });
      apiStatus = response.status;
      apiResponse = await response.json();
      
      if (response.ok) {
        fixtures = apiResponse.matches || [];
      } else {
        console.error('Football-Data API Error:', apiResponse);
      }
    } catch (err) {
      console.error('Football-Data Fetch Error:', err);
    }

    console.log(`Found ${fixtures.length} fixtures from Football-Data for FIFA World Cup 2026.`);

    // 2. Iterate and update matches in DB, and compute points for finished ones
    for (const match of fixtures) {
      const matchId = match.id.toString();
      const rawStatus = match.status || 'SCHEDULED';
      
      let status = 'in_progress';
      if (['SCHEDULED', 'TIMED', 'CANCELED', 'CANCELLED', 'POSTPONED'].includes(rawStatus)) {
        status = 'upcoming';
      } else if (['FINISHED', 'AWARDED'].includes(rawStatus)) {
        status = 'finished';
      }
      
      const homeScore = match.score?.fullTime?.home !== undefined ? match.score.fullTime.home : null;
      const awayScore = match.score?.fullTime?.away !== undefined ? match.score.fullTime.away : null;

      const homeTeamName = match.homeTeam?.name || 'TBD';
      const awayTeamName = match.awayTeam?.name || 'TBD';
      
      const homeTeamCrest = match.homeTeam?.crest || '';
      const awayTeamCrest = match.awayTeam?.crest || '';
      
      const startTime = match.utcDate || new Date().toISOString();

      // Update match
      const { error: upsertError } = await supabaseAdmin.from('matches').upsert({
        id: matchId,
        home_team: homeTeamName,
        away_team: awayTeamName,
        home_team_code: homeTeamCrest,
        away_team_code: awayTeamCrest,
        start_time: startTime,
        home_score: homeScore,
        away_score: awayScore,
        status: status
      });
      
      if (upsertError) {
        console.error(`Match Upsert Error [${matchId}]:`, upsertError);
        upsertErrors.push(upsertError);
      } else {
        upsertCount++;
      }

      // If finished, calculate points for all predictions related to this match
      if (status === 'finished' && homeScore !== null && awayScore !== null) {
        const { data: predictions } = await supabaseAdmin
          .from('predictions')
          .select('*')
          .eq('match_id', matchId)
          .is('points_awarded', null);

        const affectedUserIds = new Set();

        if (predictions && predictions.length > 0) {
          for (const pred of predictions) {
            const earned = calculatePoints(pred, homeScore, awayScore);
            
            // Update prediction points
            await supabaseAdmin
              .from('predictions')
              .update({ points_awarded: earned })
              .eq('id', pred.id);

            affectedUserIds.add(pred.user_id);
          }
        }

        // Recompute total points for each affected user from source of truth
        // This eliminates drift from double-counting or lost updates
        for (const userId of affectedUserIds) {
          const { data: userPreds } = await supabaseAdmin
            .from('predictions')
            .select('points_awarded')
            .eq('user_id', userId)
            .not('points_awarded', 'is', null);

          const total = Number(((userPreds || []).reduce(
            (sum, p) => sum + Number(p.points_awarded), 0
          )).toFixed(2));

          await supabaseAdmin
            .from('profiles')
            .update({ points: total })
            .eq('id', userId);
        }
      }
    }

    // ── Full recompute: heal any existing drift for ALL users ──
    const { data: allProfiles } = await supabaseAdmin
      .from('profiles')
      .select('id');

    let recomputedCount = 0;
    if (allProfiles) {
      for (const prof of allProfiles) {
        const { data: userPreds } = await supabaseAdmin
          .from('predictions')
          .select('points_awarded')
          .eq('user_id', prof.id)
          .not('points_awarded', 'is', null);

        const total = Number(((userPreds || []).reduce(
          (sum, p) => sum + Number(p.points_awarded), 0
        )).toFixed(2));

        await supabaseAdmin
          .from('profiles')
          .update({ points: total })
          .eq('id', prof.id);

        recomputedCount++;
      }
    }

    console.log(`Recomputed points for ${recomputedCount} users.`);
    console.log('--- SYNC DEBUG END ---');

    return NextResponse.json({ 
      success: true, 
      debug: {
        keys: {
          hasApiKey,
          hasSupabaseUrl,
          hasServiceRole
        },
        apiSports: {
          status: apiStatus,
          fixturesFound: fixtures.length,
          apiErrors: apiResponse?.message || null
        },
        supabase: {
          matchesUpserted: upsertCount,
          upsertErrors: upsertErrors,
          usersRecomputed: recomputedCount
        }
      }
    });
  } catch (error) {
    console.error('Error syncing matches:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.toString() }, { status: 500 });
  }
}
