import { ponder } from 'ponder:registry'
import {
  Account,
  DelegationProcessedEvent,
  ProxyDeployedEvent,
  TransferBatchEvent,
  TransferEvent,
} from 'ponder:schema'
import { toHex, zeroAddress } from 'viem'

ponder.on('MultiDelegate:DelegationProcessed', async ({ event, context }) => {
  await context.db.insert(DelegationProcessedEvent).values({
    id: event.id,
    timestamp: event.block.timestamp,
    ...event.args,
  })
})

ponder.on('MultiDelegate:ProxyDeployed', async ({ event, context }) => {
  await context.db.insert(ProxyDeployedEvent).values({
    id: event.id,
    timestamp: event.block.timestamp,
    ...event.args,
  })
})

ponder.on('MultiDelegate:TransferBatch', async ({ event, context }) => {
  const { to, ids, values } = event.args
  const delegates = ids.map((id) => toHex(id))

  await context.db.insert(TransferBatchEvent).values({
    id: event.id,
    timestamp: event.block.timestamp,
    ...event.args,
    ids: ids.map((id) => id),
    values: values.map((value) => value),
  })

  if (to === zeroAddress) return

  // Store any address that an account has ever delegated to, even if it's currently not
  // TODO: Store `amount` here as well so we don't need a separate endpoint
  await context.db
    .insert(Account)
    .values({
      id: to,
      delegates,
    })
    .onConflictDoUpdate((current) => ({
      delegates: Array.from(
        new Set([...(current.delegates || []), ...delegates])
      ),
    }))
})

ponder.on('MultiDelegate:TransferSingle', async ({ event, context }) => {
  const { to, id, value } = event.args
  const delegate = toHex(id)

  await context.db.insert(TransferEvent).values({
    key: event.id,
    timestamp: event.block.timestamp,
    ...event.args,
  })

  if (to === zeroAddress) return

  // Store any address that an account has ever delegated to, even if it's currently not
  // TODO: Store `amount` here as well so we don't need a separate endpoint
  await context.db
    .insert(Account)
    .values({
      id: to,
      delegates: [delegate],
    })
    .onConflictDoUpdate((current) => ({
      delegates: Array.from(new Set([...(current.delegates || []), delegate])),
    }))
})
