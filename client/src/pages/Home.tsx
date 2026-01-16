import { useAuth } from '@/_core/hooks/useAuth';
import { useThreads } from '@/hooks/useThreads';
import { ThreadCard } from '@/components/ThreadCard';
import { ThreadFilterBar } from '@/components/ThreadFilterBar';
import { Button } from '@/components/ui/button';
import { Loader2, Heart, BookOpen, FileText, Image, LogIn, LogOut, Shield, Layers, Star } from 'lucide-react';
import { getLoginUrl } from '@/const';
import { Link } from 'wouter';
import type { Category } from '@/types/thread';

export default function Home() {
  // Auth state for admin features
  const { user, isAuthenticated, logout } = useAuth();
  
  const {
    threads,
    loading,
    error,
    stats,
    categories,
    years,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    selectedYear,
    setSelectedYear,
    pearlsOnly,
    setPearlsOnly,
    favoritesOnly,
    setFavoritesOnly,
    isAdmin,
    handleDeleteThread,
    handleDeleteTweet,
    handleSaveTweetEdit,
    handleToggleFavorite,
    isFavorited,
  } = useThreads();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
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
    <div className="min-h-screen bg-background">
      {/* Header - Northwestern Purple, no gradient */}
      <header className="bg-[#4E2A84] text-white">
        <div className="container py-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <Heart className="w-8 h-8 fill-white" />
              <h1 className="text-3xl font-bold font-['Space_Grotesk',sans-serif]">HFpEF Pearls</h1>
            </div>
            
            {/* Nav buttons */}
            <div className="flex items-center gap-2">
              <Link href="/">
                <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
                  <Layers className="w-4 h-4 mr-1" />
                  Card View
                </Button>
              </Link>
              
              {isAuthenticated ? (
                <>
                  {isAdmin && (
                    <span className="flex items-center gap-1 text-xs bg-white/20 px-2 py-1 rounded-full">
                      <Shield className="w-3 h-3" />
                      Edit Mode
                    </span>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white hover:bg-white/20"
                    onClick={() => logout()}
                  >
                    <LogOut className="w-4 h-4 mr-1" />
                    Logout
                  </Button>
                </>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/20"
                  onClick={() => window.location.href = getLoginUrl()}
                >
                  <LogIn className="w-4 h-4 mr-1" />
                  Admin Login
                </Button>
              )}
            </div>
          </div>
          
          <p className="text-white/80 text-lg max-w-2xl">
            Educational content on Heart Failure with Preserved Ejection Fraction from @HFpEF
          </p>
          
          {/* Admin notice */}
          {isAdmin && (
            <div className="mt-4 bg-white/10 rounded-lg px-4 py-2 text-sm">
              <strong>Edit Mode:</strong> Hover over threads or tweets to see edit/delete buttons. Changes are saved automatically to the database.
            </div>
          )}
          
          {/* Stats */}
          <div className="flex flex-wrap gap-6 mt-6">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-white/70" />
              <span className="text-white/80">{stats.totalThreads} threads</span>
            </div>
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-white/70" />
              <span className="text-white/80">{stats.totalTweets} posts</span>
            </div>
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-white/70 fill-white/70" />
              <span className="text-white/80">{stats.totalPearls} pearls</span>
            </div>
            <div className="flex items-center gap-2">
              <Image className="w-5 h-5 text-white/70" />
              <span className="text-white/80">{stats.totalWithMedia} with media</span>
            </div>
            {isAuthenticated && stats.totalFavorites > 0 && (
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-white/70 fill-white/70" />
                <span className="text-white/80">{stats.totalFavorites} favorites</span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="container py-8">
        {/* Filters */}
        <div className="mb-8">
          <ThreadFilterBar
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedCategory={selectedCategory as Category | 'All'}
            setSelectedCategory={setSelectedCategory as (cat: Category | 'All') => void}
            selectedYear={selectedYear}
            setSelectedYear={setSelectedYear}
            pearlsOnly={pearlsOnly}
            setPearlsOnly={setPearlsOnly}
            favoritesOnly={favoritesOnly}
            setFavoritesOnly={setFavoritesOnly}
            categories={categories}
            years={years}
            filteredCount={stats.filteredCount}
            totalCount={stats.totalThreads}
            isAuthenticated={isAuthenticated}
            totalFavorites={stats.totalFavorites}
          />
        </div>

        {/* Thread list */}
        {threads.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>{favoritesOnly ? 'No favorites yet. Heart some threads to see them here!' : 'No threads match your filters.'}</p>
          </div>
        ) : (
          <div className="space-y-6">
            {threads.map(thread => (
              <ThreadCard 
                key={thread.id} 
                thread={thread}
                isAdmin={isAdmin}
                isAuthenticated={isAuthenticated}
                isFavorited={isFavorited(thread.id)}
                onDeleteThread={handleDeleteThread}
                onDeleteTweet={handleDeleteTweet}
                onSaveTweetEdit={handleSaveTweetEdit}
                onToggleFavorite={handleToggleFavorite}
              />
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t bg-muted/30 py-6 mt-12">
        <div className="container text-center text-sm text-muted-foreground">
          <p>Educational content from @HFpEF on Twitter/X</p>
          <p className="mt-1">Compiled for educational purposes</p>
        </div>
      </footer>
    </div>
  );
}
