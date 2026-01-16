import { Heart, ExternalLink } from 'lucide-react';

interface HeaderProps {
  stats: {
    total: number;
    pearls: number;
    withMedia: number;
  };
}

export function Header({ stats }: HeaderProps) {
  return (
    <header className="bg-gradient-to-b from-primary/5 to-background border-b border-border">
      <div className="container py-8 md:py-12">
        {/* Logo and title */}
        <div className="flex items-start gap-4 mb-6">
          <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Heart className="w-6 h-6 md:w-8 md:h-8 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl md:text-4xl font-bold text-foreground tracking-tight">
              HFpEF Pearls
            </h1>
            <p className="text-muted-foreground mt-1 text-sm md:text-base">
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
        <div className="bg-card border border-border rounded-lg p-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
              SJS
            </div>
            <div>
              <p className="font-medium text-foreground">Sanjiv J. Shah, MD</p>
              <p className="text-sm text-muted-foreground">
                Director, Northwestern HFpEF Program · Stone Professor, Northwestern University
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="bg-card border border-border rounded-lg p-3">
            <p className="text-2xl md:text-3xl font-bold text-foreground">{stats.total}</p>
            <p className="text-xs md:text-sm text-muted-foreground">Total Posts</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-3">
            <p className="text-2xl md:text-3xl font-bold text-primary">{stats.pearls}</p>
            <p className="text-xs md:text-sm text-muted-foreground">Pearls</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-3">
            <p className="text-2xl md:text-3xl font-bold text-foreground">{stats.withMedia}</p>
            <p className="text-xs md:text-sm text-muted-foreground">With Media</p>
          </div>
        </div>
      </div>
    </header>
  );
}
