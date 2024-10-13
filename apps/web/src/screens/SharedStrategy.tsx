import {
  Card,
  Heading,
  OutlinkSVG,
  Skeleton,
  SkeletonGroup,
  Typography,
} from '@ensdomains/thorin'
import { Link, useParams } from 'react-router-dom'
import { Address, isAddress } from 'viem'
import { useEnsAddress, useEnsAvatar, useEnsName, useEnsText } from 'wagmi'

import profileIcon from '../assets/profileIcon.svg'
import { DelegatePill } from '../components/DelegatePill'
import { InnerCard } from '../components/InnerCard'
import { useDelegationInfo } from '../hooks/useDelegationInfo'
import { checkHasBalance, truncateAddress } from '../lib/utils'

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

  const { data: ensAvatar } = useEnsAvatar({ name })
  const { data: ensDescription } = useEnsText({ name, key: 'description' })
  const delegationInfo = useDelegationInfo(address)

  const { multiDelegates, delegateFromTokenContract, balance } =
    delegationInfo.data ?? {}

  return (
    <SkeletonGroup loading={ensName.isLoading || ensAddress.isLoading}>
      <Heading className="mb-4">View Strategy</Heading>

      <Card className="mb-4">
        <div className="flex flex-col items-start sm:flex-row sm:items-center sm:gap-4">
          <div className="aspect-square w-14 overflow-hidden rounded-full bg-red-300 sm:w-20">
            <img
              src={ensAvatar || profileIcon}
              className="w-full object-cover"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Typography data-testid="strategy-name" fontVariant="headingTwo">
              {name}
            </Typography>
            <Typography data-testid="description">{ensDescription}</Typography>
          </div>
        </div>
      </Card>

      <Card className="text-center">
        <InnerCard className="flex flex-wrap justify-center gap-2">
          {(() => {
            if (balance === undefined || multiDelegates === undefined) {
              return (
                <div className="overflow-hidden rounded-full">
                  <Skeleton loading>
                    <DelegatePill address="0x00000000" amount={1000n} />
                  </Skeleton>
                </div>
              )
            }

            if (!checkHasBalance({ balance, multiDelegates })) {
              return (
                <Typography asProp="span" color="grey">
                  No $ENS to delegate.
                </Typography>
              )
            }

            return (
              <>
                {/* Delegation from token contract */}
                {balance && (
                  <DelegatePill
                    address={delegateFromTokenContract || undefined}
                    amount={balance}
                    tooltip="From the token contract"
                    source="token"
                  />
                )}

                {/* Delegations from multi-delegate contract */}
                {multiDelegates &&
                  multiDelegates.map((delegate) => (
                    <DelegatePill
                      address={delegate.delegate}
                      amount={BigInt(delegate.amount)}
                    />
                  ))}
              </>
            )
          })()}
        </InnerCard>

        <div className="flex flex-col items-center gap-1">
          <Typography>
            You are viewing the strategy of <strong>{name}</strong>
          </Typography>

          <Link to={`/strategy`} className=" flex items-center gap-1">
            <Typography color="blue">View your own strategy</Typography>
            <OutlinkSVG className="text-ens-blue-primary" />
          </Link>
        </div>
      </Card>
    </SkeletonGroup>
  )
}
