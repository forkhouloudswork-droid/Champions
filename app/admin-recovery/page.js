"use client";
import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import Header from '@/components/Header';

// ─── The Sarcasm Engine™ ───
const ROAST_CAROUSEL = [
  { emoji: '🧠', text: "Wow. Someone forgot their password. Truly unprecedented. Nobel Prize in originality." },
  { emoji: '🔐', text: "Let me guess… they tried 'password123' and are shocked it didn't work?" },
  { emoji: '🤦', text: "Another day, another user treating their memory like a free trial they never renewed." },
  { emoji: '💀', text: "Tell them to write it on a sticky note next time. Or a tattoo. Whatever works." },
  { emoji: '🎪', text: "Welcome to the circus. You're the clown wrangler now." },
  { emoji: '🧓', text: "In the old days, we just remembered things. With our brains. Wild concept." },
  { emoji: '🪦', text: "Here lies their old password. Gone but definitely not remembered." },
  { emoji: '🏆', text: "Achievement unlocked: IT Support Desk Simulator 2026." },
  { emoji: '🤡', text: "Plot twist: they'll forget this new password too. See you in 3 days." },
  { emoji: '📞', text: "You should start charging per recovery. Rent is due." },
  { emoji: '🧊', text: "Their password memory is colder than their World Cup predictions." },
  { emoji: '🫠', text: "This is fine. Everything is fine. You love doing this." },
];

const LOGIN_WRONG_PASSWORDS = [
  "Nope. Try again, genius.",
  "Wrong. Shocking.",
  "That's not it. Have you tried remembering?",
  "Incorrect. Maybe write YOUR password down too?",
  "Still wrong. The irony of forgetting the admin password on a password recovery page is chef's kiss.",
  "No. Just… no.",
  "Are you sure you're the admin? Because this is embarrassing.",
];

const SUCCESS_MESSAGES = [
  "✅ Done. Password updated. Start the countdown until they forget this one too.",
  "✅ Password changed. You're basically a charity at this point.",
  "✅ Updated! That'll be dh50. CIH works.",
  "✅ New password set. They owe you their life. Or at least a coffee.",
  "✅ Success! Their digital amnesia has been cured. Temporarily.",
  "✅ Password reset complete. You are the unsung hero nobody asked for.",
];

const ERROR_NO_USER = [
  "Pick a victim first. The dropdown isn't decoration.",
  "You forgot to select a user. Is forgetting things contagious?",
  "Select someone from the list. It's a dropdown, not a suggestion box.",
];

const ERROR_SHORT_PASSWORD = [
  "6 characters minimum. Even their memory isn't THAT bad.",
  "That password is shorter than their attention span. Try 6+ characters.",
  "Come on, at least give them a fighting chance. 6 characters minimum.",
];

