import { Search, X, Filter, Sparkles } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import type { CategoryType, FilterState } from '@/types/tweet';

interface FilterBarProps {
  filters: FilterState;
  stats: {
    years: number[];
    categories: CategoryType[];
    categoryCounts: Record<CategoryType, number>;
  };
  onCategoryChange: (category: CategoryType) => void;
  onYearChange: (year: number | null) => void;
  onSearchChange: (query: string) => void;
  onTogglePearlsOnly: () => void;
  onReset: () => void;
}

export function FilterBar({
  filters,
  stats,
  onCategoryChange,
  onYearChange,
  onSearchChange,
  onTogglePearlsOnly,
  onReset,
}: FilterBarProps) {
  const hasActiveFilters =
    filters.category !== 'All' ||
    filters.year !== null ||
    filters.searchQuery !== '' ||
    filters.showPearlsOnly;

  return (
    <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border py-4">
      <div className="container">
        {/* Search bar */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search pearls, topics, or hashtags..."
            value={filters.searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 pr-10"
          />
          {filters.searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Pearls only toggle */}
          <Button
            variant={filters.showPearlsOnly ? 'default' : 'outline'}
            size="sm"
            onClick={onTogglePearlsOnly}
            className={cn(
              'gap-1.5',
              filters.showPearlsOnly && 'bg-primary text-primary-foreground'
            )}
          >
            <Sparkles className="w-4 h-4" />
            Pearls Only
          </Button>

          {/* Category filter */}
          <Select
            value={filters.category}
            onValueChange={(value) => onCategoryChange(value as CategoryType)}
          >
            <SelectTrigger className="w-[160px] h-9">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {stats.categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category} ({stats.categoryCounts[category]})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Year filter */}
          <Select
            value={filters.year?.toString() ?? 'all'}
            onValueChange={(value) =>
              onYearChange(value === 'all' ? null : parseInt(value))
            }
          >
            <SelectTrigger className="w-[120px] h-9">
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Years</SelectItem>
              {stats.years.map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Reset filters */}
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onReset}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4 mr-1" />
              Clear filters
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
