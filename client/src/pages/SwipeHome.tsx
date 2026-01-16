import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/_core/hooks/useAuth';
import { useThreads } from '@/hooks/useThreads';
import { ThreadCard } from '@/components/ThreadCard';
import { Button } from '@/components/ui/button';
import { 
  Loader2, Heart, ChevronLeft, ChevronRight, Grid, LogIn, LogOut, Shield,
  Shuffle, ArrowDownWideNarrow
} from 'lucide-react';
import { getLoginUrl } from '@/const';
import { Link } from 'wouter';

export default function SwipeHome() {
  const { user, isAuthenticated, logout } = useAuth();
  
  const {
    threads,
    loading,
    error,
    stats,
    isAdmin,
    handleDeleteThread,
    handleDeleteTweet,
  } = useThreads();

  // Current thread index
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Sort mode: 'random' or 'newest'
  const [sortMode, setSortMode] = useState<'random' | 'newest'>('random');
  
  // Shuffled indices for random mode (generated once on load)
  const [shuffledIndices, setShuffledIndices] = useState<number[]>([]);
  
  // Touch handling for swipe
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // Generate shuffled indices when threads load
  useEffect(() => {
    if (threads.length > 0 && shuffledIndices.length === 0) {
      const indices = Array.from({ length: threads.length }, (_, i) => i);
      // Fisher-Yates shuffle
      for (let i = indices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [indices[i], indices[j]] = [indices[j], indices[i]];
      }
      setShuffledIndices(indices);
    }
  }, [threads.length, shuffledIndices.length]);

  // Get ordered threads based on sort mode
  const orderedThreads = useMemo(() => {
    if (sortMode === 'newest') {
      return [...threads].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }
    // Random mode - use shuffled indices
    if (shuffledIndices.length === 0) return threads;
    return shuffledIndices.map(i => threads[i]).filter(Boolean);
  }, [threads, sortMode, shuffledIndices]);

  // Current thread
  const currentThread = orderedThreads[currentIndex];

  // Navigation functions
  const goNext = useCallback(() => {
    if (currentIndex < orderedThreads.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  }, [currentIndex, orderedThreads.length]);

  const goPrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  }, [currentIndex]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        goNext();
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        goPrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goNext, goPrev]);

  // Touch handlers for swipe
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    
    if (isLeftSwipe) {
      goNext();
    } else if (isRightSwipe) {
      goPrev();
    }
  };

  // Toggle sort mode
  const toggleSortMode = () => {
    setSortMode(prev => prev === 'random' ? 'newest' : 'random');
    setCurrentIndex(0);
  };

  // Reshuffle
  const reshuffle = () => {
    const indices = Array.from({ length: threads.length }, (_, i) => i);
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    setShuffledIndices(indices);
    setCurrentIndex(0);
    setSortMode('random');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50 to-white">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-rose-600" />
          <p className="mt-4 text-muted-foreground">Loading HFpEF Pearls...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-destructive">
          <p>Error loading data: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen bg-gradient-to-br from-rose-50 to-white flex flex-col"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Header */}
      <header className="bg-gradient-to-r from-rose-600 to-rose-800 text-white px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="w-6 h-6 fill-white" />
            <h1 className="text-xl font-bold">HFpEF Pearls</h1>
          </div>
          
          <div className="flex items-center gap-2">
            {isAdmin && (
              <span className="flex items-center gap-1 text-xs bg-white/20 px-2 py-1 rounded-full">
                <Shield className="w-3 h-3" />
                Admin
              </span>
            )}
            
            <Link href="/browse">
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
                <Grid className="w-4 h-4 mr-1" />
                Browse All
              </Button>
            </Link>
            
            {isAuthenticated ? (
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20"
                onClick={() => logout()}
              >
                <LogOut className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20"
                onClick={() => window.location.href = getLoginUrl()}
              >
                <LogIn className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Sort controls */}
      <div className="px-4 py-2 flex items-center justify-between border-b bg-white/80 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <Button
            variant={sortMode === 'newest' ? 'default' : 'outline'}
            size="sm"
            onClick={toggleSortMode}
            className="text-xs"
          >
            <ArrowDownWideNarrow className="w-3 h-3 mr-1" />
            {sortMode === 'newest' ? 'Newest First' : 'Random'}
          </Button>
          
          {sortMode === 'random' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={reshuffle}
              className="text-xs"
            >
              <Shuffle className="w-3 h-3 mr-1" />
              Reshuffle
            </Button>
          )}
        </div>
        
        <span className="text-xs text-muted-foreground">
          {currentIndex + 1} of {orderedThreads.length}
        </span>
      </div>

      {/* Main content - swipeable card */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto px-4 py-4">
          {currentThread && (
            <div className="max-w-2xl mx-auto">
              <ThreadCard
                thread={currentThread}
                isAdmin={isAdmin}
                onDeleteThread={handleDeleteThread}
                onDeleteTweet={handleDeleteTweet}
              />
            </div>
          )}
        </div>
      </main>

      {/* Navigation controls */}
      <div className="px-4 py-3 border-t bg-white/80 backdrop-blur-sm">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          <Button
            variant="outline"
            size="lg"
            onClick={goPrev}
            disabled={currentIndex === 0}
            className="flex-1 mr-2"
          >
            <ChevronLeft className="w-5 h-5 mr-1" />
            Previous
          </Button>
          
          <Button
            variant="outline"
            size="lg"
            onClick={goNext}
            disabled={currentIndex >= orderedThreads.length - 1}
            className="flex-1 ml-2"
          >
            Next
            <ChevronRight className="w-5 h-5 ml-1" />
          </Button>
        </div>
        
        <p className="text-center text-xs text-muted-foreground mt-2">
          Swipe or use arrow keys to navigate
        </p>
      </div>
    </div>
  );
}
