import { graphql, eq } from 'ponder'
import { db } from "ponder:api";
import schema, { Account } from "ponder:schema";
import { Hono } from "hono";
import { cors } from 'hono/cors'
import { erc20MultiDelegateContract } from 'shared/contracts'
import { createPublicClient, isAddress } from 'viem'

const app = new Hono();

import ponderConfig from '../../ponder.config'

app.use('*', cors())

app.use('/', graphql({ db, schema }))

app.get('/:address', async (ctx) => {
  const { address } = ctx.req.param()
  const client = createPublicClient(ponderConfig.networks.mainnet)

  if (!isAddress(address)) {
    return ctx.json({ error: 'Invalid address' })
  }

  // .find(Account, { id: address })?.delegates || [];
  const result = await db.select({ delegates: Account.delegates }).from(Account).where(eq(Account.id, address)).limit(1);
  if (result.length === 0 || result[0]?.delegates?.length == null) {
    return ctx.json([]);
  }

  const { delegates } = result[0];
  const tokenIds = delegates.map((item: string | number | bigint | boolean) => BigInt(item))

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
  return ctx.json(
    data
      .filter((item) => item.amount !== '0')
      .map((item) => ({
        ...item,
        tokenId: item.tokenId.toString(),
      }))
  )
})

export default app;
