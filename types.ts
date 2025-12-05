
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
}

export interface WebSource {
  uri: string;
  title: string;
}

export interface SearchState {
  query: string;
  results: VideoResult[];
  webSources: WebSource[];
  isLoading: boolean;
  error: string | null;
  hasSearched: boolean;
}
