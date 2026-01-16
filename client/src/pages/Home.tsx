import { useThreads } from '@/hooks/useThreads';
import { ThreadCard } from '@/components/ThreadCard';
import { ThreadFilterBar } from '@/components/ThreadFilterBar';
import { Loader2, Heart, BookOpen, FileText, Image } from 'lucide-react';
import type { Category } from '@/types/thread';

export default function Home() {
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
  } = useThreads();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
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
      {/* Header */}
      <header className="bg-gradient-to-r from-rose-600 to-rose-800 text-white">
        <div className="container py-8">
          <div className="flex items-center gap-3 mb-2">
            <Heart className="w-8 h-8 fill-white" />
            <h1 className="text-3xl font-bold font-display">HFpEF Pearls</h1>
          </div>
          <p className="text-rose-100 text-lg max-w-2xl">
            Educational content on Heart Failure with Preserved Ejection Fraction from @HFpEF
          </p>
          
          {/* Stats */}
          <div className="flex flex-wrap gap-6 mt-6">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-rose-200" />
              <span className="text-rose-100">{stats.totalThreads} threads</span>
            </div>
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-rose-200" />
              <span className="text-rose-100">{stats.totalTweets} posts</span>
            </div>
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-rose-200 fill-rose-200" />
              <span className="text-rose-100">{stats.totalPearls} pearls</span>
            </div>
            <div className="flex items-center gap-2">
              <Image className="w-5 h-5 text-rose-200" />
              <span className="text-rose-100">{stats.totalWithMedia} with media</span>
            </div>
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
            categories={categories}
            years={years}
            filteredCount={stats.filteredCount}
            totalCount={stats.totalThreads}
          />
        </div>

        {/* Thread list */}
        {threads.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>No threads match your filters.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {threads.map(thread => (
              <ThreadCard key={thread.id} thread={thread} />
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
