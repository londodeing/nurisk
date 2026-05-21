// Search Domain - CRUD-friendly
import { client } from '../../core/client'
import type { SearchResponse, SearchResult, SearchCategory } from '@nurisk/shared-types/search'

export interface SearchParams {
  q: string
  categories?: SearchCategory[]
  limit?: number
  offset?: number
}

export const searchApi = {
  search: (params: SearchParams): Promise<SearchResponse> => {
    const searchParams = new URLSearchParams({
      q: params.q,
      limit: String(params.limit ?? 20),
      offset: String(params.offset ?? 0),
    })
    if (params.categories?.length) {
      searchParams.append('categories', params.categories.join(','))
    }
    return client.get<SearchResponse>(`/api/v1/search?${searchParams}`).then(
      (res) => res.data!
    )
  },

  searchIncidents: (query: string, limit = 10): Promise<SearchResult[]> =>
    client
      .get<SearchResponse>(`/api/v1/search/incidents`, {
        params: { q: query, limit },
      })
      .then((res) => res.data!.results),

  searchVolunteers: (query: string, limit = 10): Promise<SearchResult[]> =>
    client
      .get<SearchResponse>(`/api/v1/search/volunteers`, {
        params: { q: query, limit },
      })
      .then((res) => res.data!.results),

  searchShelters: (query: string, limit = 10): Promise<SearchResult[]> =>
    client
      .get<SearchResponse>(`/api/v1/search/shelters`, {
        params: { q: query, limit },
      })
      .then((res) => res.data!.results),

  searchWarehouses: (query: string, limit = 10): Promise<SearchResult[]> =>
    client
      .get<SearchResponse>(`/api/v1/search/warehouses`, {
        params: { q: query, limit },
      })
      .then((res) => res.data!.results),

  searchResources: (query: string, limit = 10): Promise<SearchResult[]> =>
    client
      .get<SearchResponse>(`/api/v1/search/resources`, {
        params: { q: query, limit },
      })
      .then((res) => res.data!.results),
}