export default function Dashboard() {
  return (
    <div className="w-full">
      <h1 className="text-3xl font-bold mb-8 tracking-tight">Dashboard</h1>
      
      <div className="flex flex-col md:flex-row gap-8">
        {/* User Stats Panel */}
        <div className="w-full md:w-1/3">
          <div className="card">
            <h2 className="text-xl font-semibold mb-6 border-b border-border pb-4">Your Stats</h2>
            
            <div className="flex flex-col items-center mb-6">
              <div className="w-20 h-20 rounded-full bg-muted border border-border flex items-center justify-center text-2xl font-bold mb-3">
                U
              </div>
              <p className="font-medium">User</p>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-muted/50 rounded-md border border-border">
                <span className="text-muted-foreground text-sm font-medium">Total Points</span>
                <span className="text-lg font-bold">128</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-muted/50 rounded-md border border-border">
                <span className="text-muted-foreground text-sm font-medium">Global Rank</span>
                <span className="text-lg font-bold">#42</span>
              </div>
            </div>
          </div>
        </div>

        {/* Predictions Panel */}
        <div className="w-full md:w-2/3">
          <div className="card h-full">
            <h2 className="text-xl font-semibold mb-6 border-b border-border pb-4">Upcoming Matches</h2>
            
            <div className="space-y-4">
              {/* Mock Match Card */}
              <div className="p-5 rounded-lg border border-border hover:border-primary/50 transition-colors">
                <div className="flex justify-between text-xs font-medium text-muted-foreground mb-4 uppercase tracking-wider">
                  <span>Group Stage - Matchday 1</span>
                  <span>Tomorrow, 20:00</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex flex-col items-center gap-2 w-1/3">
                    <span className="font-semibold">Brazil</span>
                  </div>
                  
                  <div className="flex items-center gap-3 w-1/3 justify-center">
                    <input type="number" className="w-12 h-12 text-center bg-background border border-border rounded-md text-lg focus:outline-none focus:ring-2 focus:ring-primary/20" defaultValue="0" />
                    <span className="text-muted-foreground font-bold">-</span>
                    <input type="number" className="w-12 h-12 text-center bg-background border border-border rounded-md text-lg focus:outline-none focus:ring-2 focus:ring-primary/20" defaultValue="0" />
                  </div>
                  
                  <div className="flex flex-col items-center gap-2 w-1/3">
                    <span className="font-semibold">France</span>
                  </div>
                </div>
                
                <div className="mt-6 flex justify-end">
                  <button className="btn-secondary text-sm">Save Prediction</button>
                </div>
              </div>
              
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
