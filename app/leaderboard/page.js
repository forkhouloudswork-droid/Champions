import React from 'react';

export default function Leaderboard() {
  // In a real implementation, this would fetch from Supabase 'profiles' table ordered by 'points'
  const mockUsers = [
    { rank: 1, name: 'Alex Johnson', points: 450 },
    { rank: 2, name: 'Sarah Smith', points: 425 },
    { rank: 3, name: 'Michael Brown', points: 390 },
    { rank: 4, name: 'You', points: 128 },
    { rank: 5, name: 'Emma Davis', points: 110 },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full animate-fade-in">
      <div className="glass p-8 md:p-12 rounded-3xl relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-[40%] bg-purple-500/10 blur-[80px] pointer-events-none" />
        
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-5xl font-bold mb-4">Global Leaderboard</h1>
          <p className="text-slate-400 text-lg">See who is the ultimate champion.</p>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-12 gap-4 px-6 py-3 text-sm font-medium text-slate-400 uppercase tracking-wider">
            <div className="col-span-2 text-center">Rank</div>
            <div className="col-span-7">Player</div>
            <div className="col-span-3 text-right">Points</div>
          </div>

          {mockUsers.map((user, index) => (
            <div 
              key={index} 
              className={`grid grid-cols-12 gap-4 px-6 py-4 rounded-xl items-center transition-all ${
                user.name === 'You' ? 'bg-blue-600/20 border border-blue-500/50' : 'bg-slate-800/40 hover:bg-slate-800/60'
              }`}
            >
              <div className="col-span-2 text-center">
                <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold ${
                  user.rank === 1 ? 'bg-yellow-500/20 text-yellow-500' :
                  user.rank === 2 ? 'bg-slate-300/20 text-slate-300' :
                  user.rank === 3 ? 'bg-orange-500/20 text-orange-400' : 'text-slate-400'
                }`}>
                  {user.rank}
                </span>
              </div>
              <div className="col-span-7 font-semibold text-lg flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs">
                  {user.name.charAt(0)}
                </div>
                {user.name}
              </div>
              <div className="col-span-3 text-right font-bold text-xl text-blue-400">
                {user.points}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
