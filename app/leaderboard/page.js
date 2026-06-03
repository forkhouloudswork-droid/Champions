"use client";
import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function Leaderboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      // Get current user session to highlight them
      const { data: { session } } = await supabase.auth.getSession();
      if (session) setCurrentUser(session.user);

      // Fetch leaderboard
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, points')
        .order('points', { ascending: false });

      if (data) {
        setUsers(data.map((u, i) => ({ 
          id: u.id,
          rank: i + 1, 
          name: u.full_name || 'Anonymous', 
          points: u.points || 0 
        })));
      }
      setLoading(false);
    };
    
    fetchData();
  }, []);

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Leaderboard</h1>
        <p className="text-muted-foreground">Global rankings based on total points.</p>
      </div>

      <div className="card p-0 overflow-hidden">
        <div className="grid grid-cols-12 gap-4 p-4 border-b border-border bg-muted/30 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          <div className="col-span-2 text-center">Rank</div>
          <div className="col-span-7">Player</div>
          <div className="col-span-3 text-right">Points</div>
        </div>

        {loading ? (
          <div className="p-8 text-center text-muted-foreground">Loading leaderboard...</div>
        ) : users.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">No users found.</div>
        ) : (
          <div className="divide-y divide-border">
            {users.map((user) => (
              <div 
                key={user.id} 
                className={`grid grid-cols-12 gap-4 p-4 items-center transition-colors hover:bg-muted/30 ${
                  currentUser?.id === user.id ? 'bg-primary/5' : ''
                }`}
              >
                <div className="col-span-2 text-center font-medium">
                  {user.rank}
                </div>
                <div className="col-span-7 font-medium flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-muted border border-border flex items-center justify-center text-[10px] uppercase">
                    {user.name.charAt(0)}
                  </div>
                  {user.name} {currentUser?.id === user.id && <span className="text-xs text-muted-foreground ml-2">(You)</span>}
                </div>
                <div className="col-span-3 text-right font-bold">
                  {user.points}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
