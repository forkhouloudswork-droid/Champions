"use client";
import React, { useState } from 'react';
import CountryFlag from './CountryFlag';
import ScoreInput from './ScoreInput';

export default function MatchCard({ match, prediction, onSave }) {
  const [homeScore, setHomeScore] = useState(prediction?.home_score ?? '');
  const [awayScore, setAwayScore] = useState(prediction?.away_score ?? '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const isFinished = match.status === 'finished';
  const isLive = match.status === 'in_progress';
  const hasPrediction = prediction?.id;

  const handleSave = async () => {
    if (homeScore === '' || awayScore === '') return;
    setSaving(true);
    await onSave(match.id, parseInt(homeScore), parseInt(awayScore), prediction);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const statusBadge = () => {
    if (isLive) return <span className="badge badge-live">Live</span>;
    if (isFinished) return <span className="badge badge-finished">Finished</span>;
    return <span className="badge badge-upcoming">Upcoming</span>;
  };

  const matchDate = new Date(match.start_time);
  const timeStr = matchDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div
      className="rounded-2xl p-5 transition-all duration-200"
      style={{
        background: 'var(--bg-surface)',
        border: `1px solid ${hasPrediction ? 'var(--accent)' : 'var(--border)'}`,
        borderColor: hasPrediction ? 'rgba(212,168,83,0.3)' : 'var(--border)',
      }}
    >
      {/* Top bar */}
      <div className="flex justify-between items-center mb-5">
        <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
          {timeStr}
        </span>
        {statusBadge()}
      </div>

      {/* Teams + Scores */}
      <div className="flex items-center justify-between">
        {/* Home team */}
        <div className="flex flex-col items-center gap-2 w-2/5 text-center">
          <div className="w-12 h-12 flex items-center justify-center">
            <CountryFlag code={match.home_team_code} name={match.home_team} size={44} />
          </div>
          <span className="text-sm font-semibold leading-tight" style={{ color: 'var(--text)' }}>
            {match.home_team}
          </span>
        </div>

        {/* Score area */}
        <div className="flex flex-col items-center gap-2 w-1/5">
          {isFinished ? (
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold" style={{ color: 'var(--text)' }}>
                {match.home_score}
              </span>
              <span className="text-lg" style={{ color: 'var(--text-muted)' }}>–</span>
              <span className="text-2xl font-bold" style={{ color: 'var(--text)' }}>
                {match.away_score}
              </span>
            </div>
          ) : (
            <span className="text-xs font-medium uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>vs</span>
          )}
        </div>

        {/* Away team */}
        <div className="flex flex-col items-center gap-2 w-2/5 text-center">
          <div className="w-12 h-12 flex items-center justify-center">
            <CountryFlag code={match.away_team_code} name={match.away_team} size={44} />
          </div>
          <span className="text-sm font-semibold leading-tight" style={{ color: 'var(--text)' }}>
            {match.away_team}
          </span>
        </div>
      </div>

      {/* Prediction area */}
      <div
        className="mt-5 pt-4"
        style={{ borderTop: '1px solid var(--border-subtle)' }}
      >
        {!isFinished ? (
          <>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                Your Prediction
              </span>
              {prediction?.modifications > 0 && (
                <span className="text-xs" style={{ color: 'var(--accent-red)' }}>
                  {prediction.modifications}× modified (−{prediction.modifications * 10}%)
                </span>
              )}
            </div>
            <div className="flex items-center justify-center gap-4">
              <ScoreInput
                value={homeScore}
                onChange={setHomeScore}
                disabled={isFinished}
              />
              <span className="text-sm font-bold" style={{ color: 'var(--text-muted)' }}>–</span>
              <ScoreInput
                value={awayScore}
                onChange={setAwayScore}
                disabled={isFinished}
              />
            </div>
            <div className="mt-4 flex justify-end">
              <button
                onClick={handleSave}
                disabled={saving || homeScore === '' || awayScore === ''}
                className="btn-primary text-xs px-5 py-2 flex items-center gap-2"
              >
                {saved ? (
                  <>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="animate-check-pop">
                      <path d="M2.5 7L5.5 10L11.5 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Saved
                  </>
                ) : saving ? (
                  'Saving...'
                ) : hasPrediction ? (
                  'Update'
                ) : (
                  'Lock it in'
                )}
              </button>
            </div>
          </>
        ) : (
          /* Show prediction vs actual for finished matches */
          hasPrediction ? (
            <div className="flex items-center justify-between">
              <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                You predicted: <span className="font-bold" style={{ color: 'var(--text-secondary)' }}>{prediction.home_score} – {prediction.away_score}</span>
              </div>
              {prediction.points_awarded != null && (
                <div
                  className="text-xs font-bold px-2 py-1 rounded-md"
                  style={{
                    background: prediction.points_awarded > 0 ? 'var(--accent-green-dim)' : 'rgba(255,255,255,0.04)',
                    color: prediction.points_awarded > 0 ? 'var(--accent-green)' : 'var(--text-muted)',
                  }}
                >
                  +{prediction.points_awarded} pts
                </div>
              )}
            </div>
          ) : (
            <div className="text-xs text-center" style={{ color: 'var(--text-muted)' }}>
              No prediction made
            </div>
          )
        )}
      </div>
    </div>
  );
}
