import { graphql } from '@ponder/core'
import { cors } from 'hono/cors'
import { erc20MultiDelegateContract } from 'shared/contracts'
import { createPublicClient, isAddress } from 'viem'

import { ponder } from '@/generated'

import ponderConfig from '../../ponder.config'

ponder.use('*', cors())

ponder.use('/', graphql())

ponder.get('/:address', async (c) => {
  const { address } = c.req.param()
  const { Account } = c.get('db')
  const client = createPublicClient(ponderConfig.networks.mainnet)

  if (!isAddress(address)) {
    return c.json({ error: 'Invalid address' })
  }

  const delegates = (await Account.findUnique({ id: address }))?.delegates || []
  const tokenIds = delegates.map((item) => BigInt(item))

  const balanceOf = await client.readContract({
    ...erc20MultiDelegateContract,
    functionName: 'balanceOfBatch',
    args: [new Array(tokenIds.length).fill(address), tokenIds],
  })

  const data = tokenIds.map((tokenId, index) => ({
    delegate: delegates[index],
    tokenId,
    amount: balanceOf[index]!.toString(),
  }))

  // remove delegates with no balance
  return c.json(data.filter((item) => item.amount !== '0'))
})
