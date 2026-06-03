import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

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

  // Penalty calculation: 10% reduction per modification
  const penaltyPercentage = 0.10 * (prediction.modifications || 0);
  const deduction = basePoints * penaltyPercentage;
  
  // Ensure we don't go below 0 for a winning bet, though max deduction could be 100% if modified 10 times.
  const finalPoints = Math.max(0, basePoints - deduction);
  
  return finalPoints;
}

export async function GET(request) {
  // Security check temporarily bypassed for testing!
  // const authHeader = request.headers.get('authorization');
  // if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
  //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  // }

  try {
    const hasApiKey = !!process.env.API_SPORTS_KEY;
    const hasSupabaseUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL;
    const hasServiceRole = !!process.env.SUPABASE_SERVICE_ROLE_KEY;

    console.log('--- SYNC DEBUG START ---');
    console.log('API_SPORTS_KEY present:', hasApiKey);
    console.log('SUPABASE URL present:', hasSupabaseUrl);
    console.log('SERVICE_ROLE present:', hasServiceRole);

    // 1. Fetch live matches from public API (sportapi7 on RapidAPI)
    // The Club World Cup is uniqueTournament.id = 357. Since there's no "get all tournament events" endpoint,
    // we fetch every day of the tournament (June 15, 2025 -> July 13, 2025) via Promise.all.
    const dates = [];
    for(let i=15; i<=30; i++) dates.push(`2025-06-${i}`);
    for(let i=1; i<=13; i++) dates.push(`2025-07-${i < 10 ? '0'+i : i}`);

    const headers = {
      'X-RapidAPI-Key': process.env.API_SPORTS_KEY || '',
      'X-RapidAPI-Host': 'sportapi7.p.rapidapi.com'
    };

    let fixtures = [];
    let apiResponse = null;
    let upsertErrors = [];
    let upsertCount = 0;

    try {
      const fetchPromises = dates.map(date => 
        fetch(`https://sportapi7.p.rapidapi.com/api/v1/sport/football/scheduled-events/${date}`, { headers })
          .then(r => r.ok ? r.json() : null)
          .catch(() => null)
      );
      
      const results = await Promise.all(fetchPromises);
      apiResponse = results[0]; // Just save one day for debug purposes

      // Flatten and filter for Club World Cup (id 357)
      results.forEach(day => {
        if (day && day.events) {
          const cwcEvents = day.events.filter(e => e.tournament?.uniqueTournament?.id === 357);
          fixtures.push(...cwcEvents);
        }
      });
    } catch (err) {
      console.error('SportAPI7 Fetch Error:', err);
    }

    console.log(`Found ${fixtures.length} fixtures from SportAPI7 for Club World Cup.`);

    // 2. Iterate and update matches in DB, and compute points for finished ones
    for (const fixture of fixtures) {
      const matchId = fixture.id.toString();
      const shortStatus = fixture.status?.type || 'notstarted';
      
      let status = 'in_progress';
      if (['notstarted', 'canceled', 'postponed'].includes(shortStatus)) {
        status = 'upcoming';
      } else if (['finished', 'aet', 'penalties'].includes(shortStatus)) {
        status = 'finished';
      }
      
      const homeScore = fixture.homeScore?.current !== undefined ? fixture.homeScore.current : null;
      const awayScore = fixture.awayScore?.current !== undefined ? fixture.awayScore.current : null;

const countryToCode = {
  'argentina': 'ar', 'australia': 'au', 'belgium': 'be', 'brazil': 'br', 
  'cameroon': 'cm', 'canada': 'ca', 'costa rica': 'cr', 'croatia': 'hr', 
  'denmark': 'dk', 'ecuador': 'ec', 'england': 'gb-eng', 'france': 'fr', 
  'germany': 'de', 'ghana': 'gh', 'iran': 'ir', 'japan': 'jp', 
  'mexico': 'mx', 'morocco': 'ma', 'netherlands': 'nl', 'poland': 'pl', 
  'portugal': 'pt', 'qatar': 'qa', 'saudi arabia': 'sa', 'senegal': 'sn', 
  'serbia': 'rs', 'south korea': 'kr', 'spain': 'es', 'switzerland': 'ch', 
  'tunisia': 'tn', 'uruguay': 'uy', 'usa': 'us', 'wales': 'gb-wls',
  'italy': 'it', 'ukraine': 'ua', 'colombia': 'co', 'peru': 'pe'
};

function getCountryCode(name) {
  if (!name || name === 'TBD') return 'xx';
  return countryToCode[name.toLowerCase()] || name.substring(0, 2).toLowerCase();
}

      const homeTeamName = fixture.homeTeam?.name || 'TBD';
      const awayTeamName = fixture.awayTeam?.name || 'TBD';
      
      // Start time parsing (startTimestamp is in seconds)
      const startTime = fixture.startTimestamp ? new Date(fixture.startTimestamp * 1000).toISOString() : new Date().toISOString();

      // Update match
      const { error: upsertError } = await supabaseAdmin.from('matches').upsert({
        id: matchId,
        home_team: homeTeamName,
        away_team: awayTeamName,
        home_team_code: getCountryCode(homeTeamName),
        away_team_code: getCountryCode(awayTeamName),
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

        if (predictions && predictions.length > 0) {
          for (const pred of predictions) {
            const earned = calculatePoints(pred, homeScore, awayScore);
            
            // Update prediction points
            await supabaseAdmin
              .from('predictions')
              .update({ points_awarded: earned })
              .eq('id', pred.id);

            // Fetch user to update total points safely
            const { data: profile } = await supabaseAdmin
              .from('profiles')
              .select('points')
              .eq('id', pred.user_id)
              .single();

            if (profile) {
              await supabaseAdmin
                .from('profiles')
                .update({ points: Number(profile.points) + earned })
                .eq('id', pred.user_id);
            }
          }
        }
      }
    }

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
          status: res.status,
          fixturesFound: fixtures.length,
          apiErrors: apiResponse?.errors || null
        },
        supabase: {
          matchesUpserted: upsertCount,
          upsertErrors: upsertErrors
        }
      }
    });
  } catch (error) {
    console.error('Error syncing matches:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
