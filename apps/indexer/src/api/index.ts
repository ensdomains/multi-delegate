import { Hono } from 'hono'
import { eq, graphql } from 'ponder'
import { db, publicClients } from 'ponder:api'
import schema, { Account, DelegationProcessedEvent } from 'ponder:schema'
import { erc20MultiDelegateContract } from 'shared/contracts'
import { isAddress } from 'viem'

const app = new Hono()

app.use('/', graphql({ db, schema }))

app.get('/:address', async (ctx) => {
  const { address } = ctx.req.param()

  if (!isAddress(address)) {
    return ctx.json({ error: 'Invalid address' })
  }

  const result = await db
    .select()
    .from(Account)
    .where(eq(Account.id, address))
    .limit(1)

  if (result.length === 0 || result[0]?.delegates?.length == null) {
    return ctx.json([])
  }

  const { delegates } = result[0]
  const tokenIds = delegates.map((item: string | number | bigint | boolean) =>
    BigInt(item)
  )

  const balanceOf = await publicClients.mainnet.readContract({
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

export default app
