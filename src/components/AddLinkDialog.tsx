import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Plus, X, Globe, Sparkles } from 'lucide-react';
import { Link, LinkCategory } from '@/types/link';
import { cn } from '@/lib/utils';

interface AddLinkDialogProps {
  onAddLink: (link: Omit<Link, 'id' | 'createdAt'>) => void;
  editLink?: Link;
  onEditLink?: (link: Link) => void;
  trigger?: React.ReactNode;
}

const categoryOptions: { value: LinkCategory; label: string; description: string }[] = [
  { value: 'social', label: 'Social Media', description: 'Facebook, Twitter, Instagram, etc.' },
  { value: 'work', label: 'Work & Professional', description: 'LinkedIn, Slack, project tools' },
  { value: 'entertainment', label: 'Entertainment', description: 'Netflix, YouTube, games' },
  { value: 'news', label: 'News & Articles', description: 'News sites, blogs, magazines' },
  { value: 'tools', label: 'Tools & Utilities', description: 'Productivity apps, calculators' },
  { value: 'shopping', label: 'Shopping', description: 'E-commerce, marketplaces' },
  { value: 'education', label: 'Education', description: 'Learning platforms, courses' },
  { value: 'personal', label: 'Personal', description: 'Personal projects, hobbies' },
];

export const AddLinkDialog = ({ onAddLink, editLink, onEditLink, trigger }: AddLinkDialogProps) => {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(editLink?.title || '');
  const [url, setUrl] = useState(editLink?.url || '');
  const [description, setDescription] = useState(editLink?.description || '');
  const [category, setCategory] = useState<LinkCategory>(editLink?.category || 'personal');
  const [priority, setPriority] = useState(editLink?.priority || 50);
  const [tags, setTags] = useState<string[]>(editLink?.tags || []);
  const [tagInput, setTagInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !url.trim()) return;

    setIsLoading(true);
    
    // Extract favicon (simplified)
    const favicon = `https://www.google.com/s2/favicons?domain=${new URL(url).hostname}&sz=32`;

    const linkData = {
      title: title.trim(),
      url: url.trim(),
      description: description.trim(),
      category,
      priority,
      tags: tags.filter(tag => tag.trim().length > 0),
      favicon,
      lastVisited: editLink?.lastVisited,
      folderId: editLink?.folderId,
    };

    if (editLink && onEditLink) {
      onEditLink({ ...editLink, ...linkData });
    } else {
      onAddLink(linkData);
    }

    // Reset form
    setTitle('');
    setUrl('');
    setDescription('');
    setCategory('personal');
    setPriority(50);
    setTags([]);
    setTagInput('');
    setOpen(false);
    setIsLoading(false);
  };

  const addTag = () => {
    const tag = tagInput.trim();
    if (tag && !tags.includes(tag) && tags.length < 5) {
      setTags([...tags, tag]);
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleTagInputKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  const getPriorityLevel = (value: number) => {
    if (value >= 80) return { label: 'High', color: 'bg-priority-high' };
    if (value >= 40) return { label: 'Medium', color: 'bg-priority-medium' };
    return { label: 'Low', color: 'bg-priority-low' };
  };

  const priorityLevel = getPriorityLevel(priority);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="glass border-white/20 text-white hover:bg-white/20">
            <Plus className="w-4 h-4 mr-2" />
            Add Link
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] bg-rich-navy border-white/20">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            {editLink ? 'Edit Link' : 'Add New Link'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* URL and Title */}
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label htmlFor="url" className="text-white">URL</Label>
              <div className="relative">
                <Globe className="absolute left-3 top-3 w-4 h-4 text-white/60" />
                <Input
                  id="url"
                  type="url"
                  placeholder="https://example.com"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/50"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="title" className="text-white">Title</Label>
              <Input
                id="title"
                placeholder="Enter a descriptive title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                required
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-white">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Brief description of the link content"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="bg-white/10 border-white/20 text-white placeholder:text-white/50 resize-none"
              rows={3}
            />
          </div>

          {/* Category and Priority */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-white">Category</Label>
              <Select value={category} onValueChange={(value: LinkCategory) => setCategory(value)}>
                <SelectTrigger className="bg-white/10 border-white/20 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-rich-navy border-white/20">
                  {categoryOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value} className="text-white hover:bg-white/10">
                      <div>
                        <div className="font-medium">{option.label}</div>
                        <div className="text-xs text-white/60">{option.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-white">Priority</Label>
                <Badge className={cn('text-xs text-white', priorityLevel.color)}>
                  {priorityLevel.label} ({priority}%)
                </Badge>
              </div>
              <Slider
                value={[priority]}
                onValueChange={(values) => setPriority(values[0])}
                max={100}
                min={0}
                step={5}
                className="w-full"
              />
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label className="text-white">Tags (Optional)</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="bg-white/20 text-white hover:bg-white/30">
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="ml-1 hover:text-red-300"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Add a tag"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={handleTagInputKeyPress}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                disabled={tags.length >= 5}
              />
              <Button
                type="button"
                onClick={addTag}
                disabled={!tagInput.trim() || tags.length >= 5}
                className="bg-white/10 hover:bg-white/20 text-white border-white/20"
              >
                Add
              </Button>
            </div>
            <p className="text-xs text-white/60">
              Add up to 5 tags to help organize your links
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setOpen(false)}
              className="text-white hover:bg-white/10"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!title.trim() || !url.trim() || isLoading}
              className="bg-primary hover:bg-primary/90 text-white"
            >
              {isLoading ? 'Saving...' : editLink ? 'Update Link' : 'Add Link'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};