import { Card, Heading, Helper, Spinner, Typography } from '@ensdomains/thorin'
import { useParams } from 'react-router-dom'
import { Address, isAddress } from 'viem'
import { useEnsAddress, useEnsName } from 'wagmi'

import { DelegatePill } from '../components/DelegatePill'
import { InnerCard } from '../components/InnerCard'
import { useDelegates } from '../hooks/useDelegates'
import { truncateAddress } from '../lib/utils'

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
        <Typography asProp="p">
          This only shows delegations via the multi-delegate contract. If
          additional tokens are delegated directly from the token contract, they
          will not be shown here.
        </Typography>

        {/* TODO: Break this out into a separate component since it shares logic with <Strategy /> */}
        <InnerCard className="flex flex-wrap justify-center gap-2">
          {/* Delegations from multi-delegate contract */}
          {multiDelegate.data?.map((delegate) => (
            <DelegatePill
              address={delegate.delegate}
              amount={BigInt(delegate.amount)}
            />
          ))}
        </InnerCard>
      </Card>
    </>
  )
}
