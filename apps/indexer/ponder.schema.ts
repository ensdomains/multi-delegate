import { onchainTable } from 'ponder'

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

export const Account = onchainTable('Account',(p: any) => ({
  id: p.hex().primaryKey(),
  delegates: p.hex().array(),
}));

export const DelegationProcessedEvent = onchainTable('DelegationProcessedEvent',(p: any) => ({
  id: p.text().primaryKey(),
  from: p.hex(),
  to: p.hex(),
  amount: p.bigint(),
}));

export const  ProxyDeployedEvent = onchainTable('ProxyDeployedEvent',(p: any) => ({
    id: p.text().primaryKey(),
    delegate: p.hex(),
    proxyAddress: p.hex(),
}));

export const  TransferBatchEvent = onchainTable('TransferBatchEvent',(p: any) => ({
  id: p.text().primaryKey(),
  operator: p.hex(),
  from: p.hex(),
  to: p.hex(),
  ids: p.bigint().array(),
  values: p.bigint().array(),
}));
