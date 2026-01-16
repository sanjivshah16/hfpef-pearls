import { useState, useEffect, useMemo } from 'react';
import type { Tweet, FilterState, CategoryType } from '@/types/tweet';

export function useTweets() {
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    category: 'All',
    year: null,
    searchQuery: '',
    showPearlsOnly: false,
  });

  useEffect(() => {
    async function loadTweets() {
      try {
        const response = await fetch('/tweets.json');
        if (!response.ok) throw new Error('Failed to load tweets');
        const data: Tweet[] = await response.json();
        setTweets(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }
    loadTweets();
  }, []);

  const filteredTweets = useMemo(() => {
    return tweets.filter((tweet) => {
      // Pearl filter
      if (filters.showPearlsOnly && !tweet.is_pearl) return false;

      // Category filter
      if (filters.category !== 'All') {
        if (!tweet.categories.includes(filters.category)) return false;
      }

      // Year filter
      if (filters.year !== null && tweet.year !== filters.year) return false;

      // Search filter
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        const matchesText = tweet.text.toLowerCase().includes(query);
        const matchesHashtag = tweet.hashtags.some((tag) =>
          tag.toLowerCase().includes(query)
        );
        if (!matchesText && !matchesHashtag) return false;
      }

      return true;
    });
  }, [tweets, filters]);

  const stats = useMemo(() => {
    const years = Array.from(new Set(tweets.map((t) => t.year).filter(Boolean))).sort(
      (a, b) => b - a
    );
    
    const categories: CategoryType[] = [
      'All',
      'Pearl',
      'Image',
      'Video',
      'Echo',
      'Case Study',
      'Hemodynamics',
      'General',
    ];

    const categoryCounts = categories.reduce((acc, cat) => {
      if (cat === 'All') {
        acc[cat] = tweets.length;
      } else {
        acc[cat] = tweets.filter((t) => t.categories.includes(cat)).length;
      }
      return acc;
    }, {} as Record<CategoryType, number>);

    return {
      total: tweets.length,
      pearls: tweets.filter((t) => t.is_pearl).length,
      withMedia: tweets.filter((t) => t.media.length > 0).length,
      years,
      categories,
      categoryCounts,
    };
  }, [tweets]);

  const setCategory = (category: CategoryType) => {
    setFilters((prev) => ({ ...prev, category }));
  };

  const setYear = (year: number | null) => {
    setFilters((prev) => ({ ...prev, year }));
  };

  const setSearchQuery = (searchQuery: string) => {
    setFilters((prev) => ({ ...prev, searchQuery }));
  };

  const togglePearlsOnly = () => {
    setFilters((prev) => ({ ...prev, showPearlsOnly: !prev.showPearlsOnly }));
  };

  const resetFilters = () => {
    setFilters({
      category: 'All',
      year: null,
      searchQuery: '',
      showPearlsOnly: false,
    });
  };

  return {
    tweets: filteredTweets,
    allTweets: tweets,
    loading,
    error,
    filters,
    stats,
    setCategory,
    setYear,
    setSearchQuery,
    togglePearlsOnly,
    resetFilters,
  };
}
