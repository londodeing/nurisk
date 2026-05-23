// Search Service - SDK wrapper for backward compatibility
// Uses canonical types from @nurisk/shared-types and SDK from @nurisk/sdk

import {
  SearchApi,
  type SearchOptions,
  type RecentSearch,
  type SearchCategory,
} from '@nurisk/sdk'
import type { SearchResult, SearchResponse } from '@nurisk/shared-types/search'

export type { SearchOptions, RecentSearch, SearchCategory }
export type { SearchResult, SearchResponse }

// Create SDK instance
const searchApi = new SearchApi({ baseUrl: '/api' })

// Re-export SDK methods for service compatibility
export const search = (options: SearchOptions) => searchApi.search(options)
export const getRecentSearches = () => searchApi.getRecentSearches()
export const clearRecentSearches = () => searchApi.clearRecentSearches()
export const saveRecentSearch = (query: string) => searchApi.saveRecentSearch(query)

// Utility functions
export const highlightMatch = (text: string, query: string): string => {
  if (!query) return text
  const regex = new RegExp(`(${query})`, 'gi')
  return text.replace(regex, '<mark>$1</mark>')
}

export const groupResultsByCategory = (results: SearchResult[]): Record<string, SearchResult[]> => {
  return results.reduce(
    (acc, result) => {
      const category = result.type
      if (!acc[category]) {
        acc[category] = []
      }
      acc[category].push(result)
      return acc
    },
    {} as Record<string, SearchResult[]>
  )
}

export const getCategoryLabel = (category: string): string => {
  const labels: Record<string, string> = {
    incidents: 'Incidents',
    volunteers: 'Volunteers',
    shelters: 'Shelters',
    warehouses: 'Warehouses',
    resources: 'Resources',
  }
  return labels[category] ?? category
}