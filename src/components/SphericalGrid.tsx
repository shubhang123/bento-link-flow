import { useState, useRef, useEffect, useCallback } from 'react';
import { Link } from '@/types/link';
import { LinkCard } from '@/components/LinkCard';
import { cn } from '@/lib/utils';

interface SphericalGridProps {
  links: Link[];
  onEdit: (link: Link) => void;
  onDelete: (id: string) => void;
  globalPriority: number;
  className?: string;
}

interface GridItem {
  link: Link;
  x: number;
  y: number;
  id: string;
}

const GRID_SIZE = 6; // 6x6 visible grid
const CELL_SIZE = 200; // Base cell size in pixels
const PERSPECTIVE_STRENGTH = 0.8; // How much perspective distortion to apply
const SCALE_FACTOR = 0.3; // How much to scale distant items
const ROTATION_FACTOR = 15; // Maximum rotation in degrees

export const SphericalGrid = ({ 
  links, 
  onEdit, 
  onDelete, 
  globalPriority,
  className 
}: SphericalGridProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollPosition, setScrollPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [velocity, setVelocity] = useState({ x: 0, y: 0 });
  const animationRef = useRef<number>();

  // Create a larger grid of items by repeating and offsetting the links
  const gridItems: GridItem[] = [];
  const extendedSize = 20; // Create a 20x20 grid for seamless scrolling

  for (let y = 0; y < extendedSize; y++) {
    for (let x = 0; x < extendedSize; x++) {
      const linkIndex = (x + y * extendedSize) % links.length;
      if (links[linkIndex]) {
        gridItems.push({
          link: links[linkIndex],
          x,
          y,
          id: `${links[linkIndex].id}-${x}-${y}`,
        });
      }
    }
  }

  // Calculate transform for each item based on distance from center
  const getItemTransform = useCallback((item: GridItem, centerX: number, centerY: number) => {
    const itemCenterX = item.x * CELL_SIZE + CELL_SIZE / 2;
    const itemCenterY = item.y * CELL_SIZE + CELL_SIZE / 2;
    
    // Distance from viewport center
    const deltaX = itemCenterX - centerX;
    const deltaY = itemCenterY - centerY;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    
    // Normalize distance (0 at center, 1 at edge of visible area)
    const maxDistance = Math.sqrt(
      (GRID_SIZE * CELL_SIZE / 2) ** 2 + (GRID_SIZE * CELL_SIZE / 2) ** 2
    );
    const normalizedDistance = Math.min(distance / maxDistance, 1);
    
    // Calculate scale (1 at center, SCALE_FACTOR at edges)
    const scale = 1 - (normalizedDistance * (1 - SCALE_FACTOR));
    
    // Calculate rotation based on position relative to center
    const rotationX = (deltaY / maxDistance) * ROTATION_FACTOR * PERSPECTIVE_STRENGTH;
    const rotationY = -(deltaX / maxDistance) * ROTATION_FACTOR * PERSPECTIVE_STRENGTH;
    
    // Calculate z-translation for depth effect
    const translateZ = -normalizedDistance * 100 * PERSPECTIVE_STRENGTH;
    
    // Opacity based on distance
    const opacity = 1 - (normalizedDistance * 0.4);
    
    return {
      transform: `
        translate3d(${item.x * CELL_SIZE}px, ${item.y * CELL_SIZE}px, ${translateZ}px)
        rotateX(${rotationX}deg)
        rotateY(${rotationY}deg)
        scale(${scale})
      `,
      opacity: Math.max(opacity, 0.3),
      zIndex: Math.round((1 - normalizedDistance) * 100),
    };
  }, []);

  // Handle mouse/touch events for dragging
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
    setVelocity({ x: 0, y: 0 });
    
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging) return;

    const deltaX = e.clientX - dragStart.x;
    const deltaY = e.clientY - dragStart.y;
    
    setScrollPosition(prev => ({
      x: prev.x - deltaX * 0.5,
      y: prev.y - deltaY * 0.5,
    }));
    
    setDragStart({ x: e.clientX, y: e.clientY });
    setVelocity({ x: -deltaX * 0.1, y: -deltaY * 0.1 });
  }, [isDragging, dragStart]);

  const handlePointerUp = useCallback(() => {
    setIsDragging(false);
    
    // Apply momentum scrolling
    const applyMomentum = () => {
      setVelocity(prev => {
        const friction = 0.95;
        const newVelocity = {
          x: prev.x * friction,
          y: prev.y * friction,
        };
        
        if (Math.abs(newVelocity.x) > 0.1 || Math.abs(newVelocity.y) > 0.1) {
          setScrollPosition(current => ({
            x: current.x + newVelocity.x,
            y: current.y + newVelocity.y,
          }));
          
          animationRef.current = requestAnimationFrame(applyMomentum);
        }
        
        return newVelocity;
      });
    };
    
    if (Math.abs(velocity.x) > 0.1 || Math.abs(velocity.y) > 0.1) {
      applyMomentum();
    }
  }, [velocity]);

  // Handle wheel scrolling
  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    
    setScrollPosition(prev => ({
      x: prev.x + e.deltaX * 0.5,
      y: prev.y + e.deltaY * 0.5,
    }));
  }, []);

  // Set up event listeners
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('wheel', handleWheel, { passive: false });
    
    return () => {
      container.removeEventListener('wheel', handleWheel);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [handleWheel]);

  // Calculate viewport center
  const viewportCenterX = (GRID_SIZE * CELL_SIZE) / 2 + scrollPosition.x;
  const viewportCenterY = (GRID_SIZE * CELL_SIZE) / 2 + scrollPosition.y;

  // Filter visible items (with some padding for smooth transitions)
  const visibleItems = gridItems.filter(item => {
    const itemX = item.x * CELL_SIZE;
    const itemY = item.y * CELL_SIZE;
    const padding = CELL_SIZE * 2;
    
    return (
      itemX > scrollPosition.x - padding &&
      itemX < scrollPosition.x + GRID_SIZE * CELL_SIZE + padding &&
      itemY > scrollPosition.y - padding &&
      itemY < scrollPosition.y + GRID_SIZE * CELL_SIZE + padding
    );
  });

  return (
    <div className={cn('relative w-full h-screen overflow-hidden', className)}>
      {/* Grid Container */}
      <div
        ref={containerRef}
        className="absolute inset-0 cursor-grab active:cursor-grabbing"
        style={{
          perspective: '1000px',
          perspectiveOrigin: '50% 50%',
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
        {/* Grid Items */}
        <div
          className="relative preserve-3d"
          style={{
            transform: `translate3d(${-scrollPosition.x}px, ${-scrollPosition.y}px, 0)`,
            transformStyle: 'preserve-3d',
            width: `${extendedSize * CELL_SIZE}px`,
            height: `${extendedSize * CELL_SIZE}px`,
          }}
        >
          {visibleItems.map((item) => {
            const transform = getItemTransform(item, viewportCenterX, viewportCenterY);
            
            return (
              <div
                key={item.id}
                className="absolute transition-all duration-300 ease-out"
                style={{
                  width: `${CELL_SIZE - 12}px`,
                  height: `${CELL_SIZE - 12}px`,
                  ...transform,
                  transformStyle: 'preserve-3d',
                }}
              >
                <div className="w-full h-full">
                  <LinkCard
                    link={item.link}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    globalPriority={globalPriority}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Center Indicator */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
        <div className="w-2 h-2 bg-white/30 rounded-full animate-pulse" />
      </div>

      {/* Navigation Hints */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 pointer-events-none">
        <div className="glass rounded-full px-4 py-2">
          <p className="text-white/70 text-sm font-medium">
            Drag to explore • Scroll to navigate
          </p>
        </div>
      </div>

      {/* Grid Coordinates (Debug) */}
      <div className="absolute top-6 left-6 glass rounded-lg p-3 pointer-events-none">
        <p className="text-white/70 text-xs font-mono">
          X: {Math.round(scrollPosition.x / CELL_SIZE * 10) / 10}
        </p>
        <p className="text-white/70 text-xs font-mono">
          Y: {Math.round(scrollPosition.y / CELL_SIZE * 10) / 10}
        </p>
      </div>
    </div>
  );
};