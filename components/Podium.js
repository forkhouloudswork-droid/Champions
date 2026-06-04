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
  const avatarSize = isFirst ? 'w-20 h-20' : 'w-16 h-16';
  const fontSize = isFirst ? 'text-base' : 'text-sm';
  const pointsSize = isFirst ? 'text-xl' : 'text-lg';

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  return (
    <div
      className="flex flex-col items-center animate-podium-rise"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Avatar */}
      <div className="relative mb-3">
        {user?.avatar_url ? (
          <img
            src={user.avatar_url}
            alt={user.name}
            className={`${avatarSize} rounded-full object-cover`}
            style={{ border: `3px solid ${medal.ring}`, boxShadow: `0 0 20px ${medal.ring}33` }}
          />
        ) : (
          <div
            className={`${avatarSize} rounded-full flex items-center justify-center font-bold`}
            style={{
              background: medal.bg,
              border: `3px solid ${medal.ring}`,
              color: medal.ring,
              fontSize: isFirst ? '1.5rem' : '1.125rem',
              boxShadow: `0 0 20px ${medal.ring}33`,
            }}
          >
            {initials}
          </div>
        )}
        {/* Medal badge */}
        <span
          className="absolute -bottom-1 -right-1 text-lg"
          style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}
        >
          {medal.label}
        </span>
      </div>

      {/* Name */}
      <span
        className={`${fontSize} font-semibold text-center leading-tight max-w-[100px] truncate`}
        style={{ color: isCurrentUser ? medal.ring : 'var(--text)' }}
      >
        {user?.name || 'Empty'}
      </span>

      {/* Points */}
      <span
        className={`${pointsSize} font-bold mt-1`}
        style={{ color: medal.ring }}
      >
        {user?.points ?? 0}
      </span>
      <span className="text-[10px] uppercase tracking-widest mt-0.5" style={{ color: 'var(--text-muted)' }}>
        pts
      </span>

      {/* Pedestal */}
      <div
        className="mt-3 rounded-t-lg w-24"
        style={{
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
    <div className="flex items-end justify-center gap-4 sm:gap-6 pt-6 pb-2">
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
