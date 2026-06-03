export default function Dashboard() {
  // In a real implementation, we would fetch session and user data from Supabase here
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full animate-fade-in">
      <div className="flex flex-col md:flex-row gap-8">
        
        {/* User Stats Panel */}
        <div className="w-full md:w-1/3 space-y-6">
          <div className="glass p-8 rounded-2xl flex flex-col items-center text-center relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full blur-[40px] pointer-events-none -mr-10 -mt-10" />
            
            <div className="w-24 h-24 rounded-full bg-slate-700 mb-4 border-2 border-blue-500 overflow-hidden flex items-center justify-center text-3xl font-bold">
              U
            </div>
            <h2 className="text-2xl font-bold">Your Stats</h2>
            
            <div className="w-full mt-8 space-y-4">
              <div className="bg-slate-800/50 p-4 rounded-xl flex justify-between items-center">
                <span className="text-slate-400">Total Points</span>
                <span className="text-2xl font-bold text-blue-400">128</span>
              </div>
              <div className="bg-slate-800/50 p-4 rounded-xl flex justify-between items-center">
                <span className="text-slate-400">Global Rank</span>
                <span className="text-2xl font-bold text-purple-400">#42</span>
              </div>
            </div>
          </div>
        </div>

        {/* Predictions Panel */}
        <div className="w-full md:w-2/3">
          <div className="glass p-8 rounded-2xl h-full">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Upcoming Matches</h2>
            </div>
            
            <div className="space-y-4">
              {/* Mock Match Card */}
              <div className="bg-slate-800/40 p-6 rounded-xl border border-slate-700/50 hover:border-blue-500/50 transition-colors">
                <div className="flex justify-between text-sm text-slate-400 mb-4">
                  <span>Group Stage - Matchday 1</span>
                  <span>Tomorrow, 20:00</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex flex-col items-center gap-2 w-1/3">
                    <span className="font-semibold text-lg">Brazil</span>
                  </div>
                  
                  <div className="flex items-center gap-4 w-1/3 justify-center">
                    <input type="number" className="w-12 h-12 text-center bg-slate-900 border border-slate-600 rounded-lg text-xl" defaultValue="0" />
                    <span className="text-xl font-bold text-slate-500">-</span>
                    <input type="number" className="w-12 h-12 text-center bg-slate-900 border border-slate-600 rounded-lg text-xl" defaultValue="0" />
                  </div>
                  
                  <div className="flex flex-col items-center gap-2 w-1/3">
                    <span className="font-semibold text-lg">France</span>
                  </div>
                </div>
                
                <div className="mt-6 flex justify-end">
                  <button className="btn-primary text-sm px-6 py-2">Save Prediction</button>
                </div>
              </div>
              
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
}
