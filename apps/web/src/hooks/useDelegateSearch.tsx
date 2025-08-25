import { useQuery } from '@tanstack/react-query'
import { Address, isAddress } from 'viem'

import { GRAPH_URL } from '../lib/env'

type SearchResult =
  | { name: string; address?: undefined }
  | { name?: undefined; address: Address }

export function useDelegateSearch(searchQuery: string) {
  return useQuery<SearchResult[]>({
    queryKey: ['delegateSearch', searchQuery],
    queryFn: async () => {
      if (searchQuery === '') {
        return []
      }

      // If the user types in a name directly, we can skip the subgraph query
      if (searchQuery.endsWith('.eth')) {
        return [{ name: searchQuery }]
      }

      // If the user types in an address directly, we can skip the subgraph query
      if (isAddress(searchQuery)) {
        return [{ address: searchQuery }]
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

      // If `searchQuery` is in the list of domains, remove it
      const names = json.data.domains.filter((d) => d.name !== searchQuery)

      // If `searchQuery` is a potential domain, add it to the top of the list
      if (searchQuery.includes('.') && searchQuery.length > 3) {
        names.unshift({ name: searchQuery })
      }

      return names
    },
  })
}
