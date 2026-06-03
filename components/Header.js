import Link from 'next/link';

export default function Header() {
  return (
    <header className="border-b border-border bg-background sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="text-xl font-bold tracking-tight">
              ChampionEX
            </Link>
          </div>
          <nav className="hidden md:flex space-x-6">
            <Link href="/dashboard" className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors">Dashboard</Link>
            <Link href="/leaderboard" className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors">Leaderboard</Link>
          </nav>
          <div className="flex items-center space-x-3">
            <Link href="/login" className="text-sm font-medium text-foreground hover:text-muted-foreground transition-colors">
              Log in
            </Link>
            <Link href="/signup" className="btn-primary text-sm px-4 py-2">
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
