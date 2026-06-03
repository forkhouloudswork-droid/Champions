import './globals.css'
import Header from '@/components/Header';

export const metadata = {
  title: 'ChampionEX - World Cup Betting Platform',
  description: 'Predict World Cup match results, earn points, and climb the leaderboard on ChampionEX.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased bg-slate-900 text-slate-50 min-h-screen flex flex-col relative overflow-x-hidden">
        {/* Background Decorative Elements */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/20 blur-[120px] pointer-events-none -z-10" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-600/20 blur-[120px] pointer-events-none -z-10" />
        
        <Header />
        
        <main className="flex-grow flex flex-col">
          {children}
        </main>
      </body>
    </html>
  )
}
