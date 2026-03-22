import axios from 'axios';
import { Person, SearchFilter, SearchResult, SearchHistory, Analytics } from '../types';

// ============================================
// PEOPLE SERVICE
// ============================================

const API_BASE = "/api";


/**
 * Search for people based on filters
 */
export const searchPeople = async (filters: SearchFilter): Promise<SearchResult[]> => {
  try {
    // Call Laravel search endpoint via the adapter's axios instance
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    const response = await axios.post(`${API_BASE}/people/search`, filters, { // CHANGED THIS LINE
      headers: {
        Authorization: token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });

    const data = (response as any).data as any[];

    // If backend already returns SearchResult[] shape (as provided), just coerce types where needed
    const results: SearchResult[] = (data || []).map((item: any) => ({
      id: String(item.id || item.person?.id),
      person: {
        ...item.person,
        id: String(item.person.id),
        // Ensure dates are Date objects
        experience: (item.person.experience || []).map((exp: any) => ({
          ...exp,
          startDate: exp.startDate ? new Date(exp.startDate) : undefined,
          endDate: exp.endDate ? new Date(exp.endDate) : undefined,
        })),
        education: (item.person.education || []).map((edu: any) => ({
          ...edu,
          startDate: edu.startDate ? new Date(edu.startDate) : undefined,
          endDate: edu.endDate ? new Date(edu.endDate) : undefined,
          gpa: typeof edu.gpa === 'string' ? parseFloat(edu.gpa) : edu.gpa,
        })),
        lastUpdated: item.person.lastUpdated ? new Date(item.person.lastUpdated) : new Date(),
      } as Person,
      relevanceScore: typeof item.relevanceScore === 'number' ? item.relevanceScore : calculateRelevanceScore(item.person, filters),
      matchedFields: Array.isArray(item.matchedFields) ? item.matchedFields : getMatchedFields(item.person, filters),
      access_map: item.access_map || { email: false, phone: false }
    }));

    return results;
  } catch (error) {
    console.error('Error searching people:', error);
    throw error;
  }
};

/**
 * Get a person by ID with all related data
 */
export const getPersonById = async (id: string): Promise<Person | null> => {
  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    const response = await axios.get(`${API_BASE}/people/${id}`, { // CHANGED THIS LINE
      headers: {
        Authorization: token ? `Bearer ${token}` : '',
        Accept: 'application/json',
      },
    });

    const payload = (response as any).data;
    // If backend returns a Person-like object directly
    const p = payload.person || payload;
    const person: Person = {
      ...p,
      id: String(p.id),
      experience: (p.experience || []).map((exp: any) => ({
        ...exp,
        startDate: exp.startDate ? new Date(exp.startDate) : undefined,
        endDate: exp.endDate ? new Date(exp.endDate) : undefined,
      })),
      education: (p.education || []).map((edu: any) => ({
        ...edu,
        startDate: edu.startDate ? new Date(edu.startDate) : undefined,
        endDate: edu.endDate ? new Date(edu.endDate) : undefined,
        gpa: typeof edu.gpa === 'string' ? parseFloat(edu.gpa) : edu.gpa,
      })),
      lastUpdated: p.lastUpdated ? new Date(p.lastUpdated) : new Date(),
    } as Person;

    return person;
  } catch (error) {
    console.error('Error getting person:', error);
    return null;
  }
};

/**
 * Get suggested connections for a user
 */

// ============================================
// SEARCH HISTORY SERVICE
// ============================================



/**
 * Get search history for a user
 */
export const getSearchHistory = async (userId: string, limit: number = 50): Promise<SearchHistory[]> => {
  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    const response = await axios.get(`${API_BASE}/search/history`, { // CHANGED THIS LINE
      params: { user_id: userId, limit },
      headers: {
        Authorization: token ? `Bearer ${token}` : '',
        Accept: 'application/json',
      },
    });

    const data = (response as any).data || [];
return (data as any[]).map((item: any) => ({
  id: String(item.id),
  query: item.query || '',
  filters: item.filters as SearchFilter,
  resultsCount: item.resultsCount,          // camelCase
  createdAt: new Date(item.createdAt),      // camelCase
  userId: String(item.userId),              // camelCase
}));
  } catch (error) {
    console.error('Error getting search history:', error);
    return [];
  }
};

/**
 * Delete a search history item
 */
export const deleteSearchHistory = async (historyId: string): Promise<boolean> => {
  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    await axios.delete(`${API_BASE}/search/history/${historyId}`, { // CHANGED THIS LINE
      headers: {
        Authorization: token ? `Bearer ${token}` : '',
        Accept: 'application/json',
      },
    });
    return true;
  } catch (error) {
    console.error('Error deleting search history:', error);
    return false;
  }
};

// ============================================
// ANALYTICS SERVICE
// ============================================

/**
 * Get analytics for a user
 */
