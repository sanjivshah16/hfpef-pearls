import { useState } from 'react';
import type { TweetItem, BaseTweet, TweetMedia } from '@/types/tweet';
import { Heart, Repeat2, MessageCircle, ExternalLink, Play, ChevronLeft, ChevronRight, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TweetCardProps {
  tweet: TweetItem;
  onMediaClick?: (media: TweetMedia[], mediaIndex: number) => void;
}

function MediaDisplay({ 
  media, 
  onMediaClick 
}: { 
  media: TweetMedia[]; 
  onMediaClick?: (media: TweetMedia[], mediaIndex: number) => void;
}) {
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  
  if (media.length === 0) return null;
  
  const hasMultipleMedia = media.length > 1;
  const currentMedia = media[currentMediaIndex];

  const getMediaSrc = (m: TweetMedia) => {
    if (m.local_path) {
      return `/${m.local_path}`;
    }
    return m.type === 'photo' ? m.media_url : m.video_url || m.media_url;
  };

  const nextMedia = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentMediaIndex((prev) => (prev + 1) % media.length);
  };

  const prevMedia = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentMediaIndex((prev) => (prev - 1 + media.length) % media.length);
  };

  return (
    <div className="relative rounded-lg overflow-hidden bg-muted">
      {currentMedia.type === 'photo' && (
        <img
          src={getMediaSrc(currentMedia)}
          alt="Tweet media"
          className="w-full h-auto max-h-80 object-contain cursor-pointer"
          onClick={() => onMediaClick?.(media, currentMediaIndex)}
          loading="lazy"
          onError={(e) => {
            // Fallback to remote URL if local fails
            const target = e.target as HTMLImageElement;
            if (target.src !== currentMedia.media_url) {
              target.src = currentMedia.media_url;
            }
          }}
        />
      )}
      {(currentMedia.type === 'video' || currentMedia.type === 'animated_gif') && (
        <div className="relative">
          <video
            src={getMediaSrc(currentMedia)}
            poster={currentMedia.media_url}
            controls
            className="w-full h-auto max-h-80"
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
            {media.map((_, idx) => (
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
  );
}

function SingleTweetContent({ 
  tweet, 
  onMediaClick,
  compact = false,
  showDate = true
}: { 
  tweet: BaseTweet; 
  onMediaClick?: (media: TweetMedia[], mediaIndex: number) => void;
  compact?: boolean;
  showDate?: boolean;
}) {
  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
  };

  const processText = (text: string) => {
    let processed = text.replace(/https:\/\/t\.co\/\w+/g, '').trim();
    processed = processed
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&');
    return processed;
  };

  return (
    <div className={cn(compact ? 'py-3 border-b border-border last:border-b-0' : '')}>
      <p className={cn(
        "text-foreground leading-relaxed whitespace-pre-wrap",
        compact ? "text-sm mb-2" : "mb-3"
      )}>
        {processText(tweet.text)}
      </p>

      {tweet.media.length > 0 && (
        <div className="mb-3">
          <MediaDisplay media={tweet.media} onMediaClick={onMediaClick} />
        </div>
      )}

      {!compact && (
        <div className="flex items-center justify-between pt-2 border-t border-border">
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1" title="Likes">
              <Heart className="w-3 h-3" />
              {formatNumber(tweet.likes)}
            </span>
            <span className="flex items-center gap-1" title="Retweets">
              <Repeat2 className="w-3 h-3" />
              {formatNumber(tweet.retweets)}
            </span>
            <span className="flex items-center gap-1" title="Replies">
              <MessageCircle className="w-3 h-3" />
              {formatNumber(tweet.replies)}
            </span>
          </div>
          <a
            href={tweet.tweet_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors"
          >
            View on X
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      )}
    </div>
  );
}

export function TweetCard({ tweet, onMediaClick }: TweetCardProps) {
  const [isExpanded, setIsExpanded] = useState(true);

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

  if (tweet.type === 'thread') {
    return (
      <article className="tweet-card">
        {/* Thread header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded">
              Thread · {tweet.tweet_count} posts
            </span>
            <time className="text-xs text-muted-foreground font-mono">
              {formatDate(tweet.date)}
            </time>
          </div>
          {tweet.is_pearl && (
            <span className="pearl-badge">
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
              </svg>
              Pearl
            </span>
          )}
        </div>

        {/* Thread content */}
        <div className="space-y-0">
          {/* Always show first tweet */}
          <SingleTweetContent 
            tweet={tweet.tweets[0]} 
            onMediaClick={onMediaClick}
            compact={true}
          />
          
          {/* Show remaining tweets if expanded */}
          {isExpanded && tweet.tweets.slice(1).map((t, idx) => (
            <SingleTweetContent 
              key={t.id} 
              tweet={t} 
              onMediaClick={onMediaClick}
              compact={true}
            />
          ))}
        </div>

        {/* Expand/collapse button */}
        {tweet.tweets.length > 1 && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full mt-3 py-2 text-sm text-primary hover:bg-primary/5 rounded-md flex items-center justify-center gap-1 transition-colors"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="w-4 h-4" />
                Show less
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4" />
                Show all {tweet.tweets.length} posts
              </>
            )}
          </button>
        )}

        {/* Thread footer */}
        <div className="flex items-center justify-between pt-3 mt-3 border-t border-border">
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1" title="Total Likes">
              <Heart className="w-3 h-3" />
              {formatNumber(tweet.total_likes)}
            </span>
            <span className="flex items-center gap-1" title="Total Retweets">
              <Repeat2 className="w-3 h-3" />
              {formatNumber(tweet.total_retweets)}
            </span>
          </div>
          <a
            href={tweet.tweet_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors"
          >
            View thread on X
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </article>
    );
  }

  // Single tweet
  return (
    <article className="tweet-card">
      <div className="flex items-center justify-between mb-2">
        <time className="text-xs text-muted-foreground font-mono">
          {formatDate(tweet.date)}
        </time>
        {tweet.is_pearl && (
          <span className="pearl-badge">
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
            </svg>
            Pearl
          </span>
        )}
      </div>

      <p className="text-foreground leading-relaxed whitespace-pre-wrap mb-3">
        {tweet.text.replace(/https:\/\/t\.co\/\w+/g, '').trim()}
      </p>

      {tweet.media && tweet.media.length > 0 && (
        <div className="mb-3">
          <MediaDisplay media={tweet.media} onMediaClick={onMediaClick} />
        </div>
      )}

      <div className="flex items-center justify-between pt-2 border-t border-border">
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1" title="Likes">
            <Heart className="w-3 h-3" />
            {formatNumber(tweet.likes)}
          </span>
          <span className="flex items-center gap-1" title="Retweets">
            <Repeat2 className="w-3 h-3" />
            {formatNumber(tweet.retweets)}
          </span>
          <span className="flex items-center gap-1" title="Replies">
            <MessageCircle className="w-3 h-3" />
            {formatNumber(tweet.replies)}
          </span>
        </div>
        <a
          href={tweet.tweet_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors"
        >
          View on X
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      {/* Categories */}
      {tweet.categories && tweet.categories.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {tweet.categories
            .filter((cat: string) => cat !== 'Pearl' && cat !== 'General')
            .map((category: string) => (
              <span key={`cat-${category}`} className="category-tag">
                {category}
              </span>
            ))}
          {tweet.hashtags && tweet.hashtags.slice(0, 2).map((tag: string, idx: number) => (
            <span key={`tag-${tweet.id}-${idx}`} className="text-xs text-muted-foreground">
              #{tag}
            </span>
          ))}
        </div>
      )}
    </article>
  );
}
