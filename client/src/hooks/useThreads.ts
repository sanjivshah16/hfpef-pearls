import { useState, useEffect, useMemo } from 'react';
import type { Thread, Category } from '@/types/thread';

export function useThreads() {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | 'All'>('All');
  const [selectedYear, setSelectedYear] = useState<number | 'All'>('All');
  const [pearlsOnly, setPearlsOnly] = useState(false);

  useEffect(() => {
    async function loadThreads() {
      try {
        const response = await fetch('/threads.json');
        if (!response.ok) throw new Error('Failed to load threads');
        const data = await response.json();
        setThreads(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }
    loadThreads();
  }, []);

  // Get unique categories and years
  const categories = useMemo(() => {
    const cats = new Set<string>();
    threads.forEach(t => t.categories.forEach(c => cats.add(c)));
    return Array.from(cats).sort();
  }, [threads]);

  const years = useMemo(() => {
    const yrs = new Set<number>();
    threads.forEach(t => yrs.add(t.year));
    return Array.from(yrs).sort((a, b) => b - a);
  }, [threads]);

  // Filter threads
  const filteredThreads = useMemo(() => {
    return threads.filter(thread => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesText = thread.tweets.some(t => 
          t.text.toLowerCase().includes(query)
        );
        if (!matchesText) return false;
      }

      // Category filter
      if (selectedCategory !== 'All') {
        if (!thread.categories.includes(selectedCategory)) return false;
      }

      // Year filter
      if (selectedYear !== 'All') {
        if (thread.year !== selectedYear) return false;
      }

      // Pearls only filter
      if (pearlsOnly && !thread.is_pearl) return false;

      return true;
    });
  }, [threads, searchQuery, selectedCategory, selectedYear, pearlsOnly]);

  // Stats
  const stats = useMemo(() => ({
    totalThreads: threads.length,
    totalTweets: threads.reduce((sum, t) => sum + t.tweet_count, 0),
    totalPearls: threads.filter(t => t.is_pearl).length,
    totalWithMedia: threads.filter(t => t.media.length > 0).length,
    filteredCount: filteredThreads.length,
  }), [threads, filteredThreads]);

  return {
    threads: filteredThreads,
    loading,
    error,
    stats,
    categories,
    years,
    // Filters
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    selectedYear,
    setSelectedYear,
    pearlsOnly,
    setPearlsOnly,
  };
}
