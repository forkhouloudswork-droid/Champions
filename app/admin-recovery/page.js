"use client";
import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Header from '@/components/Header';

export default function AdminRecoveryPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedUserId, setSelectedUserId] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [updateStatus, setUpdateStatus] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === 'arduino') {
      setAuthenticated(true);
      setError('');
    } else {
      setError('Wrong password');
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
      setUpdateStatus('Please select a user.');
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      setUpdateStatus('Password must be at least 6 characters.');
      return;
    }

    setIsUpdating(true);
    
    try {
      const res = await fetch('/api/admin/update-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          adminPassword: password, // Send the correct admin password
          userId: selectedUserId,
          newPassword: newPassword
        })
      });
      
      const data = await res.json();
      
      if (res.ok && data.success) {
        setUpdateStatus('✅ Password updated successfully!');
        setNewPassword(''); // Clear the password field
      } else {
        setUpdateStatus(`❌ Error: ${data.error || 'Unknown error'}`);
      }
    } catch (err) {
      setUpdateStatus('❌ Network error updating password.');
    } finally {
      setIsUpdating(false);
    }
  };

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
                <div className="text-3xl mb-3">🛠️</div>
                <h1 className="text-xl font-bold" style={{ color: 'var(--text)' }}>
                  Admin Tools
                </h1>
                <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                  Enter admin password to access recovery tools
                </p>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Admin Password"
                className="input-field mb-4 w-full"
                autoFocus
              />
              {error && (
                <p className="text-xs mb-3 text-center" style={{ color: 'var(--accent-red)' }}>
                  {error}
                </p>
              )}
              <button type="submit" className="btn-primary w-full text-sm py-3">
                Access Admin Area
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg)' }}>
      <Header />
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 sm:px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight mb-2" style={{ color: 'var(--text)' }}>
            🔑 Password Recovery
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Forcefully update the password for any registered user.
          </p>
        </div>

        {loading ? (
          <div className="space-y-4">
            <div className="skeleton h-40 w-full rounded-2xl" />
          </div>
        ) : (
          <div className="rounded-2xl p-6 sm:p-8" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
            <form onSubmit={handleUpdatePassword} className="space-y-5">
              
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text)' }}>
                  Select User
                </label>
                <select
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  className="input-field w-full text-sm py-3"
                  style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
                >
                  <option value="">-- Choose a user --</option>
                  {profiles.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.full_name || 'Anonymous'} {p.email ? `(${p.email})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text)' }}>
                  New Password
                </label>
                <input
                  type="text"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password (min 6 chars)"
                  className="input-field w-full text-sm py-3"
                  style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
                />
              </div>

              <button
                type="submit"
                disabled={isUpdating}
                className="btn-primary w-full py-3 mt-2 font-bold text-sm"
                style={{ opacity: isUpdating ? 0.7 : 1 }}
              >
                {isUpdating ? 'Updating...' : 'Update Password'}
              </button>

              {updateStatus && (
                <div className="mt-4 p-3 rounded-lg text-sm font-medium text-center" 
                     style={{ 
                       background: updateStatus.includes('✅') ? 'var(--accent-green-dim)' : 'var(--accent-red-dim)',
                       color: updateStatus.includes('✅') ? 'var(--accent-green)' : 'var(--accent-red)'
                     }}>
                  {updateStatus}
                </div>
              )}
            </form>
          </div>
        )}
      </main>
    </div>
  );
}
