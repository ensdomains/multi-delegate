import { createSchema } from '@ponder/core'

/* 
I want to be able to query the following:

{
  account ("0x123") {
    delegates {
      id
      amount
    }
  }
}

or if that doesn't work, this is ok:

{
  account ("0x123") {
    delegates
    values
  }
}

last option is a custom GET endpoint that returns something like this:

[
  {
    "delegate": "0x534631bcf33bdb069fb20a93d2fdb9e4d4dd42cf",
    "tokenId": "475411618940684652382658899876961866559843549903",
    "amount": "25000000000000000000"
  },
  {
    "delegate": "0xa7860e99e3ce0752d1ac53b974e309fff80277c6",
    "tokenId": "956391030522194004329440103514838893413546489798",
    "amount": "10000000000000000000"
  },
]
*/

export default createSchema((p) => ({
  Account: p.createTable({
    id: p.hex(),
    delegates: p.hex().list(),
  }),

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
