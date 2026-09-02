import { Category, ContentItem, UserProfile } from '../types';

export const DEFAULT_PROFILE: UserProfile = {
  name: 'Sahil Sayyed',
  handle: '@sayyedsahil',
  title: 'Full-Stack Engineer & Solutions Architect',
  bio: 'Private personal dashboard, research notes repository, and cloud-backed content management system.',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
  location: 'Global / Remote',
  emailContact: 'sayyedsahil9017@gmail.com',
  adminEmail: 'sayyedsahil9017@gmail.com',
};

export const INITIAL_CATEGORIES: Category[] = [
  { id: 'cat-all', name: 'All Resources', slug: 'all', displayOrder: 0, color: 'blue' },
  { id: 'cat-notes', name: 'Notes & Articles', slug: 'notes', description: 'Technical deep-dives, architectural notes & mental models', displayOrder: 1, color: 'amber' },
  { id: 'cat-code', name: 'Source Code', slug: 'source-code', description: 'Clean algorithms, frontend components, and backend utilities', displayOrder: 2, color: 'emerald' },
  { id: 'cat-pdf', name: 'PDFs & Guides', slug: 'pdfs', description: 'Whitepapers, cheat sheets, and technical handbooks', displayOrder: 3, color: 'rose' },
  { id: 'cat-docs', name: 'Documents & Spreadsheets', slug: 'documents', description: 'System specifications, templates, and spreadsheets', displayOrder: 4, color: 'indigo' },
  { id: 'cat-social', name: 'Social & Profiles', slug: 'social', description: 'Official verified links, handles, and channels', displayOrder: 5, color: 'purple' },
  { id: 'cat-projects', name: 'Projects & Repos', slug: 'projects', description: 'Full applications, tools, and technical architectures', displayOrder: 6, color: 'cyan' },
  { id: 'cat-resources', name: 'Tools & Assets', slug: 'resources', description: 'Curated bookmarks, image assets, and developer utilities', displayOrder: 7, color: 'teal' },
];

// Completely clean empty content store - no demo items
export const INITIAL_CONTENT: ContentItem[] = [];

