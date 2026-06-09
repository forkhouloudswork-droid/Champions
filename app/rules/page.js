"use client";
import React from 'react';
import Header from '@/components/Header';
import Link from 'next/link';

export default function RulesPage() {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg)' }}>
      <Header />
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 py-12">
        <div className="text-center mb-12 animate-fade-in-up">
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-[var(--accent)] to-[#FFD700]">
            The Rules of Champions
          </h1>
          <p className="text-lg" style={{ color: 'var(--text-muted)' }}>
            Welcome to the prediction thunderdome. Let's get one thing straight: you're probably going to be wrong. But hey, let's look at the rules anyway! 🏆
          </p>
        </div>

        <div className="space-y-8">
          {/* Base Points Section */}
          <div className="card p-6 sm:p-8 animate-fade-in-up stagger-1 relative overflow-hidden" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--accent)] opacity-5 rounded-bl-full pointer-events-none"></div>
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-3 text-[var(--text)]">
              <span className="text-[var(--accent)]">1.</span> The Basics (Points)
            </h2>
            <p className="mb-4 text-[var(--text-secondary)] leading-relaxed">
              We know math is hard, so we kept it simple. Every match is an opportunity to prove your friends you know football better than them. Here's how you earn points:
            </p>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 bg-[var(--bg-elevated)] p-4 rounded-xl border border-[var(--border-subtle)]">
                <span className="text-xl">🎯</span>
                <div>
                  <strong className="text-[var(--text)] block mb-1">Exact Score = +5 Points</strong>
                  <span className="text-sm text-[var(--text-muted)]">You predicted 2-1, it finished 2-1. You're basically Nostradamus.</span>
                </div>
              </li>
              <li className="flex items-start gap-3 bg-[var(--bg-elevated)] p-4 rounded-xl border border-[var(--border-subtle)]">
                <span className="text-xl">⚖️</span>
                <div>
                  <strong className="text-[var(--text)] block mb-1">Goal Difference = +3 Points</strong>
                  <span className="text-sm text-[var(--text-muted)]">You predicted 2-0, it finished 3-1. Both are a 2-goal diff. We'll give it to you.</span>
                </div>
              </li>
              <li className="flex items-start gap-3 bg-[var(--bg-elevated)] p-4 rounded-xl border border-[var(--border-subtle)]">
                <span className="text-xl">✅</span>
                <div>
                  <strong className="text-[var(--text)] block mb-1">Correct Winner = +2 Points</strong>
                  <span className="text-sm text-[var(--text-muted)]">You said Team A would win. They did. The score was completely off, but a win's a win.</span>
                </div>
              </li>
            </ul>
          </div>

          {/* Penalty Section */}
          <div className="card p-6 sm:p-8 animate-fade-in-up stagger-2 relative overflow-hidden" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-500 opacity-5 rounded-bl-full pointer-events-none"></div>
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-3 text-[var(--text)]">
              <span className="text-red-500">2.</span> The Indecision Penalty
            </h2>
            <p className="mb-4 text-[var(--text-secondary)] leading-relaxed">
              Oh, you want to change your prediction? Overthinking it, aren't we? Let's be real: your first instinct was probably just as bad as your second one.
            </p>
            <div className="bg-red-500/10 border border-red-500/20 p-5 rounded-xl">
              <div className="font-bold text-red-500 mb-2 flex items-center gap-2">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                Static 5% Tax
              </div>
              <p className="text-sm text-[var(--text-muted)]">
                If you modify your prediction even once, a <strong className="text-red-400">static 5% penalty</strong> is applied to whatever points you earn for that match. No matter how many times you change it after that, it's just 5%. We don't want to completely ruin you, just mildly annoy you.
              </p>
            </div>
          </div>

          {/* Golden Ball Section */}
          <div className="card p-6 sm:p-8 animate-fade-in-up stagger-3 relative overflow-hidden" style={{ background: 'var(--bg-surface)', border: '1px solid #FFD70040' }}>
            <div className="absolute inset-0 bg-gradient-to-br from-[#FFD70005] to-transparent pointer-events-none"></div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#FFD700] opacity-10 rounded-bl-full pointer-events-none"></div>
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-3 text-[#FFD700]">
              <span className="animate-pulse">⚽</span> The Golden Ball
            </h2>
            <p className="mb-4 text-[var(--text-secondary)] leading-relaxed">
              This is where legends are made. Or where you completely embarrass yourself by multiplying a zero by two (spoiler: it's still zero).
            </p>
            
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="bg-[#FFD700]/5 border border-[#FFD700]/20 p-5 rounded-xl">
                <div className="font-bold text-[#FFD700] mb-1">Double the Glory</div>
                <p className="text-sm text-[var(--text-muted)]">Activating a Golden Ball on a match adds <strong>+100%</strong> to your score if you win. A perfect 5 points becomes 10!</p>
              </div>
              <div className="bg-[#FFD700]/5 border border-[#FFD700]/20 p-5 rounded-xl">
                <div className="font-bold text-[#FFD700] mb-1">Limited Supply</div>
                <p className="text-sm text-[var(--text-muted)]">Every player gets exactly <strong>5 Golden Balls</strong> for the entire tournament. Use them wisely, or blow them all in the group stages like an amateur.</p>
              </div>
            </div>
          </div>

          <div className="text-center pt-8 animate-fade-in-up stagger-4">
            <Link href="/dashboard" className="btn-primary inline-flex items-center gap-2 px-8 py-3 text-lg font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              I Understand (Probably)
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"></path><path d="M12 5l7 7-7 7"></path></svg>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
