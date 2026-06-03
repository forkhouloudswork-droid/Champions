import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex-grow flex items-center justify-center min-h-[90vh]">
      <div className="glass p-12 md:p-20 rounded-3xl max-w-4xl w-full mx-4 text-center animate-fade-in relative overflow-hidden">
        {/* Subtle inner glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1/2 bg-blue-500/10 blur-[80px] pointer-events-none" />
        
        <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
          Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">ChampionEX</span>
        </h1>
        
        <p className="text-lg md:text-xl text-slate-300 mb-10 max-w-2xl mx-auto leading-relaxed">
          The ultimate platform to test your football knowledge. Predict FIFA World Cup match results, climb the global leaderboard, and prove you're the ultimate champion.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
          <Link href="/signup" className="btn-primary text-lg px-8 py-4 w-full sm:w-auto text-center">
            Start Predicting Now
          </Link>
          <Link href="/login" className="text-slate-300 hover:text-white transition-colors duration-200 font-medium text-lg px-8 py-4">
            Log In to Account
          </Link>
        </div>
        
        <div className="mt-16 pt-8 border-t border-slate-700/50 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center mb-4 text-blue-400">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="font-semibold text-lg mb-2">Live API Data</h3>
            <p className="text-sm text-slate-400">Real-time match updates powered by the best public APIs.</p>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center mb-4 text-purple-400">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="font-semibold text-lg mb-2">Dynamic Leaderboard</h3>
            <p className="text-sm text-slate-400">Compete with coworkers and friends to reach rank #1.</p>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center mb-4 text-green-400">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="font-semibold text-lg mb-2">Fair Point System</h3>
            <p className="text-sm text-slate-400">Earn points for exact scores, goal diffs, or picking the winner.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
