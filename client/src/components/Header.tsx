import { Heart, ExternalLink } from 'lucide-react';

interface HeaderProps {
  stats: {
    total: number;
    totalTweets?: number;
    pearls: number;
    withMedia: number;
    threads?: number;
  };
}

export function Header({ stats }: HeaderProps) {
  return (
    <header className="bg-gradient-to-b from-primary/5 to-background border-b border-border">
      <div className="container py-6 md:py-8">
        {/* Logo and title */}
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Heart className="w-5 h-5 md:w-6 md:h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-foreground tracking-tight">
              HFpEF Pearls
            </h1>
            <p className="text-muted-foreground text-sm">
              Clinical wisdom from{' '}
              <a
                href="https://twitter.com/hfpef"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline inline-flex items-center gap-1"
              >
                @HFpEF
                <ExternalLink className="w-3 h-3" />
              </a>
            </p>
          </div>
        </div>

        {/* Author info */}
        <div className="bg-card border border-border rounded-lg p-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-semibold">
              SJS
            </div>
            <div>
              <p className="font-medium text-foreground text-sm">Sanjiv J. Shah, MD</p>
              <p className="text-xs text-muted-foreground">
                Director, Northwestern HFpEF Program
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-2 text-center">
          <div className="bg-card border border-border rounded-lg p-2">
            <p className="text-lg md:text-xl font-bold text-foreground">{stats.total}</p>
            <p className="text-xs text-muted-foreground">Items</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-2">
            <p className="text-lg md:text-xl font-bold text-primary">{stats.pearls}</p>
            <p className="text-xs text-muted-foreground">Pearls</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-2">
            <p className="text-lg md:text-xl font-bold text-foreground">{stats.threads || 0}</p>
            <p className="text-xs text-muted-foreground">Threads</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-2">
            <p className="text-lg md:text-xl font-bold text-foreground">{stats.withMedia}</p>
            <p className="text-xs text-muted-foreground">Media</p>
          </div>
        </div>
      </div>
    </header>
  );
}
