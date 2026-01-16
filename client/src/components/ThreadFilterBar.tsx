import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Star, X } from 'lucide-react';
import type { Category } from '@/types/thread';

interface FilterBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: Category | 'All';
  setSelectedCategory: (category: Category | 'All') => void;
  selectedYear: number | 'All';
  setSelectedYear: (year: number | 'All') => void;
  pearlsOnly: boolean;
  setPearlsOnly: (value: boolean) => void;
  categories: string[];
  years: number[];
  filteredCount: number;
  totalCount: number;
}

export function ThreadFilterBar({
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  selectedYear,
  setSelectedYear,
  pearlsOnly,
  setPearlsOnly,
  categories,
  years,
  filteredCount,
  totalCount,
}: FilterBarProps) {
  const hasFilters = searchQuery || selectedCategory !== 'All' || selectedYear !== 'All' || pearlsOnly;
  
  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSelectedYear('All');
    setPearlsOnly(false);
  };
  
  return (
    <div className="bg-card border rounded-lg p-4 space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search threads..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>
      
      {/* Filters row */}
      <div className="flex flex-wrap gap-3">
        {/* Category filter */}
        <Select
          value={selectedCategory}
          onValueChange={(value) => setSelectedCategory(value as Category | 'All')}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Categories</SelectItem>
            {categories.map(cat => (
              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        {/* Year filter */}
        <Select
          value={selectedYear === 'All' ? 'All' : String(selectedYear)}
          onValueChange={(value) => setSelectedYear(value === 'All' ? 'All' : Number(value))}
        >
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Year" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Years</SelectItem>
            {years.map(year => (
              <SelectItem key={year} value={String(year)}>{year}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        {/* Pearls only toggle */}
        <Button
          variant={pearlsOnly ? 'default' : 'outline'}
          onClick={() => setPearlsOnly(!pearlsOnly)}
          className="gap-2"
        >
          <Star className={`w-4 h-4 ${pearlsOnly ? 'fill-current' : ''}`} />
          Pearls Only
        </Button>
        
        {/* Clear filters */}
        {hasFilters && (
          <Button
            variant="ghost"
            onClick={clearFilters}
            className="gap-2 text-muted-foreground"
          >
            <X className="w-4 h-4" />
            Clear
          </Button>
        )}
      </div>
      
      {/* Results count */}
      <div className="text-sm text-muted-foreground">
        Showing {filteredCount} of {totalCount} threads
      </div>
    </div>
  );
}
