import { useState } from 'react';
import { Link, LinkCategory } from '@/types/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ExternalLink, 
  Copy, 
  Edit, 
  Trash2, 
  Globe,
  Calendar,
  Tag as TagIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface LinkCardProps {
  link: Link;
  onEdit: (link: Link) => void;
  onDelete: (id: string) => void;
  globalPriority: number;
}

const getCategoryGradient = (category: LinkCategory): string => {
  const gradients = {
    social: 'gradient-social',
    work: 'gradient-work',
    entertainment: 'gradient-entertainment',
    news: 'gradient-news',
    tools: 'gradient-tools',
    shopping: 'gradient-shopping',
    education: 'gradient-education',
    personal: 'gradient-personal',
  };
  return gradients[category];
};

const getCardSize = (priority: number, globalPriority: number, linkId: string): string => {
  const effectivePriority = priority * (globalPriority / 100);
  
  // Use link ID to create consistent but varied sizing
  const idHash = linkId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const sizeVariant = idHash % 12; // 12 different size variants for more variety
  
  if (effectivePriority >= 90) {
    // Highest priority gets hero or feature cards
    return sizeVariant < 2 ? 'card-hero' : 'card-feature';
  } else if (effectivePriority >= 75) {
    // Very high priority gets large variants
    if (sizeVariant < 2) return 'card-wide-large';
    if (sizeVariant < 4) return 'card-tall';
    return 'card-large';
  } else if (effectivePriority >= 60) {
    // High priority gets medium-large variants
    if (sizeVariant < 3) return 'card-square-large';
    if (sizeVariant < 6) return 'card-wide';
    return 'card-large';
  } else if (effectivePriority >= 40) {
    // Medium priority gets varied medium sizes
    if (sizeVariant < 3) return 'card-medium-wide';
    if (sizeVariant < 6) return 'card-medium-tall';
    return 'card-medium';
  }
  
  // Low priority stays small but with some variation
  return sizeVariant < 4 ? 'card-medium' : 'card-small';
};

const getPriorityColor = (priority: number): string => {
  if (priority >= 80) return 'priority-high';
  if (priority >= 40) return 'priority-medium';
  return 'priority-low';
};

const formatDate = (date: Date): string => {
  return new Intl.RelativeTimeFormat('en', { numeric: 'auto' }).format(
    Math.ceil((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
    'day'
  );
};

const extractDomain = (url: string): string => {
  try {
    return new URL(url).hostname.replace('www.', '');
  } catch {
    return url;
  }
};

export const LinkCard = ({ link, onEdit, onDelete, globalPriority }: LinkCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const { toast } = useToast();

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(link.url);
      toast({
        title: "Link copied!",
        description: "URL has been copied to your clipboard.",
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Could not copy URL to clipboard.",
        variant: "destructive",
      });
    }
  };

  const handleOpenLink = () => {
    window.open(link.url, '_blank', 'noopener,noreferrer');
  };

  const cardSize = getCardSize(link.priority, globalPriority, link.id);
  const gradientClass = getCategoryGradient(link.category);
  const priorityColor = getPriorityColor(link.priority);

  return (
    <div
      className={cn(
        'bento-card relative overflow-hidden cursor-pointer group animate-card-in',
        cardSize,
        gradientClass
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleOpenLink}
    >
      {/* Content Overlay */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      
      {/* Card Content */}
      <div className="relative z-10 p-4 h-full flex flex-col justify-between text-white">
        {/* Header */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {link.favicon ? (
              <img 
                src={link.favicon} 
                alt="" 
                className="w-4 h-4 rounded-sm flex-shrink-0"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            ) : (
              <Globe className="w-4 h-4 text-white/80 flex-shrink-0" />
            )}
            <span className="text-sm font-mono text-white/80 truncate">
              {extractDomain(link.url)}
            </span>
          </div>
          
          {/* Priority Indicator */}
          <div className={cn('w-2 h-2 rounded-full flex-shrink-0', priorityColor)} />
        </div>

        {/* Main Content */}
        <div className="flex-1 mb-3">
          <h3 className="font-semibold text-lg leading-tight mb-1 line-clamp-2">
            {link.title}
          </h3>
          
          {link.description && !['card-small', 'card-medium'].includes(cardSize) && (
            <p className={cn(
              "text-white/80 mb-2",
              ['card-hero', 'card-feature'].includes(cardSize) ? "text-base line-clamp-3" : "text-sm line-clamp-2"
            )}>
              {link.description}
            </p>
          )}

          {/* Tags */}
          {link.tags.length > 0 && ['card-hero', 'card-feature', 'card-wide-large', 'card-large', 'card-square-large'].includes(cardSize) && (
            <div className="flex flex-wrap gap-1 mb-2">
              {link.tags.slice(0, cardSize === 'card-hero' ? 5 : 3).map((tag) => (
                <Badge 
                  key={tag} 
                  variant="secondary" 
                  className="text-xs bg-white/20 text-white border-0 hover:bg-white/30"
                >
                  {tag}
                </Badge>
              ))}
              {link.tags.length > (cardSize === 'card-hero' ? 5 : 3) && (
                <Badge variant="secondary" className="text-xs bg-white/20 text-white border-0">
                  +{link.tags.length - (cardSize === 'card-hero' ? 5 : 3)}
                </Badge>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-xs text-white/70">
            <Calendar className="w-3 h-3" />
            <span>
              {link.lastVisited 
                ? `Visited ${formatDate(link.lastVisited)}`
                : `Added ${formatDate(link.createdAt)}`
              }
            </span>
          </div>

          {/* Action Buttons */}
          <div 
            className={cn(
              'flex items-center gap-1 transition-all duration-200',
              isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2'
            )}
            onClick={(e) => e.stopPropagation()}
          >
            <Button
              size="sm"
              variant="ghost"
              className="h-7 w-7 p-0 text-white hover:bg-white/20"
              onClick={handleCopyUrl}
            >
              <Copy className="w-3 h-3" />
            </Button>
            
            <Button
              size="sm"
              variant="ghost"
              className="h-7 w-7 p-0 text-white hover:bg-white/20"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(link);
              }}
            >
              <Edit className="w-3 h-3" />
            </Button>
            
            <Button
              size="sm"
              variant="ghost"
              className="h-7 w-7 p-0 text-white hover:bg-red-500/20"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(link.id);
              }}
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </div>

      {/* Hover Overlay */}
      <div className={cn(
        'absolute inset-0 bg-gradient-to-t from-black/20 to-transparent transition-opacity duration-200',
        isHovered ? 'opacity-100' : 'opacity-0'
      )} />
    </div>
  );
};