function randomFrom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export default function AdminRecoveryPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [wrongAttempts, setWrongAttempts] = useState(0);

  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedUserId, setSelectedUserId] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [updateStatus, setUpdateStatus] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [recoveryCount, setRecoveryCount] = useState(0);

  // Carousel state
  const [currentRoast, setCurrentRoast] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Auto-rotate the carousel
  useEffect(() => {
    if (!authenticated) return;
    const interval = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentRoast(prev => (prev + 1) % ROAST_CAROUSEL.length);
        setIsTransitioning(false);
      }, 400);
    }, 4500);
    return () => clearInterval(interval);
  }, [authenticated]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === 'arduino') {
      setAuthenticated(true);
      setError('');
    } else {
      const idx = Math.min(wrongAttempts, LOGIN_WRONG_PASSWORDS.length - 1);
      setError(LOGIN_WRONG_PASSWORDS[idx]);
      setWrongAttempts(prev => prev + 1);
    }
  };

  useEffect(() => {
    if (!authenticated) return;

    const fetchProfiles = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .order('full_name', { ascending: true });

      if (data) setProfiles(data);
      setLoading(false);
    };

    fetchProfiles();
  }, [authenticated]);

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setUpdateStatus('');

    if (!selectedUserId) {
      setUpdateStatus(`❌ ${randomFrom(ERROR_NO_USER)}`);
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      setUpdateStatus(`❌ ${randomFrom(ERROR_SHORT_PASSWORD)}`);
      return;
    }

    setIsUpdating(true);

    try {
      const res = await fetch('/api/admin/update-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminPassword: password,
          userId: selectedUserId,
          newPassword: newPassword
        })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setUpdateStatus(randomFrom(SUCCESS_MESSAGES));
        setNewPassword('');
        setRecoveryCount(prev => prev + 1);
      } else {
        setUpdateStatus(`❌ Even the server is judging you: ${data.error || 'Unknown error'}`);
      }
    } catch (err) {
      setUpdateStatus('❌ Network error. The universe is trying to tell you something.');
    } finally {
      setIsUpdating(false);
    }
  };

  const getSelectedUserName = useCallback(() => {
    const user = profiles.find(p => p.id === selectedUserId);
    return user?.full_name || 'this person';
  }, [selectedUserId, profiles]);

  // ─── Login Screen ───
  if (!authenticated) {
    return (
      <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg)' }}>
        <div className="flex-1 flex items-center justify-center px-4">
          <form onSubmit={handleLogin} className="w-full max-w-sm">
            <div
              className="rounded-2xl p-8 shadow-xl"
              style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}
            >
              <div className="text-center mb-6">
                <div className="text-4xl mb-3">🧹</div>
                <h1 className="text-xl font-bold" style={{ color: 'var(--text)' }}>
                  The Janitor's Closet
                </h1>
                <p className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>
                  Someone forgot their password again, didn't they?
                </p>
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)', opacity: 0.6 }}>
                  Prove you're the one with the braincells.
                </p>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="The sacred passphrase..."
                className="input-field mb-4 w-full"
                autoFocus
              />
              {error && (
                <p className="text-xs mb-3 text-center font-medium" style={{ color: 'var(--accent-red)' }}>
                  {error}
                </p>
              )}
              <button type="submit" className="btn-primary w-full text-sm py-3">
                {wrongAttempts === 0 ? 'Enter the Shadow Realm' : wrongAttempts < 3 ? 'Try Again, Bestie' : 'Please Just Get It Right'}
              </button>
              {wrongAttempts >= 3 && (
                <p className="text-[10px] text-center mt-3" style={{ color: 'var(--text-muted)', opacity: 0.5 }}>
                  Maybe you need a password recovery page for this password recovery page.
                </p>
              )}
            </div>
          </form>
        </div>
      </div>
    );
  }

  const roast = ROAST_CAROUSEL[currentRoast];

  // ─── Main Page ───
  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg)' }}>
      <Header />
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 sm:px-6 py-8">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight mb-1" style={{ color: 'var(--text)' }}>
            🔑 The Password Graveyard
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Where forgotten passwords come to die and new ones are born (only to be forgotten again).
          </p>
          {recoveryCount > 0 && (
            <p className="text-xs mt-2 font-semibold" style={{ color: 'var(--accent)' }}>
              🏅 Passwords recovered this session: {recoveryCount} — You're practically a therapist now.
            </p>
          )}
        </div>

        {/* Sarcasm Carousel */}
        <div
          className="rounded-2xl p-5 mb-6 relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, var(--bg-surface), var(--bg-elevated))',
            border: '1px solid var(--border)',
            minHeight: '100px',
          }}
        >
          <div className="text-[10px] uppercase tracking-widest mb-3 font-semibold flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
            <span>💭 Thought of the moment</span>
            <span style={{ opacity: 0.4 }}>•</span>
            <span style={{ opacity: 0.4 }}>{currentRoast + 1}/{ROAST_CAROUSEL.length}</span>
          </div>
          <div
            className="flex items-start gap-3 transition-all duration-400"
            style={{
              opacity: isTransitioning ? 0 : 1,
              transform: isTransitioning ? 'translateY(12px)' : 'translateY(0)',
              transition: 'opacity 0.4s ease, transform 0.4s ease',
            }}
          >
            <span className="text-2xl flex-shrink-0">{roast.emoji}</span>
            <p className="text-sm font-medium leading-relaxed" style={{ color: 'var(--text)' }}>
              {roast.text}
            </p>
          </div>
          {/* Carousel dots */}
          <div className="flex justify-center gap-1.5 mt-4">
            {ROAST_CAROUSEL.map((_, i) => (
              <button
                key={i}
                onClick={() => {
                  setIsTransitioning(true);
                  setTimeout(() => { setCurrentRoast(i); setIsTransitioning(false); }, 300);
                }}
                className="rounded-full transition-all duration-300"
                style={{
                  width: i === currentRoast ? '20px' : '6px',
                  height: '6px',
                  background: i === currentRoast ? 'var(--accent)' : 'var(--border)',
                }}
              />
            ))}
          </div>
        </div>

        {/* Form */}
        {loading ? (
          <div className="space-y-4">
            <div className="skeleton h-40 w-full rounded-2xl" />
          </div>
        ) : (
          <div className="rounded-2xl p-6 sm:p-8" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
            <div className="text-center mb-6">
              <p className="text-xs italic" style={{ color: 'var(--text-muted)' }}>
                "With great power comes great annoyance" — Every admin, ever
              </p>
            </div>

            <form onSubmit={handleUpdatePassword} className="space-y-5">

              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text)' }}>
                  🎯 Which forgetful soul needs saving?
                </label>
                <select
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  className="input-field w-full text-sm py-3"
                  style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
                >
                  <option value="">-- Pick the offender --</option>
                  {profiles.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.full_name || 'Anonymous (somehow made it worse)'} {p.email ? `(${p.email})` : ''}
                    </option>
                  ))}
                </select>
                {selectedUserId && (
                  <p className="text-xs mt-1.5 italic" style={{ color: 'var(--text-muted)' }}>
                    Ah, {getSelectedUserName()}. Why am I not surprised.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text)' }}>
                  🆕 Their shiny new password (that they'll definitely forget)
                </label>
                <input
                  type="text"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Make it memorable... or don't, you'll be back here anyway"
                  className="input-field w-full text-sm py-3"
                  style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
                />
                <p className="text-[11px] mt-1.5" style={{ color: 'var(--text-muted)' }}>
                  Min 6 characters. "123456" counts technically but morally? No.
                </p>
              </div>

              <button
                type="submit"
                disabled={isUpdating}
                className="btn-primary w-full py-3 mt-2 font-bold text-sm"
                style={{ opacity: isUpdating ? 0.7 : 1 }}
              >
                {isUpdating
                  ? 'Performing digital CPR...'
                  : selectedUserId
                    ? `Resurrect ${getSelectedUserName()}'s Account`
                    : 'Rescue This Helpless User'
                }
              </button>

              {updateStatus && (
                <div className="mt-4 p-4 rounded-xl text-sm font-medium text-center leading-relaxed"
                  style={{
                    background: updateStatus.includes('✅') ? 'var(--accent-green-dim)' : 'var(--accent-red-dim)',
                    color: updateStatus.includes('✅') ? 'var(--accent-green)' : 'var(--accent-red)'
                  }}>
                  {updateStatus}
                </div>
              )}
            </form>

            {/* Footer sass */}
            <div className="mt-8 pt-5 text-center" style={{ borderTop: '1px solid var(--border-subtle)' }}>
              <p className="text-[11px]" style={{ color: 'var(--text-muted)', opacity: 0.5 }}>
                🫡 Thank you for your service. Nobody will acknowledge this.
              </p>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
