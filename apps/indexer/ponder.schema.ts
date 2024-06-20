import { createSchema } from '@ponder/core'

export default createSchema((p) => ({
  DelegationProcessedEvent: p.createTable({
    id: p.string(),
    from: p.hex(),
    to: p.hex(),
    amount: p.bigint(),
  }),

  ProxyDeployedEvent: p.createTable({
    id: p.string(),
    delegate: p.hex(),
    proxyAddress: p.hex(),
  }),

  TransferBatchEvent: p.createTable({
    id: p.string(),
    operator: p.hex(),
    from: p.hex(),
    to: p.hex(),
    ids: p.bigint().list(),
    values: p.bigint().list(),
  }),
}))
