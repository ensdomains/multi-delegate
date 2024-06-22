import { Card, Heading, Helper, Spinner } from '@ensdomains/thorin'
import { useParams } from 'react-router-dom'
import { ensTokenContract } from 'shared/contracts'
import { Address, isAddress } from 'viem'
import { useEnsAddress, useEnsName, useReadContracts } from 'wagmi'

import { DelegatePill } from '../components/DelegatePill'
import { InnerCard } from '../components/InnerCard'
import { useDelegates } from '../hooks/useDelegates'
import { truncateAddress } from '../lib/utils'

/* TODO: Maybe break some of this file into a separate component since it shares quite a bit of code with <Strategy /> */
export function SharedStrategy() {
  const { addressOrName } = useParams() as { addressOrName: string }
  const isParamAddress = isAddress(addressOrName, { strict: false })

  const ensName = useEnsName({
    address: addressOrName as Address,
    query: { enabled: isParamAddress },
  })

  const ensAddress = useEnsAddress({
    name: addressOrName,
    query: { enabled: !isParamAddress },
  })

  const address = isParamAddress ? addressOrName : ensAddress.data

  const name = !isParamAddress
    ? addressOrName
    : ensName.data || truncateAddress(addressOrName)

  const multiDelegate = useDelegates(address)

  const { data: delegateInfo } = useReadContracts({
    contracts: [
      {
        ...ensTokenContract,
        functionName: 'delegates',
        args: address ? [address] : undefined,
      },
      {
        ...ensTokenContract,
        functionName: 'balanceOf',
        args: address ? [address] : undefined,
      },
    ],
  })

  const [_delegateFromTokenContract, _balance] = delegateInfo || []
  const balance = _balance?.result
  const delegateFromTokenContract = _delegateFromTokenContract?.result

  if (ensName.isLoading || ensAddress.isLoading) {
    return <Spinner size="medium" />
  }

  if (!isParamAddress && !ensAddress.data) {
    return <Helper type="error">Invalid name or address</Helper>
  }

  return (
    <>
      <Heading className="mb-4">{name}'s Strategy</Heading>

      <Card className="text-center">
        <InnerCard className="flex flex-wrap justify-center gap-2">
          <>
            {/* Delegation from token contract */}
            {balance && (
              <DelegatePill
                address={delegateFromTokenContract}
                amount={balance}
                tooltip="From the token contract"
              />
            )}

            {/* Delegations from multi-delegate contract */}
            {multiDelegate.data?.map((delegate) => (
              <DelegatePill
                address={delegate.delegate}
                amount={BigInt(delegate.amount)}
              />
            ))}
          </>
        </InnerCard>
      </Card>
    </>
  )
}
