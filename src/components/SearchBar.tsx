import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  X, 
  Filter,
  Hash,
  Folder,
  Globe
} from 'lucide-react';
import { LinkCategory } from '@/types/link';
import { cn } from '@/lib/utils';

interface SearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategory?: LinkCategory;
  onCategoryChange: (category?: LinkCategory) => void;
  className?: string;
}

const categoryOptions: { value: LinkCategory; label: string; emoji: string }[] = [
  { value: 'social', label: 'Social', emoji: '📱' },
  { value: 'work', label: 'Work', emoji: '💼' },
  { value: 'entertainment', label: 'Entertainment', emoji: '🎬' },
  { value: 'news', label: 'News', emoji: '📰' },
  { value: 'tools', label: 'Tools', emoji: '🛠️' },
  { value: 'shopping', label: 'Shopping', emoji: '🛒' },
  { value: 'education', label: 'Education', emoji: '📚' },
  { value: 'personal', label: 'Personal', emoji: '👤' },
];

export const SearchBar = ({ 
  searchQuery, 
  onSearchChange, 
  selectedCategory, 
  onCategoryChange,
  className 
}: SearchBarProps) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const clearSearch = () => {
    onSearchChange('');
    onCategoryChange(undefined);
  };

  const hasActiveFilters = searchQuery.length > 0 || selectedCategory;

  return (
    <div className={cn('w-full max-w-2xl mx-auto space-y-3', className)}>
      {/* Main Search Input */}
      <div className={cn(
        'glass rounded-xl transition-all duration-300 border',
        isFocused ? 'border-white/30 shadow-glass' : 'border-white/20'
      )}>
        <div className="flex items-center p-3">
          <Search className="w-5 h-5 text-white/60 mr-3 flex-shrink-0" />
          
          <Input
            placeholder="Search links by title, URL, or tags..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className="border-0 bg-transparent text-white placeholder:text-white/50 focus-visible:ring-0 flex-1"
          />

          <div className="flex items-center gap-2 ml-3">
            {/* Filter Toggle */}
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                'h-8 px-2 text-white hover:bg-white/20 transition-colors',
                showFilters && 'bg-white/20'
              )}
            >
              <Filter className="w-4 h-4" />
            </Button>

            {/* Clear Button */}
            {hasActiveFilters && (
              <Button
                size="sm"
                variant="ghost"
                onClick={clearSearch}
                className="h-8 px-2 text-white hover:bg-red-500/20 hover:text-red-200"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Filter Options */}
      {showFilters && (
        <div className="glass rounded-xl p-4 space-y-4 animate-card-in">
          <div className="flex items-center gap-2 text-white/80 text-sm">
            <Hash className="w-4 h-4" />
            <span className="font-medium">Filter by Category</span>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {categoryOptions.map((category) => (
              <Badge
                key={category.value}
                variant="secondary"
                className={cn(
                  'cursor-pointer transition-all duration-200 hover:scale-105',
                  selectedCategory === category.value
                    ? 'bg-primary text-white shadow-md'
                    : 'bg-white/10 text-white/90 hover:bg-white/20'
                )}
                onClick={() => 
                  onCategoryChange(
                    selectedCategory === category.value ? undefined : category.value
                  )
                }
              >
                <span className="mr-1">{category.emoji}</span>
                {category.label}
              </Badge>
            ))}
          </div>

          {/* Active Filters */}
          {hasActiveFilters && (
            <div className="pt-2 border-t border-white/10">
              <div className="flex items-center gap-2 text-white/60 text-xs mb-2">
                <Globe className="w-3 h-3" />
                <span>Active Filters</span>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {searchQuery && (
                  <Badge variant="outline" className="text-white border-white/30">
                    Search: "{searchQuery}"
                    <button
                      onClick={() => onSearchChange('')}
                      className="ml-1 hover:text-red-300"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                )}
                
                {selectedCategory && (
                  <Badge variant="outline" className="text-white border-white/30">
                    Category: {categoryOptions.find(c => c.value === selectedCategory)?.label}
                    <button
                      onClick={() => onCategoryChange(undefined)}
                      className="ml-1 hover:text-red-300"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};