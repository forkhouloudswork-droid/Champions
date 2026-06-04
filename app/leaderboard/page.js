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

      const { data } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, points')
        .order('points', { ascending: false });

      if (data) {
        setUsers(data.map((u, i) => ({
          id: u.id,
          rank: i + 1,
          name: u.full_name || 'Anonymous',
          avatar_url: u.avatar_url || null,
          points: u.points || 0,
        })));
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  const top3 = users.slice(0, 3);
  const rest = users.slice(3);
  const currentUserRank = users.findIndex(u => u.id === currentUserId) + 1;

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
            <div className="card mb-6" style={{ background: 'transparent', border: 'none', padding: 0 }}>
              <Podium users={top3} currentUserId={currentUserId} />
            </div>

            {/* Rest of the leaderboard */}
            {rest.length > 0 && (
              <div className="card-flush">
                <div className="divide-y" style={{ borderColor: 'var(--border-subtle)' }}>
                  {rest.map((user, i) => {
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
                          {user.points}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}

        {/* Powered by */}
        <div className="mt-12 mb-8 text-center flex flex-col items-center justify-center">
          <span className="text-[10px] uppercase tracking-widest font-bold mb-2 opacity-50" style={{ color: 'var(--text-muted)' }}>Powered by</span>
          <img src="/TLS.png" alt="TLS" className="h-10 w-auto opacity-40" style={{ filter: 'brightness(0) invert(1)' }} />
        </div>
      </main>
    </div>
  );
}
