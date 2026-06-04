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
  const [confirmEmail, setConfirmEmail] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [formData, setFormData] = useState({
    email: '',
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
    };
    check();
  }, [router]);

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

    const { error: uploadError } = await supabase.storage
      .from('Profile pics')
      .upload(filePath, avatarFile, { upsert: true });

    if (uploadError) {
      console.error('Avatar upload error:', uploadError);
      return null;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('Profile pics')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    if (mode === 'signin') {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: formData.email,
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
        email: formData.email,
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
          setError('An account with this email already exists.');
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

        setConfirmEmail(formData.email);
        setLoading(false);
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
        <div className="absolute bottom-0 left-0 w-64 h-64 opacity-[0.04]"
          style={{ background: 'radial-gradient(circle, var(--accent-blue) 0%, transparent 70%)' }}
        />

        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl font-bold tracking-tight" style={{ color: 'var(--text)' }}>Champion</span>
            <span className="text-xl font-bold" style={{ color: 'var(--accent)' }}>EX</span>
          </div>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>FIFA World Cup 2026</p>
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

        <div className="flex gap-8 relative z-10">
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

      {/* Right panel — auth form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12" style={{ background: 'var(--bg)' }}>
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text)' }}>Champion</span>
              <span className="text-2xl font-bold" style={{ color: 'var(--accent)' }}>EX</span>
            </div>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>FIFA World Cup 2026 Predictions</p>
          </div>

          {/* Email confirmation screen */}
          {confirmEmail ? (
            <div className="text-center animate-fade-in-up">
              {/* Envelope icon */}
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
                style={{ background: 'var(--accent-dim)' }}
              >
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="4" width="20" height="16" rx="3" />
                  <path d="M2 7l10 7 10-7" />
                </svg>
              </div>

              <h2 className="text-2xl font-bold tracking-tight mb-2" style={{ color: 'var(--text)' }}>
                Check your inbox
              </h2>
              <p className="text-sm mb-2 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                We sent a confirmation link to
              </p>
              <p className="text-sm font-semibold mb-6" style={{ color: 'var(--accent)' }}>
                {confirmEmail}
              </p>
              <p className="text-sm mb-8 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                Click the link in the email to activate your account. It may take a minute to arrive — check your spam folder too.
              </p>

              <button
                onClick={() => {
                  setConfirmEmail(null);
                  setMode('signin');
                  setFormData({ email: confirmEmail, password: '', fullName: '' });
                  setAvatarFile(null);
                  setAvatarPreview(null);
                }}
                className="btn-primary text-sm w-full"
              >
                Back to sign in
              </button>

              <button
                onClick={() => {
                  setConfirmEmail(null);
                  setMode('signup');
                  setFormData({ email: '', password: '', fullName: '' });
                  setAvatarFile(null);
                  setAvatarPreview(null);
                }}
                className="btn-ghost text-xs mt-4 w-full"
              >
                Use a different email
              </button>
            </div>
          ) : (
          <>

          {/* Mode toggle */}
          <div
            className="flex rounded-lg p-1 mb-8"
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}
          >
            <button
              onClick={() => switchMode('signin')}
              className="flex-1 py-2.5 text-sm font-semibold rounded-md transition-all duration-200"
              style={mode === 'signin'
                ? { background: 'var(--accent)', color: '#1a1d27' }
                : { color: 'var(--text-muted)' }
              }
            >
              Sign in
            </button>
            <button
              onClick={() => switchMode('signup')}
              className="flex-1 py-2.5 text-sm font-semibold rounded-md transition-all duration-200"
              style={mode === 'signup'
                ? { background: 'var(--accent)', color: '#1a1d27' }
                : { color: 'var(--text-muted)' }
              }
            >
              Sign up
            </button>
          </div>

          <h2 className="text-2xl font-bold tracking-tight mb-1" style={{ color: 'var(--text)' }}>
            {mode === 'signin' ? 'Welcome back' : 'Create your account'}
          </h2>
          <p className="text-sm mb-8" style={{ color: 'var(--text-muted)' }}>
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

          <form onSubmit={handleSubmit} className="space-y-4">
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
                Email
              </label>
              <input
                type="email"
                required
                className="input-field"
                placeholder="you@example.com"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
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
              className="btn-primary w-full text-sm mt-2"
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
          </>
          )}
        </div>
      </div>
    </div>
  );
}
