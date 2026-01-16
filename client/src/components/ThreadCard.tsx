import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, MessageCircle, ChevronDown, ChevronUp, Play, Image as ImageIcon } from 'lucide-react';
import type { Thread, Tweet, Media } from '@/types/thread';

interface ThreadCardProps {
  thread: Thread;
}

function MediaItem({ media, index }: { media: Media; index: number }) {
  const [error, setError] = useState(false);
  
  // Build the correct path
  const getMediaPath = (m: Media) => {
    if (m.remote) return m.path;
    // Local path - ensure it starts with /
    return m.path.startsWith('/') ? m.path : `/${m.path}`;
  };
  
  const path = getMediaPath(media);
  
  if (error) {
    return (
      <div className="bg-muted rounded-lg flex items-center justify-center h-48 text-muted-foreground">
        <ImageIcon className="w-8 h-8 mr-2" />
        <span>Media unavailable</span>
      </div>
    );
  }
  
  if (media.type === 'video') {
    return (
      <video 
        controls 
        className="w-full rounded-lg max-h-[400px] object-contain bg-black"
        preload="metadata"
        onError={() => setError(true)}
      >
        <source src={path} type="video/mp4" />
        Your browser does not support video playback.
      </video>
    );
  }
  
  return (
    <img 
      src={path}
      alt={`Media ${index + 1}`}
      className="w-full rounded-lg max-h-[500px] object-contain bg-muted"
      loading="lazy"
      onError={() => setError(true)}
    />
  );
}

function TweetContent({ tweet, index, isFirst }: { tweet: Tweet; index: number; isFirst: boolean }) {
  // Format the text with links
  const formatText = (text: string) => {
    // Convert URLs to links
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlRegex);
    
    return parts.map((part, i) => {
      if (part.match(urlRegex)) {
        return (
          <a 
            key={i} 
            href={part} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-primary hover:underline break-all"
          >
            {part.length > 50 ? part.substring(0, 50) + '...' : part}
          </a>
        );
      }
      return <span key={i}>{part}</span>;
    });
  };
  
  // Check if this tweet starts with a number (like "1/", "2/", etc.)
  const numberMatch = tweet.text.match(/^(\d+)\//);
  const tweetNumber = numberMatch ? numberMatch[1] : null;
  
  return (
    <div className={`${!isFirst ? 'border-l-2 border-primary/20 ml-4 pl-4' : ''}`}>
      {tweetNumber && (
        <div className="flex items-center gap-2 mb-2">
          <span className="bg-primary text-primary-foreground text-xs font-bold px-2 py-0.5 rounded-full">
            {tweetNumber}
          </span>
        </div>
      )}
      
      <p className="text-foreground leading-relaxed whitespace-pre-wrap">
        {formatText(tweet.text)}
      </p>
      
      {tweet.media.length > 0 && (
        <div className="mt-3 space-y-3">
          {tweet.media.map((m, i) => (
            <MediaItem key={`${tweet.timestamp}-media-${i}`} media={m} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}

export function ThreadCard({ thread }: ThreadCardProps) {
  const [collapsed, setCollapsed] = useState(false);
  
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  // Get category colors
  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Pearl': 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
      'Tweetorial': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      'Case Study': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      'Echo': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      'Hemodynamics': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      'Treatment': 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200',
      'Diagnosis': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      'Video': 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
      'Image': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
      'General': 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
    };
    return colors[category] || colors['General'];
  };
  
  const hasVideo = thread.media.some(m => m.type === 'video');
  const imageCount = thread.media.filter(m => m.type === 'image').length;
  
  return (
    <Card className="overflow-hidden transition-all duration-200 hover:shadow-lg">
      <CardContent className="p-0">
        {/* Header */}
        <div className="p-4 border-b bg-muted/30">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            {thread.is_pearl && (
              <Badge className="bg-amber-500 text-white hover:bg-amber-600">
                Pearl
              </Badge>
            )}
            {thread.categories.filter(c => c !== 'Pearl').map(cat => (
              <Badge key={`${thread.id}-cat-${cat}`} variant="secondary" className={getCategoryColor(cat)}>
                {cat}
              </Badge>
            ))}
          </div>
          
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {formatDate(thread.date)}
              </span>
              {thread.tweet_count > 1 && (
                <span className="flex items-center gap-1">
                  <MessageCircle className="w-4 h-4" />
                  {thread.tweet_count} posts
                </span>
              )}
              {hasVideo && (
                <span className="flex items-center gap-1 text-pink-600">
                  <Play className="w-4 h-4" />
                  Video
                </span>
              )}
              {imageCount > 0 && (
                <span className="flex items-center gap-1 text-indigo-600">
                  <ImageIcon className="w-4 h-4" />
                  {imageCount} {imageCount === 1 ? 'image' : 'images'}
                </span>
              )}
            </div>
            
            {thread.tweet_count > 1 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCollapsed(!collapsed)}
                className="text-xs"
              >
                {collapsed ? (
                  <>
                    <ChevronDown className="w-4 h-4 mr-1" />
                    Expand
                  </>
                ) : (
                  <>
                    <ChevronUp className="w-4 h-4 mr-1" />
                    Collapse
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
        
        {/* Content */}
        <div className="p-4">
          {collapsed ? (
            // Show only first tweet when collapsed
            <TweetContent 
              tweet={thread.tweets[0]} 
              index={0} 
              isFirst={true}
            />
          ) : (
            // Show all tweets
            <div className="space-y-4">
              {thread.tweets.map((tweet, index) => (
                <TweetContent 
                  key={`${thread.id}-tweet-${index}`}
                  tweet={tweet} 
                  index={index}
                  isFirst={index === 0}
                />
              ))}
            </div>
          )}
          
          {collapsed && thread.tweet_count > 1 && (
            <Button
              variant="link"
              size="sm"
              onClick={() => setCollapsed(false)}
              className="mt-2 p-0 h-auto text-primary"
            >
              Show all {thread.tweet_count} posts
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
