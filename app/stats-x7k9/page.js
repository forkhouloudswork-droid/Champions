"use client";
import React, { useEffect, useState, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import Header from '@/components/Header';
import CountryFlag from '@/components/CountryFlag';

export default function SecretStats() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [matches, setMatches] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [activeTab, setActiveTab] = useState('matches');
  const [expandedMatch, setExpandedMatch] = useState(null);

  const handleForceSync = async () => {
    try {
      const res = await fetch('/api/sync-matches');
      const data = await res.json();
      if (res.ok) {
        alert(`Sync complete! ${data.debug?.supabase?.usersRecomputed || 0} users recomputed.`);
        window.location.reload();
      } else {
        alert(`Error: ${data.error || 'Unknown error'}`);
      }
    } catch (e) {
      alert('Error running sync');
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === 'arduino') {
      setAuthenticated(true);
      setError('');
    } else {
      setError('Wrong password');
    }
  };

  useEffect(() => {
    if (!authenticated) return;

    const fetchAll = async () => {
      const [matchRes, predRes, profileRes] = await Promise.all([
        supabase.from('matches').select('*').order('start_time', { ascending: true }),
        supabase.from('predictions').select('*').limit(10000),
        supabase.from('profiles').select('id, full_name, avatar_url, points, created_at'),
      ]);

      if (matchRes.data) setMatches(matchRes.data);
      if (predRes.data) setPredictions(predRes.data);
      if (profileRes.data) setProfiles(profileRes.data);
      setLoading(false);
    };

    fetchAll();
  }, [authenticated]);

  // ─── Per-match stats ───
  const matchStats = useMemo(() => {
    return matches.map(match => {
      const preds = predictions.filter(p => p.match_id === match.id);
      const total = preds.length;

      if (total === 0) {
        return { match, total: 0, avgHome: 0, avgAway: 0, homeWin: 0, draw: 0, awayWin: 0, scorelines: [], goldenBalls: 0 };
      }

      const avgHome = preds.reduce((sum, p) => sum + p.home_score, 0) / total;
      const avgAway = preds.reduce((sum, p) => sum + p.away_score, 0) / total;

      const homeWin = preds.filter(p => p.home_score > p.away_score).length;
      const draw = preds.filter(p => p.home_score === p.away_score).length;
      const awayWin = preds.filter(p => p.home_score < p.away_score).length;
      const goldenBalls = preds.filter(p => p.used_golden_ball).length;

      // Most popular scorelines
      const scoreMap = {};
      preds.forEach(p => {
        const key = `${p.home_score}-${p.away_score}`;
        scoreMap[key] = (scoreMap[key] || 0) + 1;
      });
      const scorelines = Object.entries(scoreMap)
        .map(([score, count]) => ({ score, count, pct: ((count / total) * 100).toFixed(0) }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      return {
        match, total, avgHome, avgAway,
        homeWin, draw, awayWin,
        homeWinPct: ((homeWin / total) * 100).toFixed(0),
        drawPct: ((draw / total) * 100).toFixed(0),
        awayWinPct: ((awayWin / total) * 100).toFixed(0),
        scorelines,
        goldenBalls,
      };
    });
  }, [matches, predictions]);

  // ─── Per-user stats ───
  const userStats = useMemo(() => {
    return profiles.map(profile => {
      const preds = predictions.filter(p => p.user_id === profile.id);
      const total = preds.length;
      const totalGoals = preds.reduce((sum, p) => sum + p.home_score + p.away_score, 0);
      const avgGoals = total > 0 ? (totalGoals / total).toFixed(1) : '0';
      const goldenBallsUsed = preds.filter(p => p.used_golden_ball).length;
      const totalMods = preds.reduce((sum, p) => sum + (p.modifications || 0), 0);
      const pointsEarned = Number((preds.reduce((sum, p) => sum + (p.points_awarded || 0), 0)).toFixed(2));

      // Favorite outcome tendency
      const homeWins = preds.filter(p => p.home_score > p.away_score).length;
      const draws = preds.filter(p => p.home_score === p.away_score).length;
      const awayWins = preds.filter(p => p.home_score < p.away_score).length;
      let tendency = 'N/A';
      if (total > 0) {
        if (homeWins >= draws && homeWins >= awayWins) tendency = 'Home';
        else if (awayWins >= homeWins && awayWins >= draws) tendency = 'Away';
        else tendency = 'Draw';
      }

      return {
        ...profile,
        name: profile.full_name || 'Anonymous',
        predictions: total,
        avgGoals,
        goldenBallsUsed,
        totalMods,
        pointsEarned,
        tendency,
      };
    }).sort((a, b) => b.predictions - a.predictions);
  }, [profiles, predictions]);

  // ─── Global summary ───
  const globalStats = useMemo(() => {
    const total = predictions.length;
    const totalGoals = predictions.reduce((sum, p) => sum + p.home_score + p.away_score, 0);
    const avgGoals = total > 0 ? (totalGoals / total).toFixed(1) : '0';
    const goldenBalls = predictions.filter(p => p.used_golden_ball).length;
    const participationRate = profiles.length > 0 && matches.length > 0
      ? ((total / (profiles.length * matches.length)) * 100).toFixed(0)
      : '0';

    return { total, avgGoals, goldenBalls, participationRate };
  }, [predictions, profiles, matches]);

  // ─── Per-country stats ───
  const countryStats = useMemo(() => {
    const countryMap = {};

    matches.forEach(match => {
      const preds = predictions.filter(p => p.match_id === match.id);

      // Process home team
      [{ team: match.home_team, code: match.home_team_code, side: 'home' },
       { team: match.away_team, code: match.away_team_code, side: 'away' }].forEach(({ team, code, side }) => {
        if (!countryMap[team]) {
          countryMap[team] = { team, code, matches: 0, totalPreds: 0, goalsFor: 0, goalsAgainst: 0, wins: 0, draws: 0, losses: 0, goldenBalls: 0 };
        }
        const entry = countryMap[team];
        entry.matches += 1;
        entry.totalPreds += preds.length;

        preds.forEach(p => {
          const teamGoals = side === 'home' ? p.home_score : p.away_score;
          const oppGoals = side === 'home' ? p.away_score : p.home_score;
          entry.goalsFor += teamGoals;
          entry.goalsAgainst += oppGoals;

          if (teamGoals > oppGoals) entry.wins += 1;
          else if (teamGoals === oppGoals) entry.draws += 1;
          else entry.losses += 1;

          if (p.used_golden_ball) entry.goldenBalls += 1;
        });
      });
    });

    return Object.values(countryMap)
      .map(c => ({
        ...c,
        avgGoalsFor: c.totalPreds > 0 ? (c.goalsFor / c.totalPreds).toFixed(1) : '0',
        avgGoalsAgainst: c.totalPreds > 0 ? (c.goalsAgainst / c.totalPreds).toFixed(1) : '0',
        winPct: c.totalPreds > 0 ? ((c.wins / c.totalPreds) * 100).toFixed(0) : '0',
        drawPct: c.totalPreds > 0 ? ((c.draws / c.totalPreds) * 100).toFixed(0) : '0',
        lossPct: c.totalPreds > 0 ? ((c.losses / c.totalPreds) * 100).toFixed(0) : '0',
      }))
      .sort((a, b) => Number(b.winPct) - Number(a.winPct));
  }, [matches, predictions]);

  // ─── Password screen ───
  if (!authenticated) {
    return (
      <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg)' }}>
        <div className="flex-1 flex items-center justify-center px-4">
          <form onSubmit={handleLogin} className="w-full max-w-sm">
            <div
              className="rounded-2xl p-8"
              style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}
            >
              <div className="text-center mb-6">
                <div className="text-3xl mb-3">🔐</div>
                <h1 className="text-xl font-bold" style={{ color: 'var(--text)' }}>
                  Restricted Access
                </h1>
                <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                  Enter password to view stats
                </p>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="input-field mb-4"
                autoFocus
              />
              {error && (
                <p className="text-xs mb-3 text-center" style={{ color: 'var(--accent-red)' }}>
                  {error}
                </p>
              )}
              <button type="submit" className="btn-primary w-full text-sm">
                Access Stats
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // ─── Loading ───
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg)' }}>
        <Header />
        <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-8">
          <div className="space-y-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="skeleton h-20 w-full" />
            ))}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg)' }}>
      <Header />
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-8">

        {/* Page header */}
        <div className="mb-6 flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight mb-1" style={{ color: 'var(--text)' }}>
              📊 Betting Statistics
            </h1>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              See what everyone is thinking
            </p>
          </div>
          <div className="flex gap-2">
            <button onClick={handleForceSync} className="btn-primary text-xs px-3 py-1.5" style={{ background: 'var(--accent-blue)' }}>
              Force Sync & Recompute
            </button>
          </div>
        </div>

        {/* Global overview cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {[
            { label: 'Total Predictions', value: globalStats.total, icon: '🎯' },
            { label: 'Avg Goals / Match', value: globalStats.avgGoals, icon: '⚽' },
            { label: 'Golden Balls Used', value: globalStats.goldenBalls, icon: '🏆' },
            { label: 'Participation', value: `${globalStats.participationRate}%`, icon: '📈' },
          ].map(stat => (
            <div
              key={stat.label}
              className="rounded-xl p-4"
              style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}
            >
              <div className="text-xl mb-1">{stat.icon}</div>
              <div className="text-xl font-bold" style={{ color: 'var(--accent)' }}>{stat.value}</div>
              <div className="text-[10px] uppercase tracking-wider mt-0.5" style={{ color: 'var(--text-muted)' }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Tab switcher */}
        <div className="flex gap-1 mb-6">
          {[
            { key: 'matches', label: 'Per Match' },
            { key: 'users', label: 'Per User' },
            { key: 'countries', label: 'By Country' },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className="px-5 py-2.5 text-xs font-semibold rounded-lg transition-all duration-150"
              style={activeTab === tab.key
                ? { background: 'var(--accent-dim)', color: 'var(--accent)' }
                : { color: 'var(--text-muted)' }
              }
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ─── Per Match Tab ─── */}
        {activeTab === 'matches' && (
          <div className="space-y-3">
            {matchStats.map(({ match, total, avgHome, avgAway, homeWinPct, drawPct, awayWinPct, scorelines, goldenBalls, homeWin, draw, awayWin }, idx) => {
              const isExpanded = expandedMatch === match.id;
              const maxOutcome = Math.max(homeWin, draw, awayWin);

              return (
                <div
                  key={match.id}
                  className={`rounded-2xl overflow-hidden transition-all duration-200 animate-fade-in-up stagger-${Math.min(idx + 1, 8)}`}
                  style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}
                >
                  {/* Match header — clickable */}
                  <button
                    onClick={() => setExpandedMatch(isExpanded ? null : match.id)}
                    className="w-full flex items-center gap-3 sm:gap-4 px-4 sm:px-5 py-4 text-left transition-colors"
                    style={{ background: isExpanded ? 'var(--bg-surface-hover)' : 'transparent' }}
                  >
                    {/* Teams */}
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <CountryFlag code={match.home_team_code} name={match.home_team} size={24} />
                      <span className="text-sm font-semibold truncate" style={{ color: 'var(--text)' }}>
                        {match.home_team}
                      </span>
                      <span className="text-xs mx-1" style={{ color: 'var(--text-muted)' }}>vs</span>
                      <span className="text-sm font-semibold truncate" style={{ color: 'var(--text)' }}>
                        {match.away_team}
                      </span>
                      <CountryFlag code={match.away_team_code} name={match.away_team} size={24} />
                    </div>

                    {/* Quick stats */}
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className="text-xs px-2 py-1 rounded-md" style={{ background: 'var(--accent-dim)', color: 'var(--accent)' }}>
                        {total} pred{total !== 1 ? 's' : ''}
                      </span>
                      {goldenBalls > 0 && (
                        <span className="text-xs" style={{ color: '#FFD700' }}>
                          {goldenBalls}⚽
                        </span>
                      )}
                      {/* Expand chevron */}
                      <svg
                        width="16" height="16" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                        style={{ color: 'var(--text-muted)', transform: isExpanded ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }}
                      >
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </div>
                  </button>

                  {/* Expanded details */}
                  {isExpanded && total > 0 && (
                    <div className="px-4 sm:px-5 pb-5" style={{ borderTop: '1px solid var(--border-subtle)' }}>

                      {/* Average predicted score */}
                      <div className="flex items-center justify-center gap-4 py-5">
                        <div className="text-center">
                          <div className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>{match.home_team}</div>
                          <div className="text-3xl font-bold" style={{ color: 'var(--text)' }}>{avgHome.toFixed(1)}</div>
                        </div>
                        <span className="text-lg" style={{ color: 'var(--text-muted)' }}>–</span>
                        <div className="text-center">
                          <div className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>{match.away_team}</div>
                          <div className="text-3xl font-bold" style={{ color: 'var(--text)' }}>{avgAway.toFixed(1)}</div>
                        </div>
                      </div>
                      <div className="text-center text-[10px] uppercase tracking-widest mb-5" style={{ color: 'var(--text-muted)' }}>
                        Average Predicted Score
                      </div>

                      {/* Outcome distribution bar */}
                      <div className="mb-5">
                        <div className="text-[10px] uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>
                          Outcome Distribution
                        </div>
                        <div className="flex rounded-lg overflow-hidden h-8 text-xs font-bold">
                          {homeWin > 0 && (
                            <div
                              className="flex items-center justify-center transition-all"
                              style={{
                                width: `${homeWinPct}%`,
                                minWidth: homeWin > 0 ? '32px' : 0,
                                background: 'var(--accent-blue)',
                                color: '#fff',
                                opacity: homeWin === maxOutcome ? 1 : 0.6,
                              }}
                            >
                              {homeWinPct}%
                            </div>
                          )}
                          {draw > 0 && (
                            <div
                              className="flex items-center justify-center transition-all"
                              style={{
                                width: `${drawPct}%`,
                                minWidth: draw > 0 ? '32px' : 0,
                                background: 'var(--text-muted)',
                                color: '#fff',
                                opacity: draw === maxOutcome ? 1 : 0.6,
                              }}
                            >
                              {drawPct}%
                            </div>
                          )}
                          {awayWin > 0 && (
                            <div
                              className="flex items-center justify-center transition-all"
                              style={{
                                width: `${awayWinPct}%`,
                                minWidth: awayWin > 0 ? '32px' : 0,
                                background: 'var(--accent-red)',
                                color: '#fff',
                                opacity: awayWin === maxOutcome ? 1 : 0.6,
                              }}
                            >
                              {awayWinPct}%
                            </div>
                          )}
                        </div>
                        <div className="flex justify-between mt-1.5 text-[10px]" style={{ color: 'var(--text-muted)' }}>
                          <span>{match.home_team} Win</span>
                          <span>Draw</span>
                          <span>{match.away_team} Win</span>
                        </div>
                      </div>

                      {/* Popular scorelines */}
                      {scorelines.length > 0 && (
                        <div>
                          <div className="text-[10px] uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>
                            Popular Scorelines
                          </div>
                          <div className="grid gap-2">
                            {scorelines.map((s, i) => (
                              <div
                                key={s.score}
                                className="flex items-center gap-3 px-3 py-2 rounded-lg"
                                style={{ background: i === 0 ? 'var(--accent-dim)' : 'var(--bg-elevated)' }}
                              >
                                <span className="text-sm font-bold w-12" style={{ color: i === 0 ? 'var(--accent)' : 'var(--text)' }}>
                                  {s.score}
                                </span>
                                <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
                                  <div
                                    className="h-full rounded-full transition-all"
                                    style={{
                                      width: `${s.pct}%`,
                                      minWidth: '4px',
                                      background: i === 0 ? 'var(--accent)' : 'var(--text-muted)',
                                    }}
                                  />
                                </div>
                                <span className="text-xs font-medium w-16 text-right" style={{ color: 'var(--text-secondary)' }}>
                                  {s.count} ({s.pct}%)
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* No predictions message */}
                  {isExpanded && total === 0 && (
                    <div className="px-5 pb-5 pt-3 text-center text-sm" style={{ color: 'var(--text-muted)', borderTop: '1px solid var(--border-subtle)' }}>
                      No predictions yet for this match
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ─── Per User Tab ─── */}
        {activeTab === 'users' && (
          <div className="card-flush">
            {/* Table header */}
            <div
              className="hidden sm:grid px-5 py-3 text-[10px] uppercase tracking-widest font-semibold"
              style={{
                color: 'var(--text-muted)',
                gridTemplateColumns: '1fr 80px 80px 80px 80px 80px',
                gap: '8px',
                borderBottom: '1px solid var(--border-subtle)',
              }}
            >
              <span>Player</span>
              <span className="text-center">Preds</span>
              <span className="text-center">Avg Goals</span>
              <span className="text-center">⚽ Used</span>
              <span className="text-center">Mods</span>
              <span className="text-center">Tendency</span>
            </div>

            {/* Rows */}
            {userStats.map((user, i) => (
              <div
                key={user.id}
                className={`flex flex-col sm:grid items-start sm:items-center gap-2 sm:gap-2 px-4 sm:px-5 py-3.5 transition-colors animate-fade-in-up stagger-${Math.min(i + 1, 8)}`}
                style={{
                  gridTemplateColumns: '1fr 80px 80px 80px 80px 80px',
                  borderBottom: '1px solid var(--border-subtle)',
                }}
              >
                {/* Player info */}
                <div className="flex items-center gap-3 min-w-0">
                  {user.avatar_url ? (
                    <img
                      src={user.avatar_url}
                      alt=""
                      className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                      style={{ border: '2px solid var(--border)' }}
                    />
                  ) : (
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0"
                      style={{ background: 'var(--bg-elevated)', border: '2px solid var(--border)', color: 'var(--text-muted)' }}
                    >
                      {user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                    </div>
                  )}
                  <div className="min-w-0">
                    <div className="text-sm font-semibold truncate" style={{ color: 'var(--text)' }}>
                      {user.name}
                    </div>
                    <div className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                      {user.pointsEarned} pts earned
                    </div>
                  </div>
                </div>

                {/* Mobile: horizontal stats row */}
                <div className="flex sm:contents gap-3 flex-wrap w-full">
                  <div className="sm:text-center">
                    <span className="text-[10px] uppercase tracking-wider sm:hidden" style={{ color: 'var(--text-muted)' }}>Preds: </span>
                    <span className="text-sm font-bold" style={{ color: 'var(--accent)' }}>{user.predictions}</span>
                  </div>
                  <div className="sm:text-center">
                    <span className="text-[10px] uppercase tracking-wider sm:hidden" style={{ color: 'var(--text-muted)' }}>Avg Goals: </span>
                    <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>{user.avgGoals}</span>
                  </div>
                  <div className="sm:text-center">
                    <span className="text-[10px] uppercase tracking-wider sm:hidden" style={{ color: 'var(--text-muted)' }}>⚽: </span>
                    <span className="text-sm font-medium" style={{ color: user.goldenBallsUsed > 0 ? '#FFD700' : 'var(--text-muted)' }}>
                      {user.goldenBallsUsed}
                    </span>
                  </div>
                  <div className="sm:text-center">
                    <span className="text-[10px] uppercase tracking-wider sm:hidden" style={{ color: 'var(--text-muted)' }}>Mods: </span>
                    <span className="text-sm font-medium" style={{ color: user.totalMods > 0 ? 'var(--accent-red)' : 'var(--text-muted)' }}>
                      {user.totalMods}
                    </span>
                  </div>
                  <div className="sm:text-center">
                    <span className="text-[10px] uppercase tracking-wider sm:hidden" style={{ color: 'var(--text-muted)' }}>Tendency: </span>
                    <span
                      className="text-xs font-semibold px-2 py-0.5 rounded-md"
                      style={{
                        background: user.tendency === 'Home' ? 'var(--accent-blue-dim)' :
                                   user.tendency === 'Away' ? 'var(--accent-red-dim)' :
                                   user.tendency === 'Draw' ? 'var(--accent-green-dim)' : 'var(--bg-elevated)',
                        color: user.tendency === 'Home' ? 'var(--accent-blue)' :
                               user.tendency === 'Away' ? 'var(--accent-red)' :
                               user.tendency === 'Draw' ? 'var(--accent-green)' : 'var(--text-muted)',
                      }}
                    >
                      {user.tendency}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ─── By Country Tab ─── */}
        {activeTab === 'countries' && (
          <div className="space-y-3">
            {countryStats.map((country, idx) => {
              const totalOutcomes = country.wins + country.draws + country.losses;
              const maxBar = Math.max(country.wins, country.draws, country.losses);

              return (
                <div
                  key={country.team}
                  className={`rounded-2xl p-4 sm:p-5 animate-fade-in-up stagger-${Math.min(idx + 1, 8)}`}
                  style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}
                >
                  {/* Country header */}
                  <div className="flex items-center gap-3 mb-4">
                    <CountryFlag code={country.code} name={country.team} size={32} />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold" style={{ color: 'var(--text)' }}>
                        {country.team}
                      </div>
                      <div className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                        {country.matches} match{country.matches !== 1 ? 'es' : ''} · {country.totalPreds} prediction{country.totalPreds !== 1 ? 's' : ''}
                      </div>
                    </div>
                    {country.goldenBalls > 0 && (
                      <span className="text-xs font-medium" style={{ color: '#FFD700' }}>
                        {country.goldenBalls} ⚽
                      </span>
                    )}
                  </div>

                  {/* Avg goals row */}
                  <div className="flex gap-3 mb-4">
                    <div
                      className="flex-1 rounded-lg px-3 py-2 text-center"
                      style={{ background: 'var(--accent-green-dim)' }}
                    >
                      <div className="text-lg font-bold" style={{ color: 'var(--accent-green)' }}>{country.avgGoalsFor}</div>
                      <div className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Avg GF</div>
                    </div>
                    <div
                      className="flex-1 rounded-lg px-3 py-2 text-center"
                      style={{ background: 'var(--accent-red-dim)' }}
                    >
                      <div className="text-lg font-bold" style={{ color: 'var(--accent-red)' }}>{country.avgGoalsAgainst}</div>
                      <div className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Avg GA</div>
                    </div>
                  </div>

                  {/* Outcome bar */}
                  {totalOutcomes > 0 && (
                    <div>
                      <div className="flex rounded-lg overflow-hidden h-7 text-[11px] font-bold">
                        {country.wins > 0 && (
                          <div
                            className="flex items-center justify-center"
                            style={{
                              width: `${country.winPct}%`,
                              minWidth: '28px',
                              background: 'var(--accent-green)',
                              color: '#fff',
                              opacity: country.wins === maxBar ? 1 : 0.6,
                            }}
                          >
                            W {country.winPct}%
                          </div>
                        )}
                        {country.draws > 0 && (
                          <div
                            className="flex items-center justify-center"
                            style={{
                              width: `${country.drawPct}%`,
                              minWidth: '28px',
                              background: 'var(--text-muted)',
                              color: '#fff',
                              opacity: country.draws === maxBar ? 1 : 0.6,
                            }}
                          >
                            D {country.drawPct}%
                          </div>
                        )}
                        {country.losses > 0 && (
                          <div
                            className="flex items-center justify-center"
                            style={{
                              width: `${country.lossPct}%`,
                              minWidth: '28px',
                              background: 'var(--accent-red)',
                              color: '#fff',
                              opacity: country.losses === maxBar ? 1 : 0.6,
                            }}
                          >
                            L {country.lossPct}%
                          </div>
                        )}
                      </div>
                      <div className="flex justify-between mt-1 text-[10px]" style={{ color: 'var(--text-muted)' }}>
                        <span>Win</span>
                        <span>Draw</span>
                        <span>Loss</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

      </main>
    </div>
  );
}
