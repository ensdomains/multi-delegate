import { graphql } from '@ponder/core'
import { cors } from 'hono/cors'
import { createPublicClient, isAddress } from 'viem'
import { mainnet } from 'viem/chains'
import { createContractConfigs } from 'shared/contracts'

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
  const contracts = createContractConfigs(mainnet.id)

  const balanceOf = await client.readContract({
    ...contracts.erc20MultiDelegate,
    functionName: 'balanceOfBatch',
    args: [new Array(tokenIds.length).fill(address), tokenIds],
  })

  const data = tokenIds.map((tokenId, index) => ({
    delegate: delegates[index],
    tokenId,
    amount: balanceOf[index]!.toString(),
  }))

  // remove delegates with no balance
  return c.json(
    data
      .filter((item) => item.amount !== '0')
      .map((item) => ({
        ...item,
        tokenId: item.tokenId.toString(),
      }))
  )
})
