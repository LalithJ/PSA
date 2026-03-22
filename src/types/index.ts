export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  bio?: string;
  phone?: string;
  location?: string;
  role: 'admin' | 'user' | 'premium';
  subscriptionPlan: SubscriptionPlan;
  createdAt: Date;
  lastLoginAt: Date;
}

export interface SubscriptionPlan {
  id: string;
  name: 'free' | 'basic' | 'premium' | 'enterprise';
  price: number;
  currency: string;
  features: string[];
  maxSearches: number;
  maxExports: number;
  expiresAt?: Date;
}
export interface SupabaseError {
  message: string;
  status: number;
  data?: any;
}

export interface Person {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  company?: string;
  position?: string;
  location?: string;
  linkedinUrl?: string;
  avatar?: string;
  bio?: string;
  skills?: string[];
  experience?: Experience[];
  education?: Education[];
  socialProfiles?: SocialProfile[];
  lastUpdated: Date;
}

export interface Experience {
  id: string;
  company: string;
  position: string;
  startDate: Date;
  endDate?: Date;
  description?: string;
  current: boolean;
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string;
  startDate: Date;
  endDate?: Date;
  gpa?: number;
}

export interface SocialProfile {
  platform: string;
  url: string;
  username?: string;
}

export interface SearchFilter {
  name?: string;
  company?: string;
  location?: string;
  position?: string;
  skills?: string[];
  experience?: {
    min?: number;
    max?: number;
  };
  education?: string;
  industry?: string;
  salaryRange?: {
    min?: number;
    max?: number;
  };
}

export interface SearchResult {
  id: string;
  person: Person;
  relevanceScore: number;
  matchedFields: string[];
  // Add this property to track reveal status
  access_map: {
    email: boolean;
    phone: boolean;
  };
}

export interface SearchHistory {
  id: string;
  query: string;
  filters: SearchFilter;
  resultsCount: number;
  createdAt: Date;
  userId: string;
}

export interface ExportRequest {
  id: string;
  searchId: string;
  format: 'csv' | 'pdf' | 'excel';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  downloadUrl?: string;
  createdAt: Date;
  completedAt?: Date;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'search_complete' | 'export_ready' | 'subscription_expiring' | 'new_feature';
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
}

export interface Connection {
  id: string;
  userId: string;
  personId: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
}

export interface Message {
  id: string;
  senderId: string;
  recipientId: string;
  content: string;
  read: boolean;
  createdAt: Date;
}

export interface Analytics {
  totalSearches: number;
  totalExports: number;
  searchesInRange: number
  exportsInRange: number;
  growthRate: number;
  exportRate: number;
  exportsThisMonth: number;
  topSearchedPositions: Array<{ position: string; count: number }>;
  searchesByDay: Array<{ date: string; count: number }>;

}
