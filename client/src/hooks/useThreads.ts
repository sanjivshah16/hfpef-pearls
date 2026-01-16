import { useState, useEffect, useMemo, useCallback } from 'react';
import type { Thread, Category } from '@/types/thread';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/_core/hooks/useAuth';

interface DeletedItem {
  id: number;
  itemType: 'thread' | 'tweet';
  threadId: string;
  tweetIndex: number | null;
  deletedAt: Date;
  deletedBy: number | null;
}

interface TweetEdit {
  id: number;
  threadId: string;
  tweetIndex: number;
  editedText: string | null;
  hiddenMedia: string[] | null;
  editedAt: Date;
  editedBy: number | null;
}

export function useThreads() {
  const [allThreads, setAllThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Auth state for admin features
  const { user, isAuthenticated } = useAuth();
  const isAdmin = user?.role === 'admin';
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | 'All'>('All');
  const [selectedYear, setSelectedYear] = useState<number | 'All'>('All');
  const [pearlsOnly, setPearlsOnly] = useState(false);
  const [favoritesOnly, setFavoritesOnly] = useState(false);

  // Get deleted items from API (only for admins)
  const { data: deletedItems, refetch: refetchDeletedItems } = trpc.admin.getDeletedItems.useQuery(
    undefined,
    { enabled: isAdmin }
  );

  // Get tweet edits from API (only for admins)
  const { data: tweetEdits, refetch: refetchTweetEdits } = trpc.admin.getTweetEdits.useQuery(
    undefined,
    { enabled: isAdmin }
  );

  // Get user favorites
  const { data: favorites, refetch: refetchFavorites } = trpc.favorites.list.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  // Mutations for delete/restore
  const deleteThreadMutation = trpc.admin.deleteThread.useMutation({
    onSuccess: () => refetchDeletedItems(),
  });
  const deleteTweetMutation = trpc.admin.deleteTweet.useMutation({
    onSuccess: () => refetchDeletedItems(),
  });
  const restoreThreadMutation = trpc.admin.restoreThread.useMutation({
    onSuccess: () => refetchDeletedItems(),
  });
  const restoreTweetMutation = trpc.admin.restoreTweet.useMutation({
    onSuccess: () => refetchDeletedItems(),
  });

  // Mutations for tweet edits
  const saveTweetEditMutation = trpc.admin.saveTweetEdit.useMutation({
    onSuccess: () => refetchTweetEdits(),
  });
  const deleteTweetEditMutation = trpc.admin.deleteTweetEdit.useMutation({
    onSuccess: () => refetchTweetEdits(),
  });

  // Mutations for favorites
  const addFavoriteMutation = trpc.favorites.add.useMutation({
    onSuccess: () => refetchFavorites(),
  });
  const removeFavoriteMutation = trpc.favorites.remove.useMutation({
    onSuccess: () => refetchFavorites(),
  });

  useEffect(() => {
    async function loadThreads() {
      try {
        const response = await fetch('/threads.json');
        if (!response.ok) throw new Error('Failed to load threads');
        const data = await response.json();
        setAllThreads(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }
    loadThreads();
  }, []);

  // Create a map of tweet edits for quick lookup
  const tweetEditsMap = useMemo(() => {
    if (!tweetEdits) return new Map<string, TweetEdit>();
    const map = new Map<string, TweetEdit>();
    tweetEdits.forEach((edit: TweetEdit) => {
      const key = `${edit.threadId}-${edit.tweetIndex}`;
      map.set(key, edit);
    });
    return map;
  }, [tweetEdits]);

  // Filter out deleted items and apply edits
  const threads = useMemo(() => {
    let result = allThreads;

    // Apply deletions
    if (deletedItems && deletedItems.length > 0) {
      const deletedThreadIds = new Set(
        deletedItems
          .filter((item: DeletedItem) => item.itemType === 'thread')
          .map((item: DeletedItem) => item.threadId)
      );

      const deletedTweets = deletedItems
        .filter((item: DeletedItem) => item.itemType === 'tweet')
        .reduce((acc: Record<string, Set<number>>, item: DeletedItem) => {
          if (!acc[item.threadId]) acc[item.threadId] = new Set();
          if (item.tweetIndex !== null) acc[item.threadId].add(item.tweetIndex);
          return acc;
        }, {});

      result = result
        .filter(thread => !deletedThreadIds.has(thread.id))
        .map(thread => {
          const deletedIndices = deletedTweets[thread.id];
          if (!deletedIndices || deletedIndices.size === 0) return thread;

          // Filter out deleted tweets
          const filteredTweets = thread.tweets.filter((_, index) => !deletedIndices.has(index));
          return {
            ...thread,
            tweets: filteredTweets,
            tweet_count: filteredTweets.length,
          };
        })
        .filter(thread => thread.tweets.length > 0);
    }

    // Apply tweet edits
    if (tweetEditsMap.size > 0) {
      result = result.map(thread => {
        const editedTweets = thread.tweets.map((tweet, index) => {
          const key = `${thread.id}-${index}`;
          const edit = tweetEditsMap.get(key);
          if (!edit) return tweet;

          // Apply text edit
          let editedTweet = { ...tweet };
          if (edit.editedText !== null) {
            editedTweet.text = edit.editedText;
          }

          // Apply hidden media
          if (edit.hiddenMedia && edit.hiddenMedia.length > 0) {
            editedTweet.media = tweet.media.filter(m => !edit.hiddenMedia!.includes(m.path));
          }

          return editedTweet;
        });

        return {
          ...thread,
          tweets: editedTweets,
        };
      });
    }

    return result;
  }, [allThreads, deletedItems, tweetEditsMap]);

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

      // Favorites only filter
      if (favoritesOnly && favorites) {
        if (!favorites.includes(thread.id)) return false;
      }

      return true;
    });
  }, [threads, searchQuery, selectedCategory, selectedYear, pearlsOnly, favoritesOnly, favorites]);

  // Stats
  const stats = useMemo(() => ({
    totalThreads: threads.length,
    totalTweets: threads.reduce((sum, t) => sum + t.tweet_count, 0),
    totalPearls: threads.filter(t => t.is_pearl).length,
    totalWithMedia: threads.filter(t => t.media.length > 0).length,
    filteredCount: filteredThreads.length,
    totalFavorites: favorites?.length || 0,
  }), [threads, filteredThreads, favorites]);

  // Admin actions
  const handleDeleteThread = useCallback((threadId: string) => {
    if (!isAdmin) return;
    deleteThreadMutation.mutate({ threadId });
  }, [isAdmin, deleteThreadMutation]);

  const handleDeleteTweet = useCallback((threadId: string, tweetIndex: number) => {
    if (!isAdmin) return;
    deleteTweetMutation.mutate({ threadId, tweetIndex });
  }, [isAdmin, deleteTweetMutation]);

  const handleRestoreThread = useCallback((threadId: string) => {
    if (!isAdmin) return;
    restoreThreadMutation.mutate({ threadId });
  }, [isAdmin, restoreThreadMutation]);

  const handleRestoreTweet = useCallback((threadId: string, tweetIndex: number) => {
    if (!isAdmin) return;
    restoreTweetMutation.mutate({ threadId, tweetIndex });
  }, [isAdmin, restoreTweetMutation]);

  // Tweet edit actions
  const handleSaveTweetEdit = useCallback((
    threadId: string, 
    tweetIndex: number, 
    editedText: string | null,
    hiddenMedia: string[] | null
  ) => {
    if (!isAdmin) return;
    saveTweetEditMutation.mutate({ threadId, tweetIndex, editedText, hiddenMedia });
  }, [isAdmin, saveTweetEditMutation]);

  const handleDeleteTweetEdit = useCallback((threadId: string, tweetIndex: number) => {
    if (!isAdmin) return;
    deleteTweetEditMutation.mutate({ threadId, tweetIndex });
  }, [isAdmin, deleteTweetEditMutation]);

  // Favorite actions
  const handleToggleFavorite = useCallback((threadId: string) => {
    if (!isAuthenticated) return;
    if (favorites?.includes(threadId)) {
      removeFavoriteMutation.mutate({ threadId });
    } else {
      addFavoriteMutation.mutate({ threadId });
    }
  }, [isAuthenticated, favorites, addFavoriteMutation, removeFavoriteMutation]);

  const isFavorited = useCallback((threadId: string) => {
    return favorites?.includes(threadId) || false;
  }, [favorites]);

  return {
    threads: filteredThreads,
    allThreads: threads, // Unfiltered (but with deletions/edits applied)
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
    favoritesOnly,
    setFavoritesOnly,
    // Admin
    isAdmin,
    deletedItems: deletedItems || [],
    tweetEdits: tweetEdits || [],
    handleDeleteThread,
    handleDeleteTweet,
    handleRestoreThread,
    handleRestoreTweet,
    handleSaveTweetEdit,
    handleDeleteTweetEdit,
    isDeleting: deleteThreadMutation.isPending || deleteTweetMutation.isPending,
    isSavingEdit: saveTweetEditMutation.isPending,
    // Favorites
    isAuthenticated,
    favorites: favorites || [],
    handleToggleFavorite,
    isFavorited,
  };
}
