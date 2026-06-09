"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        const { data } = await supabase
          .from('profiles')
          .select('full_name, avatar_url')
          .eq('id', session.user.id)
          .single();
        if (data) setProfile(data);
      }
    };
    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      if (!session?.user) setProfile(null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    router.push('/');
  };

  const navLinks = [
    { href: '/leaderboard', label: 'Leaderboard' },
    { href: '/dashboard', label: 'Predictions' },
    { href: '/rules', label: 'Rules' },
  ];

  const initials = profile?.full_name
    ? profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  return (
    <>
    <header style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border)' }}
      className="sticky top-0 z-30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex justify-between items-center h-14">
          {/* Logo */}
          <Link href={user ? '/leaderboard' : '/'} className="flex items-center gap-2 group">
            <img 
              src="/CEX.png" 
              alt="ChampionEX" 
              className="h-6 w-auto" 
              style={{ filter: 'brightness(0) invert(1)' }} 
            />
          </Link>

          {/* Desktop nav */}
          {user && (
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors duration-150 ${
                    pathname === link.href
                      ? 'text-accent'
                      : 'text-text-secondary hover:text-text'
                  }`}
                  style={pathname === link.href ? { background: 'var(--accent-dim)', color: 'var(--accent)' } : {}}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          )}

          {/* User area */}
          {user ? (
            <div className="flex items-center gap-3">
              <div className="relative">
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="flex items-center gap-2 rounded-lg px-2 py-1 transition-colors hover:bg-bg-surface-hover"
                >
                  {profile?.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt=""
                      className="w-7 h-7 rounded-full object-cover"
                      style={{ border: '2px solid var(--border)' }}
                    />
                  ) : (
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold"
                      style={{ background: 'var(--accent-dim)', color: 'var(--accent)', border: '2px solid var(--border)' }}
                    >
                      {initials}
                    </div>
                  )}
                  <span className="text-sm font-medium hidden sm:block" style={{ color: 'var(--text-secondary)' }}>
                    {profile?.full_name?.split(' ')[0] || 'User'}
                  </span>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="hidden sm:block">
                    <path d="M3 4.5L6 7.5L9 4.5" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>

                {menuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                    <div
                      className="absolute right-0 top-full mt-2 w-48 rounded-xl py-1 z-50"
                      style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}
                    >
                      <button
                        onClick={handleSignOut}
                        className="w-full text-left px-4 py-2 text-sm transition-colors"
                        style={{ color: 'var(--accent-red)' }}
                      >
                        Sign out
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </header>

    {/* Mobile Bottom Tab Bar */}
    {user && (
      <nav 
        className="md:hidden fixed bottom-0 left-0 right-0 z-40" 
        style={{ 
          background: 'var(--bg-surface)', 
          borderTop: '1px solid var(--border)',
          paddingBottom: 'env(safe-area-inset-bottom)'
        }}
      >
        <div className="flex justify-around items-center h-[60px] px-2">
          {navLinks.map(link => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className="flex flex-col items-center justify-center w-full h-full gap-1 transition-colors"
                style={isActive ? { color: 'var(--accent)' } : { color: 'var(--text-muted)' }}
              >
                {link.href === '/leaderboard' ? (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={isActive ? "2.5" : "2"} strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="20" x2="18" y2="10" />
                    <line x1="12" y1="20" x2="12" y2="4" />
                    <line x1="6" y1="20" x2="6" y2="14" />
                  </svg>
                ) : link.href === '/rules' ? (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={isActive ? "2.5" : "2"} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                  </svg>
                ) : (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={isActive ? "2.5" : "2"} strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <circle cx="12" cy="12" r="4" />
                  </svg>
                )}
                <span className="text-[10px] font-semibold">{link.label}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    )}
    </>
  );
}
