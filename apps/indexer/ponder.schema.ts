import { onchainTable } from 'ponder'

export const Account = onchainTable('Account', (t) => ({
  id: t.hex().primaryKey(),
  delegates: t.hex().array().notNull(),
}))

export const DelegationProcessedEvent = onchainTable(
  'DelegationProcessedEvent',
  (t) => ({
    id: t.text().primaryKey(),
    timestamp: t.bigint().notNull(),
    owner: t.hex().notNull(),
    from: t.hex().notNull(),
    to: t.hex().notNull(),
    amount: t.bigint().notNull(),
  })
)

export const ProxyDeployedEvent = onchainTable('ProxyDeployedEvent', (t) => ({
  id: t.text().primaryKey(),
  timestamp: t.bigint().notNull(),
  delegate: t.hex().notNull(),
  proxyAddress: t.hex().notNull(),
}))

export const TransferBatchEvent = onchainTable('TransferBatchEvent', (t) => ({
  id: t.text().primaryKey(),
  timestamp: t.bigint().notNull(),
  operator: t.hex().notNull(),
  from: t.hex().notNull(),
  to: t.hex().notNull(),
  ids: t.bigint().array().notNull(),
  values: t.bigint().array().notNull(),
}))

export const TransferEvent = onchainTable('TransferEvent', (t) => ({
  key: t.text().primaryKey(),
  timestamp: t.bigint().notNull(),
  operator: t.hex().notNull(),
  from: t.hex().notNull(),
  to: t.hex().notNull(),
  id: t.bigint().notNull(),
  value: t.bigint().notNull(),
}))
