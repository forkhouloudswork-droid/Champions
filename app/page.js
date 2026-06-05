"use client";
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function Home() {
  const router = useRouter();
  const fileInputRef = useRef(null);
  const [mode, setMode] = useState('signin');
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [userCount, setUserCount] = useState(0);
  const [displayCount, setDisplayCount] = useState(0);
  const [formData, setFormData] = useState({
    workdayId: '',
    password: '',
    fullName: '',
  });

  useEffect(() => {
    const check = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.push('/leaderboard');
      } else {
        setChecking(false);
      }
      
      const { count } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });
      if (count !== null) setUserCount(count);
    };
    check();
  }, [router]);

  useEffect(() => {
    if (userCount === 0) return;
    let start = 0;
    const duration = 2000;
    const increment = userCount / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= userCount) {
        setDisplayCount(userCount);
        clearInterval(timer);
      } else {
        setDisplayCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [userCount]);

  const handleAvatarSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setError('Image must be under 2MB');
      return;
    }
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const uploadAvatar = async (userId) => {
    if (!avatarFile) return null;
    const fileExt = avatarFile.name.split('.').pop();
    const filePath = `${userId}/avatar.${fileExt}`;

    try {
      // 1. Get signed URL
      const res = await fetch('/api/upload-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filePath, contentType: avatarFile.type || 'image/jpeg' })
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'Failed to get upload URL');

      // 2. Upload directly to S3
      const uploadRes = await fetch(data.signedUrl, {
        method: 'PUT',
        body: avatarFile,
        headers: {
          'Content-Type': avatarFile.type || 'image/jpeg'
        }
      });

      if (!uploadRes.ok) throw new Error('Failed to upload file to S3');

      // 3. Get the public URL from Supabase standard client
      const { data: { publicUrl } } = supabase.storage
        .from('Profile pics')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (err) {
      console.error('Avatar upload error:', err);
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    const syntheticEmail = `${formData.workdayId}@workday.local`;

    if (mode === 'signin') {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: syntheticEmail,
        password: formData.password,
      });
      if (signInError) {
        setError(signInError.message);
        setLoading(false);
        return;
      }
      if (data?.user) router.push('/leaderboard');
    } else {
      // Sign up
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: syntheticEmail,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
          }
        }
      });
      if (signUpError) {
        setError(signUpError.message);
        setLoading(false);
        return;
      }
      if (data?.user) {
        if (data.user.identities?.length === 0) {
          setError('An account with this Workday ID already exists.');
          setLoading(false);
          return;
        }

        // Upload avatar if provided
        let avatarUrl = null;
        if (avatarFile) {
          avatarUrl = await uploadAvatar(data.user.id);
        }

        // Update profile with avatar URL
        if (avatarUrl) {
          await supabase
            .from('profiles')
            .update({ avatar_url: avatarUrl })
            .eq('id', data.user.id);
        }

        router.push('/leaderboard');
      }
    }
  };

  const switchMode = (newMode) => {
    setMode(newMode);
    setError(null);
    setSuccess(null);
  };

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
        <div className="w-8 h-8 rounded-full border-2 animate-spin" style={{ borderColor: 'var(--border)', borderTopColor: 'var(--accent)' }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left panel — branding */}
      <div
        className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0f1117 0%, #1a1d27 50%, #1a1825 100%)' }}
      >
        <div className="absolute top-0 right-0 w-96 h-96 opacity-[0.03]"
          style={{ background: 'radial-gradient(circle, var(--accent) 0%, transparent 70%)' }}
        />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] h-[90%] opacity-[0.03] pointer-events-none flex items-center justify-center">
          <img src="/2026_FIFA_World_Cup_emblem.svg" alt="" className="w-full h-full object-contain" style={{ filter: 'brightness(0) invert(1)' }} />
        </div>
        <div className="absolute bottom-0 left-0 w-64 h-64 opacity-[0.04]"
          style={{ background: 'radial-gradient(circle, var(--accent-blue) 0%, transparent 70%)' }}
        />

        <div>
          <div className="flex items-center mb-2">
            <img src="/CEX.png" alt="ChampionEX" className="h-8 w-auto" style={{ filter: 'brightness(0) invert(1)' }} />
          </div>
          <div className="flex items-center gap-2">
            <img src="/2026_FIFA_World_Cup_emblem.svg" alt="FIFA 2026 Emblem" className="h-5 w-auto opacity-80" style={{ filter: 'brightness(0) invert(1)' }} />
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>FIFA World Cup 2026</p>
          </div>
        </div>

        <div className="relative z-10">
          <h1 className="text-5xl font-bold tracking-tight leading-tight mb-6" style={{ color: 'var(--text)' }}>
            Your predictions.<br />
            <span style={{ color: 'var(--accent)' }}>Your glory.</span>
          </h1>
          <p className="text-lg leading-relaxed max-w-md" style={{ color: 'var(--text-secondary)' }}>
            Call the scores before kickoff. Climb the leaderboard. Settle the debate about who really knows football.
          </p>
        </div>

        <div className="flex items-end justify-between relative z-10 w-full">
          <div className="flex gap-8">
            {[
              { value: '48', label: 'Teams' },
              { value: '104', label: 'Matches' },
              { value: 'Live', label: 'Scoring' },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-2xl font-bold" style={{ color: 'var(--text)' }}>{stat.value}</div>
                <div className="text-xs uppercase tracking-wider mt-1" style={{ color: 'var(--text-muted)' }}>{stat.label}</div>
              </div>
            ))}
          </div>


        </div>
      </div>

      {/* Right panel — auth form */}
      <div className="flex-1 flex items-center justify-center p-8 py-16 lg:p-16" style={{ background: 'var(--bg)' }}>
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="flex items-center justify-center mb-2">
              <img src="/CEX.png" alt="ChampionEX" className="h-8 w-auto" style={{ filter: 'brightness(0) invert(1)' }} />
            </div>
            <div className="flex items-center justify-center gap-2">
              <img src="/2026_FIFA_World_Cup_emblem.svg" alt="FIFA 2026 Emblem" className="h-4 w-auto opacity-80" style={{ filter: 'brightness(0) invert(1)' }} />
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>FIFA World Cup 2026 Predictions</p>
            </div>
          </div>


          {/* Ticking Counter */}
          {userCount > 0 && (
            <div className="mb-10 text-center animate-fade-in-up">
              <div 
                className="text-6xl sm:text-7xl font-black mb-2 tracking-tighter tabular-nums" 
                style={{ 
                  color: 'var(--text)',
                  textShadow: '0 4px 12px rgba(0,0,0,0.5)',
                  lineHeight: '1'
                }}
              >
                {displayCount.toLocaleString()}
              </div>
              <div className="text-xs uppercase tracking-widest font-bold" style={{ color: 'var(--accent)' }}>
                Compete with {userCount.toLocaleString()} people to be on the top
              </div>
            </div>
          )}

          {/* Mode toggle */}
          <div
            className="flex rounded-lg p-1.5 mb-10"
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}
          >
            <button
              onClick={() => switchMode('signin')}
              className="flex-1 py-3 text-sm font-bold rounded-md transition-all duration-200 shadow-sm"
              style={mode === 'signin'
                ? { background: 'var(--accent)', color: '#1a1d27' }
                : { color: 'var(--text-muted)', boxShadow: 'none' }
              }
            >
              Sign in
            </button>
            <button
              onClick={() => switchMode('signup')}
              className="flex-1 py-3 text-sm font-bold rounded-md transition-all duration-200 shadow-sm"
              style={mode === 'signup'
                ? { background: 'var(--accent)', color: '#1a1d27' }
                : { color: 'var(--text-muted)', boxShadow: 'none' }
              }
            >
              Sign up
            </button>
          </div>

          <h2 className="text-3xl font-black tracking-tight mb-2" style={{ color: 'var(--text)' }}>
            {mode === 'signin' ? 'Welcome back' : 'Create your account'}
          </h2>
          <p className="text-base mb-10" style={{ color: 'var(--text-muted)' }}>
            {mode === 'signin'
              ? 'Enter your credentials to continue'
              : 'Join the prediction game'}
          </p>

          {error && (
            <div
              className="mb-6 p-3 text-sm rounded-lg"
              style={{ background: 'var(--accent-red-dim)', color: 'var(--accent-red)', border: '1px solid rgba(239,83,80,0.2)' }}
            >
              {error}
            </div>
          )}

          {success && (
            <div
              className="mb-6 p-3 text-sm rounded-lg"
              style={{ background: 'var(--accent-green-dim)', color: 'var(--accent-green)', border: '1px solid rgba(61,214,140,0.2)' }}
            >
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {mode === 'signup' && (
              <>
                {/* Avatar upload */}
                <div className="flex flex-col items-center mb-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="relative group"
                  >
                    {avatarPreview ? (
                      <img
                        src={avatarPreview}
                        alt="Avatar preview"
                        className="w-20 h-20 rounded-full object-cover transition-opacity group-hover:opacity-80"
                        style={{ border: '3px solid var(--accent)' }}
                      />
                    ) : (
                      <div
                        className="w-20 h-20 rounded-full flex flex-col items-center justify-center transition-all group-hover:border-accent"
                        style={{ background: 'var(--bg-surface)', border: '2px dashed var(--border)' }}
                      >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5">
                          <path d="M12 16V8M8 12l4-4 4 4" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M3 16.5V18a3 3 0 003 3h12a3 3 0 003-3v-1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                    )}
                    <div
                      className="absolute inset-0 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ background: 'rgba(0,0,0,0.5)' }}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                        <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" strokeLinecap="round" strokeLinejoin="round"/>
                        <circle cx="12" cy="13" r="4" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarSelect}
                  />
                  <span className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
                    {avatarPreview ? 'Tap to change' : 'Add a profile photo'}
                  </span>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    className="input-field"
                    placeholder="Your name"
                    value={formData.fullName}
                    onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                Workday ID
              </label>
              <input
                type="text"
                required
                className="input-field"
                placeholder="e.g. 123456"
                value={formData.workdayId}
                onChange={(e) => setFormData({...formData, workdayId: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                Password
              </label>
              <input
                type="password"
                required
                className="input-field"
                placeholder="••••••••"
                minLength={6}
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full text-base py-3.5 mt-4 shadow-lg font-bold"
            >
              {loading
                ? (mode === 'signin' ? 'Signing in...' : 'Creating account...')
                : (mode === 'signin' ? 'Sign in' : 'Create account')
              }
            </button>
          </form>

          <p className="text-center text-xs mt-8" style={{ color: 'var(--text-muted)' }}>
            {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
            <button
              onClick={() => switchMode(mode === 'signin' ? 'signup' : 'signin')}
              className="font-medium underline underline-offset-2"
              style={{ color: 'var(--text-secondary)' }}
            >
              {mode === 'signin' ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
