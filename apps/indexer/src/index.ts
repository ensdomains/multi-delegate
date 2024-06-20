import { ponder } from '@/generated'

ponder.on('MultiDelegate:DelegationProcessed', async ({ event, context }) => {
  const { DelegationProcessedEvent } = context.db
  const { from, to, amount } = event.args

  await DelegationProcessedEvent.create({
    id: event.log.id,
    data: event.args,
  })
})

ponder.on('MultiDelegate:ProxyDeployed', async ({ event, context }) => {
  const { ProxyDeployedEvent } = context.db
  const { delegate, proxyAddress } = event.args

  await ProxyDeployedEvent.create({
    id: event.log.id,
    data: event.args,
  })
})

ponder.on('MultiDelegate:TransferBatch', async ({ event, context }) => {
  const { TransferBatchEvent } = context.db
  const { operator, from, to, ids, values } = event.args

  await TransferBatchEvent.create({
    id: event.log.id,
    data: {
      ...event.args,
      ids: ids.map((id) => id),
      values: values.map((value) => value),
    },
  })
})
