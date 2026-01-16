/*
 * HFpEF Pearls - Knowledge Archive Design
 * 
 * Design Philosophy: Swiss-inspired minimalist educational repository
 * - Typography: Space Grotesk (headlines), IBM Plex Sans (body)
 * - Colors: Burgundy primary (#7c2d12), Sage green accent (#65a30d)
 * - Layout: Clean grid, generous whitespace, content-focused
 */

import { useState } from 'react';
import { useTweets } from '@/hooks/useTweets';
import { Header } from '@/components/Header';
import { FilterBar } from '@/components/FilterBar';
import { TweetCard } from '@/components/TweetCard';
import { MediaLightbox } from '@/components/MediaLightbox';
import { Loader2, Inbox } from 'lucide-react';
import type { Tweet } from '@/types/tweet';

export default function Home() {
  const {
    tweets,
    loading,
    error,
    filters,
    stats,
    setCategory,
    setYear,
    setSearchQuery,
    togglePearlsOnly,
    resetFilters,
  } = useTweets();

  const [lightboxTweet, setLightboxTweet] = useState<Tweet | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const handleMediaClick = (tweet: Tweet, mediaIndex: number) => {
    setLightboxTweet(tweet);
    setLightboxIndex(mediaIndex);
  };

  const closeLightbox = () => {
    setLightboxTweet(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading pearls...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive mb-2">Failed to load tweets</p>
          <p className="text-muted-foreground text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <Header stats={stats} />

      {/* Filter bar */}
      <FilterBar
        filters={filters}
        stats={stats}
        onCategoryChange={setCategory}
        onYearChange={setYear}
        onSearchChange={setSearchQuery}
        onTogglePearlsOnly={togglePearlsOnly}
        onReset={resetFilters}
      />

      {/* Main content */}
      <main className="container py-6">
        {/* Results count */}
        <div className="mb-6">
          <p className="text-sm text-muted-foreground">
            Showing <span className="font-medium text-foreground">{tweets.length}</span>{' '}
            {tweets.length === 1 ? 'post' : 'posts'}
            {filters.showPearlsOnly && ' (pearls only)'}
            {filters.category !== 'All' && ` in ${filters.category}`}
            {filters.year && ` from ${filters.year}`}
            {filters.searchQuery && ` matching "${filters.searchQuery}"`}
          </p>
        </div>

        {/* Tweet grid */}
        {tweets.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {tweets.map((tweet) => (
              <TweetCard
                key={tweet.id}
                tweet={tweet}
                onMediaClick={handleMediaClick}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <Inbox className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-medium text-foreground mb-2">No posts found</p>
            <p className="text-muted-foreground mb-4">
              Try adjusting your filters or search query
            </p>
            <button
              onClick={resetFilters}
              className="text-primary hover:underline"
            >
              Clear all filters
            </button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-8 mt-8">
        <div className="container text-center">
          <p className="text-sm text-muted-foreground">
            Educational content from{' '}
            <a
              href="https://twitter.com/hfpef"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              @HFpEF
            </a>
            {' '}· Sanjiv J. Shah, MD
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Northwestern HFpEF Program · Chicago, IL
          </p>
        </div>
      </footer>

      {/* Media lightbox */}
      <MediaLightbox
        tweet={lightboxTweet}
        initialIndex={lightboxIndex}
        onClose={closeLightbox}
      />
    </div>
  );
}
