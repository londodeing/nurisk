/**
 * NURisk SDK - Search API
 * Global search API for incidents, volunteers, shelters, warehouses, and resources
 */
import type { SearchResult, SearchResponse } from '@nurisk/shared-types/search'

export type SearchCategory = 'incidents' | 'volunteers' | 'shelters' | 'warehouses' | 'resources'

export interface SearchOptions {
  query: string
  categories?: SearchCategory[]
  limit?: number
  offset?: number
}

export interface RecentSearch {
  id: string
  query: string
  timestamp: number
}

export interface SearchApiConfig {
  baseUrl?: string
}

export class SearchApi {
  private baseUrl: string

  constructor(config: SearchApiConfig = {}) {
    this.baseUrl = config.baseUrl ?? '/api'
  }

  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      credentials: 'include',
    })

    if (!response.ok) {
      throw new Error(`SearchApi: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }

  /**
   * Search all categories
   */
  async searchAll(options: SearchOptions): Promise<SearchResponse> {
    const { query, categories, limit = 20, offset = 0 } = options

    const params = new URLSearchParams({
      q: query,
      limit: String(limit),
      offset: String(offset),
    })

    if (categories && categories.length > 0) {
      params.append('categories', categories.join(','))
    }

    return this.request<SearchResponse>(`/search?${params.toString()}`)
  }

  /**
   * Search incidents only
   */
  async searchIncidents(query: string, limit = 10): Promise<SearchResult[]> {
    const response = await this.request<{ results: SearchResult[] }>(`/search/incidents?q=${encodeURIComponent(query)}&limit=${limit}`)
    return response.results
  }

  /**
   * Search volunteers only
   */
  async searchVolunteers(query: string, limit = 10): Promise<SearchResult[]> {
    const response = await this.request<{ results: SearchResult[] }>(`/search/volunteers?q=${encodeURIComponent(query)}&limit=${limit}`)
    return response.results
  }

  /**
   * Search shelters only
   */
  async searchShelters(query: string, limit = 10): Promise<SearchResult[]> {
    const response = await this.request<{ results: SearchResult[] }>(`/search/shelters?q=${encodeURIComponent(query)}&limit=${limit}`)
    return response.results
  }

  /**
   * Search warehouses only
   */
  async searchWarehouses(query: string, limit = 10): Promise<SearchResult[]> {
    const response = await this.request<{ results: SearchResult[] }>(`/search/warehouses?q=${encodeURIComponent(query)}&limit=${limit}`)
    return response.results
  }

  /**
   * Search resources only
   */
  async searchResources(query: string, limit = 10): Promise<SearchResult[]> {
    const response = await this.request<{ results: SearchResult[] }>(`/search/resources?q=${encodeURIComponent(query)}&limit=${limit}`)
    return response.results
  }

  // =============================================================================
  // Local Storage Functions
  // =============================================================================

  /**
   * Get recent searches from local storage
   */
  getRecentSearches(): RecentSearch[] {
    try {
      const stored = localStorage.getItem('nusearch_recent')
      if (!stored) return []
      return JSON.parse(stored)
    } catch {
      return []
    }
  }

  /**
   * Save recent search
   */
  saveRecentSearch(query: string): void {
    if (!query.trim()) return

    const recent = this.getRecentSearches()
    const newSearch: RecentSearch = {
      id: `search_${Date.now()}`,
      query: query.trim(),
      timestamp: Date.now(),
    }

    // Remove duplicate queries
    const filtered = recent.filter((s) => s.query.toLowerCase() !== query.toLowerCase())

    // Add new search at the beginning
    const updated = [newSearch, ...filtered].slice(0, 10)

    localStorage.setItem('nusearch_recent', JSON.stringify(updated))
  }

  /**
   * Clear recent searches
   */
  clearRecentSearches(): void {
    localStorage.removeItem('nusearch_recent')
  }

  /**
   * Remove single recent search
   */
  removeRecentSearch(id: string): void {
    const recent = this.getRecentSearches()
    const filtered = recent.filter((s) => s.id !== id)
    localStorage.setItem('nusearch_recent', JSON.stringify(filtered))
  }

  // =============================================================================
  // Search Suggestions
  // =============================================================================

  /**
   * Get search suggestions based on query
   */
  getSuggestions(query: string): string[] {
    const suggestions: Record<string, string[]> = {
      incidents: [
        'Banjir',
        'Tanah Longsor',
        'Kebakaran',
        'Gempa Bumi',
        'Erupsi Gunung Api',
      ],
      volunteers: [
        'Relawan',
        'Tim Medis',
        'Tim Evakuasi',
        'Koordinator',
      ],
      shelters: [
        'Pengungsian',
        'Sekolah',
        'Masjid',
        'Gedung',
      ],
      warehouses: [
        'Gudang',
        'Logistik',
        'Bantuan',
      ],
      resources: [
        'Makanan',
        'Obat',
        'Selimut',
        'Tenda',
      ],
    }

    const results: string[] = []
    const lowerQuery = query.toLowerCase()

    // Search in all categories
    Object.values(suggestions).forEach((categorySuggestions) => {
      categorySuggestions.forEach((suggestion) => {
        if (suggestion.toLowerCase().includes(lowerQuery)) {
          results.push(suggestion)
        }
      })
    })

    // Add exact matches from suggestions if no match
    if (results.length === 0 && query.length >= 2) {
      Object.values(suggestions).forEach((categorySuggestions) => {
        categorySuggestions.forEach((suggestion) => {
          if (!results.includes(suggestion)) {
            results.push(suggestion)
          }
        })
      })
    }

    return results.slice(0, 5)
  }

  // =============================================================================
  // Utility Functions
  // =============================================================================

  /**
   * Get category label
   */
  getCategoryLabel(category: SearchCategory): string {
    const labels: Record<SearchCategory, string> = {
      incidents: 'Insiden',
      volunteers: 'Relawan',
      shelters: 'Pengungsian',
      warehouses: 'Gudang',
      resources: 'Sumber Daya',
    }
    return labels[category]
  }

  /**
   * Get category icon
   */
  getCategoryIcon(category: SearchCategory): string {
    const icons: Record<SearchCategory, string> = {
      incidents: 'alert-circle',
      volunteers: 'users',
      shelters: 'home',
      warehouses: 'warehouse',
      resources: 'package',
    }
    return icons[category]
  }

  /**
   * Group search results by category
   */
  groupResultsByCategory(results: SearchResult[]): Record<SearchCategory, SearchResult[]> {
    const grouped: Record<SearchCategory, SearchResult[]> = {
      incidents: [],
      volunteers: [],
      shelters: [],
      warehouses: [],
      resources: [],
    }

    results.forEach((result) => {
      if (grouped[result.type as SearchCategory]) {
        grouped[result.type as SearchCategory].push(result)
      }
    })

    return grouped
  }

  /**
   * Highlight matched text
   */
  highlightMatch(text: string, query: string): string {
    if (!query.trim()) return text

    const regex = new RegExp(`(${this.escapeRegex(query)})`, 'gi')
    return text.replace(regex, '<mark>$1</mark>')
  }

  private escapeRegex(string: string): string {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  }

  /**
   * Calculate typo tolerance (Levenshtein distance)
   */
  isWithinTypoTolerance(source: string, target: string, maxDistance = 2): boolean {
    const sourceLen = source.length
    const targetLen = target.length

    // Quick check: length difference
    if (Math.abs(sourceLen - targetLen) > maxDistance) {
      return false
    }

    // Create distance matrix
    const matrix: number[][] = Array(sourceLen + 1)
      .fill(null)
      .map(() => Array(targetLen + 1).fill(0))

    // Initialize
    for (let i = 0; i <= sourceLen; i++) {
      matrix[i][0] = i
    }
    for (let j = 0; j <= targetLen; j++) {
      matrix[0][j] = j
    }

    // Fill matrix
    for (let i = 1; i <= sourceLen; i++) {
      for (let j = 1; j <= targetLen; j++) {
        const cost = source[i - 1] === target[j - 1] ? 0 : 1
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1, // deletion
          matrix[i][j - 1] + 1, // insertion
          matrix[i - 1][j - 1] + cost // substitution
        )
      }
    }

    return matrix[sourceLen][targetLen] <= maxDistance
  }

  /**
   * Fuzzy search match
   */
  fuzzyMatch(text: string, query: string): boolean {
    const lowerText = text.toLowerCase()
    const lowerQuery = query.toLowerCase()

    // Exact match
    if (lowerText.includes(lowerQuery)) {
      return true
    }

    // Typo tolerance
    if (this.isWithinTypoTolerance(lowerText, lowerQuery, 2)) {
      return true
    }

    // Word match
    const textWords = lowerText.split(/\s+/)
    const queryWords = lowerQuery.split(/\s+/)

    return queryWords.every((queryWord) =>
      textWords.some((textWord) =>
        textWord.includes(queryWord) || this.isWithinTypoTolerance(textWord, queryWord, 1)
      )
    )
  }
}