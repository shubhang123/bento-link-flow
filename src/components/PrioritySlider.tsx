import { useState } from 'react';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Settings, Zap, Target, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PrioritySliderProps {
  value: number;
  onChange: (value: number) => void;
  className?: string;
}

const getPriorityLevel = (value: number) => {
  if (value >= 80) return { label: 'High', color: 'priority-high', icon: Star };
  if (value >= 40) return { label: 'Medium', color: 'priority-medium', icon: Target };
  return { label: 'Low', color: 'priority-low', icon: Zap };
};

export const PrioritySlider = ({ value, onChange, className }: PrioritySliderProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const priority = getPriorityLevel(value);
  const Icon = priority.icon;

  return (
    <div className={cn('fixed bottom-6 right-6 z-50', className)}>
      <div 
        className={cn(
          'glass rounded-2xl transition-all duration-300 ease-out shadow-glass',
          isExpanded ? 'p-6 w-80' : 'p-4 w-16'
        )}
      >
        {/* Toggle Button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={cn(
            'flex items-center justify-center w-8 h-8 rounded-full transition-all duration-200',
            'hover:scale-110 hover:rotate-90',
            isExpanded ? 'bg-white/20 mb-4' : 'bg-white/10'
          )}
        >
          <Settings className="w-4 h-4 text-white" />
        </button>

        {/* Expanded Content */}
        {isExpanded && (
          <div className="space-y-4 animate-card-in">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">Priority Filter</h3>
              <Badge 
                variant="secondary" 
                className={cn('text-xs text-white', priority.color)}
              >
                <Icon className="w-3 h-3 mr-1" />
                {priority.label}
              </Badge>
            </div>

            {/* Slider */}
            <div className="space-y-3">
              <Slider
                value={[value]}
                onValueChange={(values) => onChange(values[0])}
                max={100}
                min={0}
                step={5}
                className="w-full"
              />
              
              {/* Value Display */}
              <div className="flex items-center justify-between text-xs text-white/70">
                <span>0%</span>
                <span className="font-medium text-white">{value}%</span>
                <span>100%</span>
              </div>
            </div>

            {/* Priority Levels */}
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="flex flex-col items-center space-y-1">
                <div className="w-3 h-3 rounded-full priority-low" />
                <span className="text-white/70">Low</span>
                <span className="text-white/50">0-39%</span>
              </div>
              <div className="flex flex-col items-center space-y-1">
                <div className="w-3 h-3 rounded-full priority-medium" />
                <span className="text-white/70">Medium</span>
                <span className="text-white/50">40-79%</span>
              </div>
              <div className="flex flex-col items-center space-y-1">
                <div className="w-3 h-3 rounded-full priority-high" />
                <span className="text-white/70">High</span>
                <span className="text-white/50">80-100%</span>
              </div>
            </div>

            {/* Description */}
            <p className="text-xs text-white/60 leading-relaxed">
              Adjust to resize cards based on their priority levels. Higher values show more important links as larger cards.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};