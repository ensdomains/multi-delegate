import { toHex } from 'viem'

import { ponder } from '@/generated'

ponder.on('MultiDelegate:DelegationProcessed', async ({ event, context }) => {

  await context.db.insert(DelegationProcessedEvent).values({
    id: event.id,
    data: event.args,
  })
})

ponder.on('MultiDelegate:ProxyDeployed', async ({ event, context }) => {

  await context.db.insert(ProxyDeployedEvent).values({
    id: event.id,
    data: event.args,
  })
})


ponder.on('MultiDelegate:TransferBatch', async ({ event, context }) => {
  const { to, ids, values } = event.args
  const delegates = ids.map((id) => toHex(id))

  await context.db.insert(TransferBatchEvent).values({
    id: event.id,
    data: {
      ...event.args,
      ids: ids.map((id) => id),
      values: values.map((value) => value),
    },
  })

  if (to === '0x0000000000000000000000000000000000000000') return

  // Store any address that an account has ever delegated to, even if it's currently not
  // TODO: Store `amount` here as well so we don't need a separate endpoint
  await context.db.update(Account, { id: to }).set(({ current }: any) => ({
    delegates: Array.from(new Set([...current.delegates, ...delegates])),
  }))
})
