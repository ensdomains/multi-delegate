import { graphql } from '@ponder/core'
import { erc20MultiDelegateContract } from 'shared/contracts'
import { createPublicClient, isAddress } from 'viem'

import { ponder } from '@/generated'

import ponderConfig from '../../ponder.config'

ponder.use('/', graphql())

ponder.get('/:address', async (c) => {
  const { address } = c.req.param()
  const { Account } = c.get('db')
  const client = createPublicClient(ponderConfig.networks.mainnet)

  if (!isAddress(address)) {
    return c.json({ error: 'Invalid address' })
  }

  const delegates = (await Account.findUnique({ id: address }))?.delegates || []

  const balanceOf = await client.readContract({
    ...erc20MultiDelegateContract,
    functionName: 'balanceOfBatch',
    args: [
      delegates.map(() => address), // address (we use the map to match the length of the delegates array)
      delegates.map((item) => BigInt(item)), // tokenId
    ],
  })

  const data = delegates.map((delegate, index) => ({
    delegate,
    tokenId: BigInt(delegate).toString(),
    amount: balanceOf[index]?.toString(),
  }))

  return c.json(data)
})
