import { useState, useMemo } from 'react';
import { Link, LinkCategory, LinkManagerState } from '@/types/link';
import { LinkCard } from '@/components/LinkCard';
import { PrioritySlider } from '@/components/PrioritySlider';
import { AddLinkDialog } from '@/components/AddLinkDialog';
import { SearchBar } from '@/components/SearchBar';
import { Button } from '@/components/ui/button';
import { Plus, Sparkles, Link as LinkIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Sample data for demonstration
const sampleLinks: Link[] = [
  {
    id: '1',
    title: 'Twitter - Social Media Platform',
    url: 'https://twitter.com',
    description: 'Stay updated with the latest news and connect with friends',
    category: 'social',
    priority: 85,
    favicon: 'https://www.google.com/s2/favicons?domain=twitter.com&sz=32',
    tags: ['social', 'news', 'networking'],
    createdAt: new Date('2024-01-15'),
    lastVisited: new Date('2024-01-20'),
  },
  {
    id: '2',
    title: 'GitHub - Developer Platform',
    url: 'https://github.com',
    description: 'Collaborate on code projects and manage repositories',
    category: 'work',
    priority: 90,
    favicon: 'https://www.google.com/s2/favicons?domain=github.com&sz=32',
    tags: ['development', 'collaboration', 'coding'],
    createdAt: new Date('2024-01-10'),
    lastVisited: new Date('2024-01-22'),
  },
  {
    id: '3',
    title: 'Netflix - Streaming Service',
    url: 'https://netflix.com',
    description: 'Watch movies, TV shows, and documentaries',
    category: 'entertainment',
    priority: 60,
    favicon: 'https://www.google.com/s2/favicons?domain=netflix.com&sz=32',
    tags: ['movies', 'tv', 'streaming'],
    createdAt: new Date('2024-01-12'),
    lastVisited: new Date('2024-01-21'),
  },
  {
    id: '4',
    title: 'Medium - Publishing Platform',
    url: 'https://medium.com',
    description: 'Read and write articles on various topics',
    category: 'news',
    priority: 70,
    favicon: 'https://www.google.com/s2/favicons?domain=medium.com&sz=32',
    tags: ['articles', 'writing', 'reading'],
    createdAt: new Date('2024-01-08'),
    lastVisited: new Date('2024-01-19'),
  },
  {
    id: '5',
    title: 'Figma - Design Tool',
    url: 'https://figma.com',
    description: 'Design and prototype user interfaces collaboratively',
    category: 'tools',
    priority: 80,
    favicon: 'https://www.google.com/s2/favicons?domain=figma.com&sz=32',
    tags: ['design', 'ui', 'collaboration'],
    createdAt: new Date('2024-01-05'),
    lastVisited: new Date('2024-01-18'),
  },
  {
    id: '6',
    title: 'Amazon - E-commerce',
    url: 'https://amazon.com',
    description: 'Shop for products online with fast delivery',
    category: 'shopping',
    priority: 45,
    favicon: 'https://www.google.com/s2/favicons?domain=amazon.com&sz=32',
    tags: ['shopping', 'delivery', 'products'],
    createdAt: new Date('2024-01-14'),
  },
  {
    id: '7',
    title: 'Coursera - Online Learning',
    url: 'https://coursera.org',
    description: 'Learn new skills with courses from top universities',
    category: 'education',
    priority: 75,
    favicon: 'https://www.google.com/s2/favicons?domain=coursera.org&sz=32',
    tags: ['learning', 'courses', 'education'],
    createdAt: new Date('2024-01-07'),
    lastVisited: new Date('2024-01-16'),
  },
  {
    id: '8',
    title: 'Personal Blog',
    url: 'https://myblog.com',
    description: 'My personal thoughts and project updates',
    category: 'personal',
    priority: 30,
    favicon: 'https://www.google.com/s2/favicons?domain=myblog.com&sz=32',
    tags: ['blog', 'personal', 'writing'],
    createdAt: new Date('2024-01-01'),
  }
];

const Index = () => {
  const { toast } = useToast();
  const [state, setState] = useState<LinkManagerState>({
    links: sampleLinks,
    folders: [],
    globalPriority: 70,
    searchQuery: '',
    selectedCategory: undefined,
  });
  const [editingLink, setEditingLink] = useState<Link | undefined>();

  // Filter links based on search and category
  const filteredLinks = useMemo(() => {
    return state.links.filter(link => {
      // Category filter
      if (state.selectedCategory && link.category !== state.selectedCategory) {
        return false;
      }

      // Search filter
      if (state.searchQuery) {
        const query = state.searchQuery.toLowerCase();
        return (
          link.title.toLowerCase().includes(query) ||
          link.url.toLowerCase().includes(query) ||
          link.description?.toLowerCase().includes(query) ||
          link.tags.some(tag => tag.toLowerCase().includes(query))
        );
      }

      return true;
    });
  }, [state.links, state.searchQuery, state.selectedCategory]);

  const handleAddLink = (linkData: Omit<Link, 'id' | 'createdAt'>) => {
    const newLink: Link = {
      ...linkData,
      id: Date.now().toString(),
      createdAt: new Date(),
    };

    setState(prev => ({
      ...prev,
      links: [...prev.links, newLink],
    }));

    toast({
      title: "Link added!",
      description: `${newLink.title} has been added to your collection.`,
    });
  };

  const handleEditLink = (updatedLink: Link) => {
    setState(prev => ({
      ...prev,
      links: prev.links.map(link => 
        link.id === updatedLink.id ? updatedLink : link
      ),
    }));

    setEditingLink(undefined);
    toast({
      title: "Link updated!",
      description: `${updatedLink.title} has been updated.`,
    });
  };

  const handleDeleteLink = (id: string) => {
    const linkToDelete = state.links.find(link => link.id === id);
    
    setState(prev => ({
      ...prev,
      links: prev.links.filter(link => link.id !== id),
    }));

    toast({
      title: "Link deleted!",
      description: `${linkToDelete?.title} has been removed from your collection.`,
    });
  };

  const handlePriorityChange = (priority: number) => {
    setState(prev => ({ ...prev, globalPriority: priority }));
  };

  const handleSearchChange = (query: string) => {
    setState(prev => ({ ...prev, searchQuery: query }));
  };

  const handleCategoryChange = (category?: LinkCategory) => {
    setState(prev => ({ ...prev, selectedCategory: category }));
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-72 h-72 bg-primary rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-accent rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-category-entertainment-start rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative z-10 p-6 pb-0">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
            <div className="text-center md:text-left">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 flex items-center justify-center md:justify-start gap-3">
                <div className="p-3 bg-gradient-to-r from-primary to-accent rounded-2xl animate-float">
                  <LinkIcon className="w-8 h-8 text-white" />
                </div>
                Link Manager
              </h1>
              <p className="text-lg text-text-secondary">
                Organize your digital world with beautiful, priority-based link management
              </p>
            </div>

            <div className="flex items-center gap-3">
              <AddLinkDialog 
                onAddLink={handleAddLink}
                editLink={editingLink}
                onEditLink={handleEditLink}
                trigger={
                  <Button className="glass border-white/20 text-white hover:bg-white/20 h-12 px-6">
                    <Plus className="w-5 h-5 mr-2" />
                    Add Link
                  </Button>
                }
              />
            </div>
          </div>

          {/* Search Bar */}
          <SearchBar
            searchQuery={state.searchQuery}
            onSearchChange={handleSearchChange}
            selectedCategory={state.selectedCategory}
            onCategoryChange={handleCategoryChange}
            className="mb-8"
          />
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 pb-20">
        {filteredLinks.length === 0 ? (
          <div className="text-center py-20">
            <div className="glass rounded-3xl p-12 max-w-md mx-auto">
              <Sparkles className="w-16 h-16 text-primary mx-auto mb-4 animate-pulse-glow" />
              <h3 className="text-2xl font-semibold text-white mb-2">
                {state.searchQuery || state.selectedCategory ? 'No links found' : 'Start your collection'}
              </h3>
              <p className="text-text-secondary mb-6">
                {state.searchQuery || state.selectedCategory 
                  ? 'Try adjusting your search or filters'
                  : 'Add your first link to get started with your organized digital workspace'
                }
              </p>
              {(!state.searchQuery && !state.selectedCategory) && (
                <AddLinkDialog 
                  onAddLink={handleAddLink}
                  trigger={
                    <Button className="bg-primary hover:bg-primary/90 text-white">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Your First Link
                    </Button>
                  }
                />
              )}
            </div>
          </div>
        ) : (
          <div className="bento-grid">
            {filteredLinks.map((link) => (
              <LinkCard
                key={link.id}
                link={link}
                onEdit={setEditingLink}
                onDelete={handleDeleteLink}
                globalPriority={state.globalPriority}
              />
            ))}
          </div>
        )}
      </main>

      {/* Priority Slider */}
      <PrioritySlider
        value={state.globalPriority}
        onChange={handlePriorityChange}
      />

      {/* Edit Dialog */}
      {editingLink && (
        <AddLinkDialog
          editLink={editingLink}
          onEditLink={handleEditLink}
          onAddLink={() => {}} // Not used in edit mode
        />
      )}
    </div>
  );
};

export default Index;
