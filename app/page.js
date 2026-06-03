import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex-grow flex flex-col items-center justify-center py-20 text-center">
      <h1 className="text-4xl sm:text-6xl font-bold tracking-tight mb-6">
        Predict. Compete. Win.
      </h1>
      <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mb-10">
        The simplest and most competitive football prediction platform. Put your knowledge to the test against friends and coworkers.
      </p>
      
      <div className="flex flex-col sm:flex-row gap-4">
        <Link href="/signup" className="btn-primary text-base px-8 py-3">
          Get Started
        </Link>
        <Link href="/login" className="btn-secondary text-base px-8 py-3">
          Log In
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24 text-left border-t border-border pt-12 w-full">
        <div>
          <h3 className="font-semibold text-lg mb-2">Live Data</h3>
          <p className="text-sm text-muted-foreground">Real-time match updates powered by official APIs.</p>
        </div>
        <div>
          <h3 className="font-semibold text-lg mb-2">Global Leaderboard</h3>
          <p className="text-sm text-muted-foreground">Track your rank and compete for the top spot.</p>
        </div>
        <div>
          <h3 className="font-semibold text-lg mb-2">Fair Scoring</h3>
          <p className="text-sm text-muted-foreground">Points awarded for exact scores, goal diffs, and winners.</p>
        </div>
      </div>
    </div>
  );
}
