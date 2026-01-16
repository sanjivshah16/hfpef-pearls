import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/_core/hooks/useAuth';
import { useThreads } from '@/hooks/useThreads';
import { ThreadCard } from '@/components/ThreadCard';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { 
  Loader2, Heart, ChevronLeft, ChevronRight, Grid, LogIn, LogOut, Shield,
  Shuffle, Star
} from 'lucide-react';
import { getLoginUrl } from '@/const';
import { Link } from 'wouter';

export default function SwipeHome() {
  const { user, isAuthenticated, logout } = useAuth();
  
  const {
    threads,
    allThreads,
    loading,
    error,
    stats,
    isAdmin,
    handleDeleteThread,
    handleDeleteTweet,
    handleSaveTweetEdit,
    handleToggleFavorite,
    isFavorited,
    favoritesOnly,
    setFavoritesOnly,
  } = useThreads();

  // Current thread index
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Sort mode: 'random' or 'newest'
  // Admin always uses chronological (oldest first for editing)
  const [sortMode, setSortMode] = useState<'random' | 'newest'>('random');
  
  // Shuffled indices for random mode (generated once on load)
  const [shuffledIndices, setShuffledIndices] = useState<number[]>([]);
  
  // Touch handling for swipe
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // Generate shuffled indices when threads load (only for non-admin)
  useEffect(() => {
    if (!isAdmin && threads.length > 0 && shuffledIndices.length === 0) {
      const indices = Array.from({ length: threads.length }, (_, i) => i);
      // Fisher-Yates shuffle
      for (let i = indices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [indices[i], indices[j]] = [indices[j], indices[i]];
      }
      setShuffledIndices(indices);
    }
  }, [threads.length, shuffledIndices.length, isAdmin]);

  // Reset shuffled indices when admin status changes
  useEffect(() => {
    if (isAdmin) {
      setShuffledIndices([]);
    }
  }, [isAdmin]);

  // Get ordered threads based on sort mode
  const orderedThreads = useMemo(() => {
    if (isAdmin) {
      // Admin: chronological oldest first (for editing in order)
      return [...threads].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }
    
    if (sortMode === 'newest') {
      // User: newest first
      return [...threads].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }
    
    // Random mode - use shuffled indices
    if (shuffledIndices.length === 0) return threads;
    return shuffledIndices.map(i => threads[i]).filter(Boolean);
  }, [threads, sortMode, shuffledIndices, isAdmin]);

  // Current thread
  const currentThread = orderedThreads[currentIndex];

  // Reset index when threads change significantly
  useEffect(() => {
    if (currentIndex >= orderedThreads.length) {
      setCurrentIndex(Math.max(0, orderedThreads.length - 1));
    }
  }, [orderedThreads.length, currentIndex]);

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

  // Toggle sort mode (only for non-admin)
  const toggleSortMode = (checked: boolean) => {
    if (isAdmin) return; // Admin always uses chronological
    setSortMode(checked ? 'newest' : 'random');
    setCurrentIndex(0);
  };

  // Reshuffle (only for non-admin)
  const reshuffle = () => {
    if (isAdmin) return;
    const indices = Array.from({ length: threads.length }, (_, i) => i);
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    setShuffledIndices(indices);
    setCurrentIndex(0);
    setSortMode('random');
  };

  // Toggle favorites filter
  const toggleFavoritesOnly = () => {
    setFavoritesOnly(!favoritesOnly);
    setCurrentIndex(0);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#4E2A84]" />
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
      className="min-h-screen bg-gray-50 flex flex-col"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Header - Northwestern Purple, fixed height, no gradient */}
      <header className="bg-[#4E2A84] text-white px-4 py-3 h-14 flex items-center">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <Heart className="w-6 h-6 fill-white" />
            <h1 className="text-xl font-bold font-['IBM_Plex_Sans',sans-serif]">HFpEF Pearls</h1>
          </div>
          
          <div className="flex items-center gap-2">
            {isAdmin && (
              <span className="flex items-center gap-1 text-xs bg-white/20 px-2 py-1 rounded-full">
                <Shield className="w-3 h-3" />
                Edit Mode
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
      <div className="px-4 py-2 flex items-center justify-between border-b bg-white h-12">
        <div className="flex items-center gap-3">
          {isAdmin ? (
            // Admin sees chronological order indicator (oldest first)
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              Chronological (Oldest First) - Edit Mode
            </span>
          ) : (
            <>
              {/* Slider toggle for Random/Newest */}
              <div className="flex items-center gap-2">
                <span className={`text-xs ${sortMode === 'random' ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                  Random
                </span>
                <Switch
                  checked={sortMode === 'newest'}
                  onCheckedChange={toggleSortMode}
                  className="data-[state=checked]:bg-[#4E2A84]"
                />
                <span className={`text-xs ${sortMode === 'newest' ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                  Newest
                </span>
              </div>
              
              {sortMode === 'random' && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={reshuffle}
                  className="text-xs h-7"
                >
                  <Shuffle className="w-3 h-3 mr-1" />
                  Reshuffle
                </Button>
              )}
            </>
          )}
          
          {/* Favorites filter (for logged in users) */}
          {isAuthenticated && !isAdmin && stats.totalFavorites > 0 && (
            <Button
              variant={favoritesOnly ? 'default' : 'outline'}
              size="sm"
              onClick={toggleFavoritesOnly}
              className="text-xs h-7"
            >
              <Star className={`w-3 h-3 mr-1 ${favoritesOnly ? 'fill-current' : ''}`} />
              Favorites ({stats.totalFavorites})
            </Button>
          )}
        </div>
        
        <span className="text-xs text-muted-foreground">
          {orderedThreads.length > 0 ? `${currentIndex + 1} of ${orderedThreads.length}` : 'No threads'}
        </span>
      </div>

      {/* Main content - swipeable card */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto px-4 py-4">
          {currentThread ? (
            <div className="max-w-2xl mx-auto">
              <ThreadCard
                thread={currentThread}
                isAdmin={isAdmin}
                isAuthenticated={isAuthenticated}
                isFavorited={isFavorited(currentThread.id)}
                onDeleteThread={handleDeleteThread}
                onDeleteTweet={handleDeleteTweet}
                onSaveTweetEdit={handleSaveTweetEdit}
                onToggleFavorite={handleToggleFavorite}
              />
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <p>{favoritesOnly ? 'No favorites yet. Heart some threads to see them here!' : 'No threads available.'}</p>
            </div>
          )}
        </div>
      </main>

      {/* Navigation controls */}
      <div className="px-4 py-3 border-t bg-white">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          <Button
            variant="outline"
            size="lg"
            onClick={goPrev}
            disabled={currentIndex === 0 || orderedThreads.length === 0}
            className="flex-1 mr-2"
          >
            <ChevronLeft className="w-5 h-5 mr-1" />
            Previous
          </Button>
          
          <Button
            variant="outline"
            size="lg"
            onClick={goNext}
            disabled={currentIndex >= orderedThreads.length - 1 || orderedThreads.length === 0}
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
