import { useQuery } from '@tanstack/react-query'

import { GRAPH_URL } from '../lib/env'

type SearchResult = { name: string }

export function useDelegateSearch(searchQuery: string) {
  return useQuery<SearchResult[]>({
    queryKey: ['delegateSearch', searchQuery],
    queryFn: async () => {
      if (searchQuery === '') {
        return []
      }

      const res = await fetch(GRAPH_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `
            query {
              domains(
                first: 8,
                where: {
                  name_starts_with: "${searchQuery}",
                  resolver_not: null
                },
                orderBy: registration__registrationDate,
                orderDirection: asc
              ) {
                name
              }
            }
          `,
        }),
      })

      const json = (await res.json()) as {
        data: { domains: { name: string }[] }
      }

      // Fake search results
      return json.data.domains
    },
  })
}
