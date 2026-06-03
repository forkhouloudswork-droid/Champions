"use client";
import React from 'react';
import Link from 'next/link';

export default function Signup() {
  return (
    <div className="flex-grow flex items-center justify-center min-h-[80vh] px-4 py-12">
      <div className="glass p-8 md:p-12 rounded-2xl w-full max-w-md animate-fade-in relative overflow-hidden">
        <div className="absolute -top-20 -left-20 w-40 h-40 bg-purple-500/20 rounded-full blur-[40px]" />
        
        <h2 className="text-3xl font-bold mb-2 text-center">Create Account</h2>
        <p className="text-slate-400 text-center mb-8">Join ChampionEX and start predicting.</p>
        
        <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Full Name</label>
            <input type="text" className="input-field" placeholder="John Doe" />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Email Address</label>
            <input type="email" className="input-field" placeholder="you@example.com" />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
            <input type="password" className="input-field" placeholder="••••••••" />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Profile Picture URL (Optional)</label>
            <input type="url" className="input-field" placeholder="https://..." />
          </div>
          
          <button type="submit" className="btn-primary w-full py-3 text-lg mt-6">
            Create Account
          </button>
        </form>
        
        <p className="mt-8 text-center text-sm text-slate-400">
          Already have an account?{' '}
          <Link href="/login" className="text-blue-400 hover:text-blue-300 font-medium">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
