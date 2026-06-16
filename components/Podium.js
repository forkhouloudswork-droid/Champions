"use client";
import React from 'react';

const MEDAL_COLORS = {
  1: { ring: '#d4a853', bg: 'rgba(212,168,83,0.12)', label: '🥇' },
  2: { ring: '#b0b3bc', bg: 'rgba(176,179,188,0.10)', label: '🥈' },
  3: { ring: '#c87f53', bg: 'rgba(200,127,83,0.10)', label: '🥉' },
};

function PodiumSlot({ user, rank, isCurrentUser, delay }) {
  const medal = MEDAL_COLORS[rank];
  const isFirst = rank === 1;

  // Fluid responsive sizes: clamp(mobile, preferred, desktop)
  const avatarWidth = isFirst ? 'clamp(90px, 22vw, 140px)' : 'clamp(70px, 18vw, 110px)';
  const avatarHeight = isFirst ? 'clamp(110px, 28vw, 170px)' : 'clamp(85px, 22vw, 135px)';
  const borderRadius = isFirst ? 18 : 14;
  const fontSize = isFirst ? 'text-base' : 'text-sm';
  const pointsSize = isFirst ? 'text-xl' : 'text-lg';
  const initialsSize = isFirst ? '2rem' : '1.5rem';

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  return (
    <div
      className="flex flex-col items-center animate-podium-rise"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Avatar — large rounded rectangle */}
      <div className="relative mb-3">
        {user?.avatar_url ? (
          <img
            src={user.avatar_url}
            alt={user.name}
            style={{
              width: avatarWidth,
              height: avatarHeight,
              borderRadius,
              objectFit: 'cover',
              border: `3px solid ${medal.ring}`,
              boxShadow: `0 4px 24px ${medal.ring}44, 0 0 0 1px ${medal.ring}22`,
            }}
          />
        ) : (
          <div
            style={{
              width: avatarWidth,
              height: avatarHeight,
              borderRadius,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              background: medal.bg,
              border: `3px solid ${medal.ring}`,
              color: medal.ring,
              fontSize: initialsSize,
              boxShadow: `0 4px 24px ${medal.ring}44, 0 0 0 1px ${medal.ring}22`,
            }}
          >
            {initials}
          </div>
        )}
        {/* Medal badge */}
        <span
          className="absolute -bottom-2 -right-2 text-xl"
          style={{
            filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.4))',
            background: 'var(--bg-surface, #1a1a2e)',
            borderRadius: '50%',
            width: 32,
            height: 32,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: `2px solid ${medal.ring}44`,
          }}
        >
          {medal.label}
        </span>
      </div>

      {/* Name */}
      <span
        className={`${fontSize} font-semibold text-center leading-tight`}
        style={{ color: isCurrentUser ? medal.ring : 'var(--text)', maxWidth: '120px', wordBreak: 'break-word' }}
      >
        {user?.name || 'Empty'}
      </span>

      {/* Points */}
      <span
        className={`${pointsSize} font-bold mt-1`}
        style={{ color: medal.ring }}
      >
        {Number(user?.points ?? 0).toFixed(1)}
      </span>
      <span className="text-[10px] uppercase tracking-widest mt-0.5" style={{ color: 'var(--text-muted)' }}>
        pts
      </span>

      {/* Pedestal */}
      <div
        className="mt-3 rounded-t-lg"
        style={{
          width: isFirst ? 'clamp(100px, 24vw, 150px)' : 'clamp(80px, 20vw, 120px)',
          height: isFirst ? '80px' : rank === 2 ? '56px' : '40px',
          background: `linear-gradient(180deg, ${medal.ring}22 0%, ${medal.ring}08 100%)`,
          borderTop: `2px solid ${medal.ring}44`,
          borderLeft: `1px solid ${medal.ring}22`,
          borderRight: `1px solid ${medal.ring}22`,
        }}
      />
    </div>
  );
}

export default function Podium({ users, currentUserId }) {
  if (!users || users.length === 0) return null;

  // Ensure we have exactly 3 slots
  const top3 = [users[0] || null, users[1] || null, users[2] || null];

  // Display order: 2nd, 1st, 3rd
  const display = [
    { user: top3[1], rank: 2, delay: 200 },
    { user: top3[0], rank: 1, delay: 0 },
    { user: top3[2], rank: 3, delay: 350 },
  ];

  return (
    <div className="flex items-end justify-center gap-2 sm:gap-6 pt-6 pb-2" style={{ width: '100%', maxWidth: '100%' }}>
      {display.map(({ user, rank, delay }) => (
        <PodiumSlot
          key={rank}
          user={user}
          rank={rank}
          delay={delay}
          isCurrentUser={user?.id === currentUserId}
        />
      ))}
    </div>
  );
}
