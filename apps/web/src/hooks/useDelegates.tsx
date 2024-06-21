import { useQuery } from '@tanstack/react-query'
import { Address, isAddress } from 'viem'

import { PONDER_URL } from '../lib/env'

// TODO: this should probably be specified in the `indexer` package and imported here
type DelegateApiResponse = {
  delegate: Address
  tokenId: string
  amount: string
}

export function useDelegates(address?: Address | null) {
  return useQuery<DelegateApiResponse[]>({
    queryKey: ['delegates', address],
    queryFn: async () => {
      if (!address || !isAddress(address)) return

      const response = await fetch(`${PONDER_URL}/${address}`)
      const data = await response.json()

      if (data.error) {
        throw new Error(data.error)
      }

      return data
    },
  })
}
