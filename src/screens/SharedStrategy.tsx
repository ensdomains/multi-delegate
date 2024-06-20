import { Card, Heading, Helper, Spinner, Typography } from '@ensdomains/thorin'
import { useParams } from 'react-router-dom'
import { Address, isAddress } from 'viem'
import { useEnsAddress, useEnsName, useReadContracts } from 'wagmi'

import { DelegatePill } from '../components/DelegatePill'
import { InnerCard } from '../components/InnerCard'
import { ensTokenContract } from '../lib/contracts'
import { checkIfUsingMultiDelegate, truncateAddress } from '../lib/utils'

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

  const isUsingMultiDelegate = checkIfUsingMultiDelegate(
    delegateFromTokenContract
  )

  if (ensName.isLoading || ensAddress.isLoading) {
    return <Spinner size="medium" />
  }

  if (!isParamAddress && !ensAddress.data) {
    return <Helper type="error">Invalid name or address</Helper>
  }

  return (
    <>
      <Heading className="mb-4">{name}'s Strategy</Heading>

      <Card>
        {/* TODO: Break this out into a separate component since it shares logic with <Strategy /> */}
        <InnerCard>
          {isUsingMultiDelegate ? (
            // I think we have to build an indexer to check the delegates
            <Typography asProp="p">They are using multi-delegate</Typography>
          ) : (
            <div className="flex flex-wrap justify-center gap-2">
              <DelegatePill
                address={delegateFromTokenContract}
                amount={balance}
              />
            </div>
          )}
        </InnerCard>
      </Card>
    </>
  )
}
