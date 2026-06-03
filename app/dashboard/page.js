"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import CountryFlag from '@/components/CountryFlag';

export default function Dashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [rank, setRank] = useState('-');
  const [matches, setMatches] = useState([]);
  const [predictions, setPredictions] = useState({});

  useEffect(() => {
    const fetchDashboardData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push('/login');
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
        const userRank = allProfiles.findIndex(p => p.id === session.user.id) + 1;
        setRank(userRank > 0 ? `#${userRank}` : '-');
      }

      // Fetch Upcoming Matches
      const { data: upcomingMatches } = await supabase
        .from('matches')
        .select('*')
        .eq('status', 'upcoming')
        .order('start_time', { ascending: true });
      
      if (upcomingMatches) setMatches(upcomingMatches);

      // Fetch User Predictions for these matches
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
            modifications: p.modifications || 0
          };
        });
        setPredictions(predMap);
      }

      setLoading(false);
    };

    fetchDashboardData();
  }, [router]);

  const handlePredictionChange = (matchId, team, value) => {
    setPredictions(prev => ({
      ...prev,
      [matchId]: {
        ...prev[matchId],
        [`${team}_score`]: parseInt(value) || 0
      }
    }));
  };

  const savePrediction = async (matchId) => {
    const pred = predictions[matchId];
    if (!pred || pred.home_score === undefined || pred.away_score === undefined) return;

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    if (pred.id) {
      // Update
      await supabase
        .from('predictions')
        .update({ 
          home_score: pred.home_score, 
          away_score: pred.away_score,
          modifications: pred.modifications + 1
        })
        .eq('id', pred.id);
      
      // Update local modification count
      setPredictions(prev => ({
        ...prev,
        [matchId]: { ...prev[matchId], modifications: pred.modifications + 1 }
      }));
    } else {
      // Insert
      const { data } = await supabase
        .from('predictions')
        .insert({
          user_id: session.user.id,
          match_id: matchId,
          home_score: pred.home_score,
          away_score: pred.away_score
        })
        .select()
        .single();
        
      if (data) {
        setPredictions(prev => ({
          ...prev,
          [matchId]: { ...prev[matchId], id: data.id, modifications: 0 }
        }));
      }
    }
    alert('Prediction saved!');
  };

  if (loading) {
    return <div className="p-12 text-center text-muted-foreground">Loading dashboard...</div>;
  }

  return (
    <div className="w-full">
      <h1 className="text-3xl font-bold mb-8 tracking-tight">Dashboard</h1>
      
      <div className="flex flex-col md:flex-row gap-8">
        {/* User Stats Panel */}
        <div className="w-full md:w-1/3">
          <div className="card">
            <h2 className="text-xl font-semibold mb-6 border-b border-border pb-4">Your Stats</h2>
            
            <div className="flex flex-col items-center mb-6">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="Avatar" className="w-20 h-20 rounded-full border border-border mb-3 object-cover" />
              ) : (
                <div className="w-20 h-20 rounded-full bg-muted border border-border flex items-center justify-center text-2xl font-bold mb-3 uppercase">
                  {profile?.full_name?.charAt(0) || 'U'}
                </div>
              )}
              <p className="font-medium">{profile?.full_name || 'User'}</p>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-muted/50 rounded-md border border-border">
                <span className="text-muted-foreground text-sm font-medium">Total Points</span>
                <span className="text-lg font-bold">{profile?.points || 0}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-muted/50 rounded-md border border-border">
                <span className="text-muted-foreground text-sm font-medium">Global Rank</span>
                <span className="text-lg font-bold">{rank}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Predictions Panel */}
        <div className="w-full md:w-2/3">
          <div className="card h-full">
            <h2 className="text-xl font-semibold mb-6 border-b border-border pb-4">Upcoming Matches</h2>
            
            <div className="space-y-4">
              {matches.length === 0 ? (
                <p className="text-muted-foreground text-sm p-4 text-center">No upcoming matches available right now.</p>
              ) : (
                matches.map((match) => (
                  <div key={match.id} className="p-5 rounded-lg border border-border hover:border-primary/50 transition-colors">
                    <div className="flex justify-between text-xs font-medium text-muted-foreground mb-4 uppercase tracking-wider">
                      <span>{new Date(match.start_time).toLocaleDateString()}</span>
                      <span>{new Date(match.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col items-center gap-2 w-1/3 text-center">
                        <CountryFlag code={match.home_team_code} name={match.home_team} size={40} />
                        <span className="font-semibold text-sm mt-2">{match.home_team}</span>
                      </div>
                      
                      <div className="flex items-center gap-3 w-1/3 justify-center">
                        <input 
                          type="number" 
                          min="0"
                          value={predictions[match.id]?.home_score ?? ''}
                          onChange={(e) => handlePredictionChange(match.id, 'home', e.target.value)}
                          className="w-12 h-12 text-center bg-background border border-border rounded-md text-lg focus:outline-none focus:ring-2 focus:ring-border focus:border-primary" 
                          placeholder="-"
                        />
                        <span className="text-muted-foreground font-bold">-</span>
                        <input 
                          type="number" 
                          min="0"
                          value={predictions[match.id]?.away_score ?? ''}
                          onChange={(e) => handlePredictionChange(match.id, 'away', e.target.value)}
                          className="w-12 h-12 text-center bg-background border border-border rounded-md text-lg focus:outline-none focus:ring-2 focus:ring-border focus:border-primary" 
                          placeholder="-"
                        />
                      </div>
                      
                      <div className="flex flex-col items-center gap-2 w-1/3 text-center">
                        <CountryFlag code={match.away_team_code} name={match.away_team} size={40} />
                        <span className="font-semibold text-sm mt-2">{match.away_team}</span>
                      </div>
                    </div>
                    
                    <div className="mt-6 flex justify-between items-center border-t border-border pt-4">
                      <span className="text-xs text-muted-foreground">
                        {predictions[match.id]?.modifications > 0 
                          ? `Modified ${predictions[match.id].modifications} time(s) - ${(predictions[match.id].modifications * 10)}% penalty applied` 
                          : 'No modifications yet (0% penalty)'}
                      </span>
                      <button 
                        onClick={() => savePrediction(match.id)}
                        className="btn-secondary text-sm"
                      >
                        {predictions[match.id]?.id ? 'Update Prediction' : 'Save Prediction'}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