export const getAnalytics = async (userId: string, range?: string): Promise<Analytics | null> => {
  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    const response = await axios.get(`${API_BASE}/analytics`, { // CHANGED THIS LINE
      params: { 
        user_id: userId,
        range: range || '30d' // Add range parameter
      },
      headers: {
        Authorization: token ? `Bearer ${token}` : '',
        Accept: 'application/json',
      },
    });

    const data = (response as any).data;
    // Expecting server to compute aggregates; fallback defaults handled by UI if needed
    const analytics: Analytics = {
      totalSearches: data.totalSearches ?? 0,
      totalExports: data.totalExports ?? 0,
      searchesInRange: data.searchesInRange ?? 0,
      exportsInRange: data.exportsInRange ?? 0,
      growthRate: data.growthRate ?? 0,
      exportRate: data.exportRate ?? 0,
      exportsThisMonth: data.exportsThisMonth ?? 0,
      topSearchedPositions: data.topSearchedPositions || [],
      searchesByDay: data.searchesByDay || [],
    };

    return analytics;
  } catch (error) {
    console.error('Error getting analytics:', error);
    return null;
  }
};

// ============================================
// HELPER FUNCTIONS
// ============================================

function transformPersonFromDB(data: any): Person {
  return {
    id: data.id,
    firstName: data.first_name,
    lastName: data.last_name,
    email: data.email || undefined,
    phone: data.phone || undefined,
    company: data.company || undefined,
    position: data.position || undefined,
    location: data.location || undefined,
    linkedinUrl: data.linkedin_url || undefined,
    avatar: data.avatar_url || undefined,
    bio: data.bio || undefined,
    skills: data.skills || [],
    experience: (data.experience || []).map((exp: any) => ({
      id: exp.id,
      company: exp.company,
      position: exp.position,
      startDate: new Date(exp.start_date),
      endDate: exp.end_date ? new Date(exp.end_date) : undefined,
      description: exp.description || undefined,
      current: exp.current,
    })),
    education: (data.education || []).map((edu: any) => ({
      id: edu.id,
      institution: edu.institution,
      degree: edu.degree,
      field: edu.field,
      startDate: new Date(edu.start_date),
      endDate: edu.end_date ? new Date(edu.end_date) : undefined,
      gpa: edu.gpa || undefined,
    })),
    socialProfiles: (data.social_profiles || []).map((profile: any) => ({
      platform: profile.platform,
      url: profile.url,
      username: profile.username || undefined,
    })),
    lastUpdated: new Date(data.last_updated),
  };
}

function calculateRelevanceScore(person: any, filters: SearchFilter): number {
  let score = 50; // Base score

  if (filters.name && person.first_name && person.last_name) {
    const fullName = `${person.first_name} ${person.last_name}`.toLowerCase();
    if (fullName.includes(filters.name.toLowerCase())) {
      score += 20;
    }
  }

  if (filters.company && person.company?.toLowerCase().includes(filters.company.toLowerCase())) {
    score += 15;
  }

  if (filters.position && person.position?.toLowerCase().includes(filters.position.toLowerCase())) {
    score += 15;
  }

  if (filters.location && person.location?.toLowerCase().includes(filters.location.toLowerCase())) {
    score += 10;
  }

  if (filters.skills && person.skills) {
    const matchingSkills = person.skills.filter((skill: string) =>
      filters.skills!.some(filterSkill => skill.toLowerCase().includes(filterSkill.toLowerCase()))
    );
    score += matchingSkills.length * 5;
  }

  return Math.min(score, 100);
}

function getMatchedFields(person: any, filters: SearchFilter): string[] {
  const matched: string[] = [];

  if (filters.name && person.first_name && person.last_name) {
    matched.push('name');
  }
  if (filters.company && person.company) {
    matched.push('company');
  }
  if (filters.position && person.position) {
    matched.push('position');
  }
  if (filters.location && person.location) {
    matched.push('location');
  }
  if (filters.skills && person.skills && person.skills.length > 0) {
    matched.push('skills');
  }

  return matched;
}

/**
 * Reveal a contact's email or phone number
 */
export const revealContact = async (personId: string, type: 'email' | 'phone'): Promise<{ status: string, value: string } | null> => {
  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    
    // UPDATED: Path now includes the personId in the URL
    const response = await axios.post(`${API_BASE}/people/${personId}/reveal`, 
      { type: type }, // Payload ONLY contains type now
      {
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      }
    );

    /**
     * BASED ON YOUR CURL: 
     * Success: { data: { email: "..." } }
     * Already Revealed: { message: "...", data: { email: "..." } }
     */
    const result = response.data;
    return {
      status: 'success',
      value: result.data[type] // Extract email or phone from the data object
    };
  } catch (error) {
    console.error('Error revealing contact:', error);
    return null;
  }
};


