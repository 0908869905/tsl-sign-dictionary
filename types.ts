
export interface VideoResult {
  id: string; // Unique ID for the result
  youtubeId: string;
  title: string;
  date: string;
  timestamp: number; // The second where the word appears
  transcriptSnippet: string; // The sentence containing the keyword
  matchedTerm?: string; // The specific term (query or synonym) that matched
  matchIndex?: number; // Start index of match for highlighting
  matchLength?: number; // Length of match for highlighting
  category: 'medical' | 'daily'; // New category field
}

export interface SearchState {
  query: string;
  results: VideoResult[];
  isLoading: boolean;
  error: string | null;
  hasSearched: boolean;
}

export interface Feedback {
  id: string;
  date: string;
  content: string;
  type: string;
}

export interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  updated_at: string;
}

export type Language = 'zh' | 'en';
