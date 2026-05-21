export interface SearchCategory {
  id: string;
  name: string;
  type: string;
  resultCount: number;
}

export interface SearchResult {
  id: string;
  type: string;
  title: string;
  description: string;
  url?: string;
  score: number;
  metadata?: Record<string, unknown>;
  matchedFields?: string[];
}

export interface SearchResponse {
  query: string;
  results: SearchResult[];
  categories: SearchCategory[];
  totalResults: number;
  page: number;
  pageSize: number;
  took: number;
}
