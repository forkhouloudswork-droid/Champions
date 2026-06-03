import React from 'react';

export default function Leaderboard() {
  const mockUsers = [
    { rank: 1, name: 'Alex Johnson', points: 450 },
    { rank: 2, name: 'Sarah Smith', points: 425 },
    { rank: 3, name: 'Michael Brown', points: 390 },
    { rank: 4, name: 'You', points: 128 },
    { rank: 5, name: 'Emma Davis', points: 110 },
  ];

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Leaderboard</h1>
        <p className="text-muted-foreground">Global rankings based on total points.</p>
      </div>

      <div className="card p-0 overflow-hidden">
        <div className="grid grid-cols-12 gap-4 p-4 border-b border-border bg-muted/30 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          <div className="col-span-2 text-center">Rank</div>
          <div className="col-span-7">Player</div>
          <div className="col-span-3 text-right">Points</div>
        </div>

        <div className="divide-y divide-border">
          {mockUsers.map((user, index) => (
            <div 
              key={index} 
              className={`grid grid-cols-12 gap-4 p-4 items-center transition-colors hover:bg-muted/30 ${
                user.name === 'You' ? 'bg-primary/5' : ''
              }`}
            >
              <div className="col-span-2 text-center font-medium">
                {user.rank}
              </div>
              <div className="col-span-7 font-medium flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-muted border border-border flex items-center justify-center text-[10px]">
                  {user.name.charAt(0)}
                </div>
                {user.name}
              </div>
              <div className="col-span-3 text-right font-bold">
                {user.points}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
