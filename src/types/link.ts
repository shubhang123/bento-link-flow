export type LinkCategory = 
  | 'social' 
  | 'work' 
  | 'entertainment' 
  | 'news' 
  | 'tools' 
  | 'shopping' 
  | 'education' 
  | 'personal';

export interface Link {
  id: string;
  title: string;
  url: string;
  description?: string;
  category: LinkCategory;
  priority: number; // 0-100
  favicon?: string;
  tags: string[];
  createdAt: Date;
  lastVisited?: Date;
  folderId?: string;
}

export interface Folder {
  id: string;
  name: string;
  color: LinkCategory;
  isExpanded: boolean;
  createdAt: Date;
}

export interface LinkManagerState {
  links: Link[];
  folders: Folder[];
  globalPriority: number;
  searchQuery: string;
  selectedCategory?: LinkCategory;
}