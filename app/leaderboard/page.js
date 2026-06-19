"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Header from '@/components/Header';
import Podium from '@/components/Podium';

export default function Leaderboard() {
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setCurrentUserId(session.user.id);
      }

      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, points, created_at');

      const profiles = profilesData || [];

      // Use profile points natively (updated via sync-matches to prevent drift)
      const usersWithPoints = profiles.map(u => ({
        id: u.id,
        name: u.full_name || 'Anonymous',
        avatar_url: u.avatar_url || null,
        points: Number(u.points) || 0,
        created_at: u.created_at,
      }));

      // Sort by points (desc), then by created_at (asc) for tiebreaking
      usersWithPoints.sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points;
        return new Date(a.created_at) - new Date(b.created_at);
      });

      setUsers(usersWithPoints.map((u, i) => ({
        ...u,
        rank: i + 1,
      })));
      setLoading(false);
    };
    fetchData();
  }, []);

  const top3 = users.slice(0, 3);
  const tryHards = users.slice(3, 10);
  const benchwarmers = users.slice(10);
  const currentUserRank = users.findIndex(u => u.id === currentUserId) + 1;

  const renderUserRow = (user, i) => {
    const isMe = user.id === currentUserId;
    return (
      <div
        key={user.id}
        className={`flex items-center gap-3 sm:gap-4 px-3 sm:px-5 py-3 sm:py-3.5 transition-colors duration-150 animate-fade-in-up stagger-${Math.min(i + 1, 8)}`}
        style={{
          background: isMe ? 'var(--accent-dim)' : 'transparent',
          borderBottom: '1px solid var(--border-subtle)',
        }}
      >
        {/* Rank */}
        <span
          className="w-8 text-center text-sm font-bold"
          style={{ color: 'var(--text-muted)' }}
        >
          {user.rank}
        </span>

        {/* Avatar */}
        {user.avatar_url ? (
          <img
            src={user.avatar_url}
            alt=""
            className="w-8 h-8 rounded-full object-cover"
            style={{ border: '2px solid var(--border)' }}
          />
        ) : (
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold"
            style={{
              background: 'var(--bg-elevated)',
              border: '2px solid var(--border)',
              color: 'var(--text-muted)',
            }}
          >
            {user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
          </div>
        )}

        {/* Name */}
        <span
          className="flex-1 text-sm font-medium"
          style={{ color: isMe ? 'var(--accent)' : 'var(--text)' }}
        >
          {user.name}
          {isMe && (
            <span className="ml-2 text-xs font-normal" style={{ color: 'var(--text-muted)' }}>(you)</span>
          )}
        </span>

        {/* Points */}
        <span className="text-sm font-bold" style={{ color: 'var(--text)' }}>
          {Number(user.points).toFixed(1)}
        </span>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg)' }}>
      <Header />
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 py-8">
        {/* Header area */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight mb-1" style={{ color: 'var(--text)' }}>
            Leaderboard
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            {currentUserRank > 0
              ? `You're currently ranked #${currentUserRank} out of ${users.length} players`
              : 'Global rankings'}
          </p>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="skeleton h-14 w-full" />
            ))}
          </div>
        ) : users.length === 0 ? (
          <div className="card text-center py-12">
            <p style={{ color: 'var(--text-muted)' }}>No players yet. Be the first!</p>
          </div>
        ) : (
          <>
            {/* Podium */}
            <div className="mb-10 mt-6">
              <h2 className="text-xl font-black mb-6 text-center uppercase tracking-widest" style={{ color: 'var(--accent)' }}>🐐 The GOATs 🐐</h2>
              <div className="card" style={{ background: 'transparent', border: 'none', padding: 0 }}>
                <Podium users={top3} currentUserId={currentUserId} />
              </div>
            </div>

            {/* Try-Hards */}
            {tryHards.length > 0 && (
              <div className="mb-10 mt-12">
                <h2 className="text-lg font-bold mb-4 px-2" style={{ color: 'var(--text)' }}>💦 The Try-Hards (4-10)</h2>
                <div className="card-flush">
                  <div className="divide-y" style={{ borderColor: 'var(--border-subtle)' }}>
                    {tryHards.map((user, i) => renderUserRow(user, i))}
                  </div>
                </div>
              </div>
            )}

            {/* Participation Trophies */}
            {benchwarmers.length > 0 && (
              <div className="mb-8 mt-12">
                <h2 className="text-lg font-bold mb-4 px-2" style={{ color: 'var(--text)' }}>🛋️ The Benchwarmers (11+)</h2>
                <div className="card-flush">
                  <div className="divide-y" style={{ borderColor: 'var(--border-subtle)' }}>
                    {benchwarmers.map((user, i) => renderUserRow(user, i))}
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* Hidden but not hidden joke */}
        <div className="mt-12 text-center">
          <p className="text-[10px] opacity-40 hover:opacity-100 transition-opacity duration-300 cursor-default" style={{ color: 'var(--text-muted)' }}>
            * Yes, there were some bugs with the points calculation earlier. No, we are not sorry. You're welcome for the free math lesson. 🐛💅
          </p>
        </div>

      </main>
    </div>
  );
}
