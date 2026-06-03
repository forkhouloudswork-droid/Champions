import Link from 'next/link';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 glass border-b border-slate-700/50 backdrop-blur-md bg-slate-900/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
              ChampionEX
            </Link>
          </div>
          <nav className="hidden md:flex space-x-8">
            <Link href="/dashboard" className="text-slate-300 hover:text-white transition-colors duration-200">Dashboard</Link>
            <Link href="/leaderboard" className="text-slate-300 hover:text-white transition-colors duration-200">Leaderboard</Link>
          </nav>
          <div className="flex items-center space-x-4">
            <Link href="/login" className="text-sm font-medium text-slate-300 hover:text-white transition-colors duration-200">
              Log in
            </Link>
            <Link href="/signup" className="text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full transition-colors duration-200">
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
