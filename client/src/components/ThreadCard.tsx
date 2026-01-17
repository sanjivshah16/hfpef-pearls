import { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, X, Heart, Edit2, Check, Eye, Image as ImageIcon } from 'lucide-react';
import type { Thread, Tweet, Media, Answer } from '@/types/thread';

interface ThreadCardProps {
  thread: Thread;
  isAdmin?: boolean;
  isAuthenticated?: boolean;
  isFavorited?: boolean;
  onDeleteThread?: (threadId: string) => void;
  onDeleteTweet?: (threadId: string, tweetIndex: number) => void;
  onSaveTweetEdit?: (threadId: string, tweetIndex: number, editedText: string | null, hiddenMedia: string[] | null) => void;
  onToggleFavorite?: (threadId: string) => void;
  originalTweets?: Tweet[]; // Original tweets for comparison during editing
}

interface MediaItemProps {
  media: Media;
  index: number;
  isAdmin?: boolean;
  onDelete?: () => void;
}

function MediaItem({ media, index, isAdmin, onDelete }: MediaItemProps) {
  const [error, setError] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Build the correct path
  const getMediaPath = (m: Media) => {
    if (m.remote) return m.path;
    // Local path - ensure it starts with /
    return m.path.startsWith('/') ? m.path : `/${m.path}`;
  };
  
  const path = getMediaPath(media);
  
  // IntersectionObserver for lazy loading and autoplay
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsInView(entry.isIntersecting);
          
          // Autoplay video when in view
          if (media.type === 'video' && videoRef.current) {
            if (entry.isIntersecting) {
              videoRef.current.play().catch(() => {
                // Autoplay may be blocked by browser, that's ok
              });
            } else {
              videoRef.current.pause();
            }
          }
        });
      },
      { threshold: 0.5 } // Trigger when 50% visible
    );
    
    observer.observe(container);
    return () => observer.disconnect();
  }, [media.type]);
  
  if (error) {
    return (
      <div className="bg-muted rounded-lg flex items-center justify-center h-48 text-muted-foreground">
        <ImageIcon className="w-8 h-8 mr-2" />
        <span>Media unavailable</span>
      </div>
    );
  }
  
  return (
    <div ref={containerRef} className="relative group/media">
      {/* Admin delete button for media */}
      {isAdmin && onDelete && (
        <div className="absolute right-2 top-2 z-10">
          {showDeleteConfirm ? (
            <div className="flex items-center gap-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-1 border">
              <Button
                variant="destructive"
                size="sm"
                className="h-6 px-2 text-xs"
                onClick={() => {
                  onDelete();
                  setShowDeleteConfirm(false);
                }}
              >
                Delete
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-xs"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </Button>
            </div>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 rounded-full bg-red-100 hover:bg-red-200 text-red-600 opacity-0 group-hover/media:opacity-100 transition-opacity"
              onClick={() => setShowDeleteConfirm(true)}
              title="Delete this media"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      )}
      
      {media.type === 'video' ? (
        <video 
          ref={videoRef}
          loop
          muted
          playsInline
          autoPlay
          className="w-full rounded-lg max-h-[400px] object-contain bg-muted"
          preload="metadata"
          onError={() => setError(true)}
          onLoadedMetadata={(e) => {
            // Seek to first frame to show thumbnail
            const video = e.currentTarget;
            video.currentTime = 0.1;
          }}
        >
          {/* Lazy load video source - only load when in view or nearby */}
          <source src={path} type="video/mp4" />
          Your browser does not support video playback.
        </video>
      ) : (
        <img 
          src={path}
          alt={`Media ${index + 1}`}
          className="w-full rounded-lg max-h-[500px] object-contain bg-muted"
          loading="lazy"
          onError={() => setError(true)}
        />
      )}
    </div>
  );
}

interface TweetContentProps {
  tweet: Tweet;
  originalTweet?: Tweet;
  index: number;
  isFirst: boolean;
  threadId: string;
  isAdmin?: boolean;
  onDeleteTweet?: (threadId: string, tweetIndex: number) => void;
  onSaveTweetEdit?: (threadId: string, tweetIndex: number, editedText: string | null, hiddenMedia: string[] | null) => void;
}

function TweetContent({ tweet, originalTweet, index, isFirst, threadId, isAdmin, onDeleteTweet, onSaveTweetEdit }: TweetContentProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(tweet.text);
  const [hiddenMedia, setHiddenMedia] = useState<string[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Reset edited text when tweet changes
  useEffect(() => {
    setEditedText(tweet.text);
  }, [tweet.text]);
  
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
  const numberMatch = tweet.text.match(/^(\d+)\/\s*/);
  const tweetNumber = numberMatch ? numberMatch[1] : null;
  // Remove the number prefix from the text
  const cleanText = numberMatch ? tweet.text.replace(/^\d+\/\s*/, '') : tweet.text;
  
  const handleDelete = () => {
    if (onDeleteTweet) {
      onDeleteTweet(threadId, index);
      setShowDeleteConfirm(false);
    }
  };
  
  const handleStartEdit = () => {
    setIsEditing(true);
    setEditedText(tweet.text);
    setHiddenMedia([]);
    setTimeout(() => textareaRef.current?.focus(), 0);
  };
  
  const handleSaveEdit = () => {
    if (onSaveTweetEdit) {
      const textChanged = editedText !== (originalTweet?.text || tweet.text);
      onSaveTweetEdit(
        threadId, 
        index, 
        textChanged ? editedText : null,
        hiddenMedia.length > 0 ? hiddenMedia : null
      );
    }
    setIsEditing(false);
  };
  
  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedText(tweet.text);
    setHiddenMedia([]);
  };
  
  const handleHideMedia = (mediaPath: string) => {
    setHiddenMedia(prev => [...prev, mediaPath]);
  };
  
  // Filter out hidden media during editing
  const visibleMedia = tweet.media.filter(m => !hiddenMedia.includes(m.path));
  
  return (
    <div className={`relative group ${!isFirst ? 'border-l-2 border-primary/20 ml-4 pl-4' : ''}`}>
      {/* Admin buttons for individual tweet */}
      {isAdmin && !isEditing && (
        <div className="absolute -right-2 -top-2 opacity-0 group-hover:opacity-100 transition-opacity z-10 flex gap-1">
          {showDeleteConfirm ? (
            <div className="flex items-center gap-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-1 border">
              <Button
                variant="destructive"
                size="sm"
                className="h-6 px-2 text-xs"
                onClick={handleDelete}
              >
                Delete
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-xs"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </Button>
            </div>
          ) : (
            <>
              {onSaveTweetEdit && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 rounded-full bg-blue-100 hover:bg-blue-200 text-blue-600"
                  onClick={handleStartEdit}
                  title="Edit this tweet"
                >
                  <Edit2 className="h-3 w-3" />
                </Button>
              )}
              {onDeleteTweet && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 rounded-full bg-red-100 hover:bg-red-200 text-red-600"
                  onClick={() => setShowDeleteConfirm(true)}
                  title="Delete this tweet"
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </>
          )}
        </div>
      )}
      
      {isEditing ? (
        <div className="space-y-3">
          <Textarea
            ref={textareaRef}
            value={editedText}
            onChange={(e) => setEditedText(e.target.value)}
            className="min-h-[100px] text-sm"
            placeholder="Edit tweet text..."
          />
          <div className="flex gap-2">
            <Button size="sm" onClick={handleSaveEdit} className="h-7">
              <Check className="h-3 w-3 mr-1" />
              Save
            </Button>
            <Button size="sm" variant="outline" onClick={handleCancelEdit} className="h-7">
              Cancel
            </Button>
          </div>
          
          {/* Show media with delete option during edit */}
          {visibleMedia.length > 0 && (
            <div className="mt-3 space-y-3">
              {visibleMedia.map((m, i) => (
                <MediaItem 
                  key={`${tweet.timestamp}-media-${i}`} 
                  media={m} 
                  index={i}
                  isAdmin={true}
                  onDelete={() => handleHideMedia(m.path)}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        <>
          <div className="flex items-start gap-2">
            {tweetNumber && (
              <span className="bg-primary text-primary-foreground text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0 mt-1">
                {tweetNumber}
              </span>
            )}
            <p className="text-foreground leading-relaxed whitespace-pre-wrap flex-1">
              {formatText(cleanText)}
            </p>
          </div>
          
          {tweet.media.length > 0 && (
            <div className="mt-3 space-y-3">
              {tweet.media.map((m, i) => (
                <MediaItem key={`${tweet.timestamp}-media-${i}`} media={m} index={i} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

// Answer section component
interface AnswerSectionProps {
  answer: Answer;
}

function AnswerSection({ answer }: AnswerSectionProps) {
  const [showAnswer, setShowAnswer] = useState(false);
  
  const hasContent = answer.text || (answer.media && answer.media.length > 0);
  
  if (!hasContent) return null;
  
  // Format the text with links
  const formatText = (text: string) => {
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
  
  return (
    <div className="mt-4 pt-4 border-t border-dashed border-primary/30">
      {!showAnswer ? (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowAnswer(true)}
          className="w-full bg-primary/5 hover:bg-primary/10 border-primary/30 text-primary"
        >
          <Eye className="w-4 h-4 mr-2" />
          Show Answer
        </Button>
      ) : (
        <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-2 text-sm font-medium text-primary">
            <Eye className="w-4 h-4" />
            Answer
          </div>
          
          {answer.text && (
            <p className="text-foreground leading-relaxed whitespace-pre-wrap">
              {formatText(answer.text)}
            </p>
          )}
          
          {answer.media && answer.media.length > 0 && (
            <div className="space-y-3">
              {answer.media.map((m, i) => (
                <MediaItem key={`answer-media-${i}`} media={m} index={i} />
              ))}
            </div>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAnswer(false)}
            className="text-xs text-muted-foreground"
          >
            Hide Answer
          </Button>
        </div>
      )}
    </div>
  );
}

export function ThreadCard({ 
  thread, 
  isAdmin, 
  isAuthenticated,
  isFavorited,
  onDeleteThread, 
  onDeleteTweet,
  onSaveTweetEdit,
  onToggleFavorite,
  originalTweets,
}: ThreadCardProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
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
  
  const handleDeleteThread = () => {
    if (onDeleteThread) {
      onDeleteThread(thread.id);
      setShowDeleteConfirm(false);
    }
  };
  
  return (
    <Card className="overflow-hidden transition-all duration-200 hover:shadow-lg relative group">
      {/* Admin delete button for entire thread */}
      {isAdmin && onDeleteThread && (
        <div className="absolute right-2 top-2 z-20">
          {showDeleteConfirm ? (
            <div className="flex items-center gap-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-2 border">
              <span className="text-xs text-muted-foreground mr-2">Delete thread?</span>
              <Button
                variant="destructive"
                size="sm"
                className="h-7 px-3 text-xs"
                onClick={handleDeleteThread}
              >
                Delete
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-3 text-xs"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </Button>
            </div>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full bg-red-100 hover:bg-red-200 text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => setShowDeleteConfirm(true)}
              title="Delete this thread"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      )}
      
      {/* Favorite button */}
      {isAuthenticated && onToggleFavorite && (
        <div className="absolute right-2 top-2 z-10">
          {!isAdmin && (
            <Button
              variant="ghost"
              size="icon"
              className={`h-8 w-8 rounded-full transition-all ${
                isFavorited 
                  ? 'bg-rose-100 text-rose-600 hover:bg-rose-200' 
                  : 'bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-rose-500 opacity-0 group-hover:opacity-100'
              }`}
              onClick={() => onToggleFavorite(thread.id)}
              title={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Heart className={`h-4 w-4 ${isFavorited ? 'fill-current' : ''}`} />
            </Button>
          )}
        </div>
      )}
      
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
          
          <div className="flex items-center text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {formatDate(thread.date)}
            </span>
          </div>
        </div>
        
        {/* Content - always show all tweets expanded */}
        <div className="p-4">
          <div className="space-y-4">
            {thread.tweets.map((tweet, index) => (
              <TweetContent 
                key={`${thread.id}-tweet-${index}`}
                tweet={tweet} 
                originalTweet={originalTweets?.[index]}
                index={index}
                isFirst={index === 0}
                threadId={thread.id}
                isAdmin={isAdmin}
                onDeleteTweet={onDeleteTweet}
                onSaveTweetEdit={onSaveTweetEdit}
              />
            ))}
          </div>
          
          {/* Answer section - only shown if answer exists */}
          {thread.answer && <AnswerSection answer={thread.answer} />}
        </div>
      </CardContent>
    </Card>
  );
}
