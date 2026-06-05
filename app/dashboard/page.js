"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Header from '@/components/Header';
import MatchCard from '@/components/MatchCard';
import EditProfileModal from '@/components/EditProfileModal';

export default function Dashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [rank, setRank] = useState(null);
  const [matches, setMatches] = useState([]);
  const [predictions, setPredictions] = useState({});
  const [filter, setFilter] = useState('all'); // 'all', 'upcoming', 'finished'
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push('/');
        return;
      }

      // Fetch User Profile
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
      
      if (userProfile) setProfile(userProfile);

      // Fetch Rank
      const { data: allProfiles } = await supabase
        .from('profiles')
        .select('id')
        .order('points', { ascending: false });
      
      if (allProfiles) {
        const idx = allProfiles.findIndex(p => p.id === session.user.id) + 1;
        setRank(idx > 0 ? idx : null);
      }

      // Fetch All Matches
      const { data: allMatches } = await supabase
        .from('matches')
        .select('*')
        .order('start_time', { ascending: true });
      
      if (allMatches) setMatches(allMatches);

      // Fetch User Predictions
      const { data: userPredictions } = await supabase
        .from('predictions')
        .select('*')
        .eq('user_id', session.user.id);
      
      if (userPredictions) {
        const predMap = {};
        userPredictions.forEach(p => {
          predMap[p.match_id] = {
            id: p.id,
            home_score: p.home_score,
            away_score: p.away_score,
            modifications: p.modifications || 0,
            points_awarded: p.points_awarded,
          };
        });
        setPredictions(predMap);
      }

      setLoading(false);
    };

    fetchDashboardData();
  }, [router]);

  const handleSave = async (matchId, homeScore, awayScore, existingPred) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    if (existingPred?.id) {
      await supabase
        .from('predictions')
        .update({
          home_score: homeScore,
          away_score: awayScore,
          modifications: (existingPred.modifications || 0) + 1,
        })
        .eq('id', existingPred.id);

      setPredictions(prev => ({
        ...prev,
        [matchId]: {
          ...prev[matchId],
          home_score: homeScore,
          away_score: awayScore,
          modifications: (existingPred.modifications || 0) + 1,
        }
      }));
    } else {
      const { data } = await supabase
        .from('predictions')
        .insert({
          user_id: session.user.id,
          match_id: matchId,
          home_score: homeScore,
          away_score: awayScore,
        })
        .select()
        .single();

      if (data) {
        setPredictions(prev => ({
          ...prev,
          [matchId]: {
            id: data.id,
            home_score: homeScore,
            away_score: awayScore,
            modifications: 0,
            points_awarded: null,
          }
        }));
      }
    }
  };

  // Group matches by date
  const filteredMatches = matches.filter(m => {
    if (filter === 'upcoming') return m.status !== 'finished';
    if (filter === 'finished') return m.status === 'finished';
    return true;
  });

  const grouped = {};
  filteredMatches.forEach(m => {
    const dateKey = new Date(m.start_time).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
    if (!grouped[dateKey]) grouped[dateKey] = [];
    grouped[dateKey].push(m);
  });

  const predictedCount = Object.keys(predictions).length;
  const totalCount = matches.filter(m => m.status !== 'finished').length;

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg)' }}>
        <Header />
        <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 py-8">
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="skeleton h-48 w-full" />
            ))}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg)' }}>
      <Header />
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 py-8">
        {/* Stats bar */}
        <div
          className="rounded-2xl px-4 sm:px-5 py-4 mb-6"
          style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt=""
                  className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                  style={{ border: '2px solid var(--border)' }}
                />
              ) : (
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                  style={{ background: 'var(--accent-dim)', color: 'var(--accent)', border: '2px solid var(--border)' }}
                >
                  {profile?.full_name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U'}
                </div>
              )}
              <div className="min-w-0">
                <div className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
                  {profile?.full_name || 'User'}
                </div>
                <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  {rank ? `Rank #${rank}` : 'Unranked'}
                </div>
              </div>
            </div>
            
            <button 
              onClick={() => setIsEditingProfile(true)}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors"
              style={{ background: 'var(--bg-elevated)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 20h9"></path>
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
              </svg>
              Edit
            </button>
            <button
              onClick={() => setIsEditingProfile(true)}
              className="sm:hidden p-2 rounded-md transition-colors"
              style={{ color: 'var(--text-secondary)' }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 20h9"></path>
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
              </svg>
            </button>
            
            <div className="flex gap-4 sm:gap-6 flex-shrink-0 ml-auto sm:ml-0">
              <div className="text-right">
                <div className="text-base sm:text-lg font-bold" style={{ color: 'var(--accent)' }}>
                  {profile?.points || 0}
                </div>
                <div className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Points</div>
              </div>
              <div className="text-right">
                <div className="text-base sm:text-lg font-bold" style={{ color: 'var(--text)' }}>
                  {predictedCount}/{totalCount}
                </div>
                <div className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Predicted</div>
              </div>
            </div>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1 mb-6">
          {[
            { key: 'all', label: 'All Matches' },
            { key: 'upcoming', label: 'Upcoming' },
            { key: 'finished', label: 'Finished' },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className="px-4 py-2 text-xs font-semibold rounded-lg transition-all duration-150"
              style={filter === tab.key
                ? { background: 'var(--accent-dim)', color: 'var(--accent)' }
                : { color: 'var(--text-muted)' }
              }
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Match list grouped by date */}
        {Object.keys(grouped).length === 0 ? (
          <div className="card text-center py-12">
            <p style={{ color: 'var(--text-muted)' }}>No matches found for this filter.</p>
          </div>
        ) : (
          Object.entries(grouped).map(([date, dateMatches]) => (
            <div key={date} className="mb-6">
              <div className="date-divider">{date}</div>
              <div className="grid gap-4 sm:grid-cols-2">
                {dateMatches.map((match, i) => (
                  <div key={match.id} className={`animate-fade-in-up stagger-${Math.min(i + 1, 8)}`}>
                    <MatchCard
                      match={match}
                      prediction={predictions[match.id]}
                      onSave={handleSave}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))
        )}


      </main>

      <EditProfileModal
        isOpen={isEditingProfile}
        onClose={() => setIsEditingProfile(false)}
        profile={profile}
        onSave={(updatedProfile) => setProfile(updatedProfile)}
      />
    </div>
  );
}
