import { useState } from 'react';
import type { Tweet } from '@/types/tweet';
import { Heart, Repeat2, MessageCircle, ExternalLink, Play, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TweetCardProps {
  tweet: Tweet;
  onMediaClick?: (tweet: Tweet, mediaIndex: number) => void;
}

export function TweetCard({ tweet, onMediaClick }: TweetCardProps) {
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
  };

  // Process tweet text to handle links and mentions
  const processText = (text: string) => {
    // Remove t.co links that are for media
    let processed = text.replace(/https:\/\/t\.co\/\w+/g, '').trim();
    // Convert HTML entities
    processed = processed
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&');
    return processed;
  };

  const hasMultipleMedia = tweet.media.length > 1;

  const nextMedia = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentMediaIndex((prev) => (prev + 1) % tweet.media.length);
  };

  const prevMedia = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentMediaIndex((prev) => (prev - 1 + tweet.media.length) % tweet.media.length);
  };

  const currentMedia = tweet.media[currentMediaIndex];

  return (
    <article className="tweet-card group">
      {/* Header with date and pearl badge */}
      <div className="flex items-center justify-between mb-3">
        <time className="text-sm text-muted-foreground font-mono">
          {formatDate(tweet.date)}
        </time>
        <div className="flex items-center gap-2">
          {tweet.is_pearl && (
            <span className="pearl-badge">
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
              </svg>
              Pearl
            </span>
          )}
        </div>
      </div>

      {/* Tweet text */}
      <p className="text-foreground leading-relaxed mb-4 whitespace-pre-wrap">
        {processText(tweet.text)}
      </p>

      {/* Media */}
      {tweet.media.length > 0 && (
        <div className="relative mb-4 rounded-lg overflow-hidden bg-muted">
          {currentMedia.type === 'photo' && (
            <img
              src={currentMedia.local_path ? `/${currentMedia.local_path}` : currentMedia.media_url}
              alt="Tweet media"
              className="w-full h-auto max-h-96 object-contain cursor-pointer"
              onClick={() => onMediaClick?.(tweet, currentMediaIndex)}
              loading="lazy"
            />
          )}
          {(currentMedia.type === 'video' || currentMedia.type === 'animated_gif') && (
            <div className="relative">
              <video
                src={currentMedia.local_path ? `/${currentMedia.local_path}` : currentMedia.video_url}
                poster={currentMedia.media_url}
                controls
                className="w-full h-auto max-h-96"
                preload="metadata"
              >
                Your browser does not support video playback.
              </video>
              <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                <Play className="w-3 h-3" />
                {currentMedia.type === 'animated_gif' ? 'GIF' : 'Video'}
              </div>
            </div>
          )}
          
          {/* Media navigation */}
          {hasMultipleMedia && (
            <>
              <button
                onClick={prevMedia}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-1.5 rounded-full transition-colors"
                aria-label="Previous media"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={nextMedia}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-1.5 rounded-full transition-colors"
                aria-label="Next media"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                {tweet.media.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentMediaIndex(idx);
                    }}
                    className={cn(
                      'w-2 h-2 rounded-full transition-colors',
                      idx === currentMediaIndex ? 'bg-white' : 'bg-white/50'
                    )}
                    aria-label={`Go to media ${idx + 1}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Categories */}
      <div className="flex flex-wrap gap-2 mb-4">
        {tweet.categories
          .filter((cat) => cat !== 'Pearl' && cat !== 'General')
          .map((category) => (
            <span key={category} className="category-tag">
              {category}
            </span>
          ))}
        {tweet.hashtags.slice(0, 3).map((tag) => (
          <span key={tag} className="text-xs text-muted-foreground">
            #{tag}
          </span>
        ))}
      </div>

      {/* Footer with engagement and link */}
      <div className="flex items-center justify-between pt-3 border-t border-border">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1" title="Likes">
            <Heart className="w-4 h-4" />
            {formatNumber(tweet.likes)}
          </span>
          <span className="flex items-center gap-1" title="Retweets">
            <Repeat2 className="w-4 h-4" />
            {formatNumber(tweet.retweets)}
          </span>
          <span className="flex items-center gap-1" title="Replies">
            <MessageCircle className="w-4 h-4" />
            {formatNumber(tweet.replies)}
          </span>
        </div>
        <a
          href={tweet.tweet_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors"
        >
          View on X
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </article>
  );
}
