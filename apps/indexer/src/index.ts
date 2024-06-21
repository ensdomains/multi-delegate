import { toHex } from 'viem'

import { ponder } from '@/generated'

ponder.on('MultiDelegate:DelegationProcessed', async ({ event, context }) => {
  const { DelegationProcessedEvent } = context.db

  await DelegationProcessedEvent.create({
    id: event.log.id,
    data: event.args,
  })
})

ponder.on('MultiDelegate:ProxyDeployed', async ({ event, context }) => {
  const { ProxyDeployedEvent } = context.db

  await ProxyDeployedEvent.create({
    id: event.log.id,
    data: event.args,
  })
})

ponder.on('MultiDelegate:TransferBatch', async ({ event, context }) => {
  const { Account, TransferBatchEvent } = context.db
  const { to, ids, values } = event.args
  const delegates = ids.map((id) => toHex(id))

  await TransferBatchEvent.create({
    id: event.log.id,
    data: {
      ...event.args,
      ids: ids.map((id) => id),
      values: values.map((value) => value),
    },
  })

  if (to === '0x0000000000000000000000000000000000000000') return

  // Store any address that an account has ever delegated to, even if it's currently not
  // TODO: Store `amount` here as well so we don't need a separate endpoint
  await Account.upsert({
    id: to,
    create: {
      delegates,
    },
    update: ({ current }) => ({
      delegates: Array.from(new Set([...current.delegates, ...delegates])),
    }),
  })
})
