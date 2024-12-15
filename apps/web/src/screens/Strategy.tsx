import {
  Button,
  Card,
  CopySVG,
  Heading,
  Helper,
  RightArrowSVG,
  Skeleton,
  Toast,
  Typography,
} from '@ensdomains/thorin'
import { useConnectModal } from '@rainbow-me/rainbowkit'
import { useState } from 'react'
import { useAccount, useEnsName } from 'wagmi'

import { ButtonWrapper } from '../components/ButtonWrapper'
import { DelegatePill } from '../components/DelegatePill'
import { InnerCard } from '../components/InnerCard'
import { useDelegationInfo } from '../hooks/useDelegationInfo'
import { NULL, checkHasBalance, cn } from '../lib/utils'

export function Strategy() {
  const { address } = useAccount()
  const { data: ensName } = useEnsName({ address })
  const { openConnectModal } = useConnectModal()
  const delegationInfo = useDelegationInfo(address)

  const [toast, setToast] = useState<{ title?: string; description?: string }>(
    {}
  )

  const { multiDelegates, delegateFromTokenContract, balance } =
    delegationInfo.data ?? {}

  const isUsingMultiDelegate = !!multiDelegates

  return (
    <>
      <Heading className="mb-4">Your Strategy</Heading>

      <Card className="text-center">
        <Typography asProp="p">
          Delegate, rebalance or reclaim your votes to any number of delegates
          with a single transaction.
        </Typography>

        {(() => {
          if (!address) {
            return (
              <InnerCard>
                <Typography asProp="p">
                  Connect your wallet to see your delegation strategy.
                </Typography>
              </InnerCard>
            )
          }

          if (delegationInfo.isLoading) {
            return (
              <InnerCard className="flex justify-center">
                <div className="overflow-hidden rounded-full">
                  <Skeleton loading data-testid="skeleton-loading">
                    <DelegatePill address="0x00000000" amount={1000n} />
                  </Skeleton>
                </div>
              </InnerCard>
            )
          }

          if (!checkHasBalance({ balance, multiDelegates })) {
            return (
              <Helper type="warning">
                <Typography asProp="p">
                  You do not have any $ENS to delegate.
                </Typography>
              </Helper>
            )
          }

          return (
            <InnerCard className="flex flex-wrap justify-center gap-2">
              <>
                {/* Delegation from token contract */}
                {balance && (
                  <DelegatePill
                    address={delegateFromTokenContract ?? undefined}
                    amount={balance}
                    tooltip="From the token contract"
                    source="token"
                  />
                )}

                {/* Delegations from multi-delegate contract */}
                {multiDelegates?.map((delegate) => (
                  <DelegatePill
                    key={delegate.delegate}
                    address={delegate.delegate}
                    amount={BigInt(delegate.amount)}
                  />
                ))}
              </>
            </InnerCard>
          )
        })()}

        {checkHasBalance({ balance, multiDelegates }) && (
          <Helper type="info">
            Tokens delegated via the Multi-Delegate contract will appear as NFTs
            in your wallet.
          </Helper>
        )}

        <ButtonWrapper>
          {(() => {
            if (!address) {
              return (
                <Button className="" onClick={openConnectModal}>
                  Connect
                </Button>
              )
            }

            const btnDisabled = balance === 0n && multiDelegates?.length === 0
            const isUndelegated =
              !isUsingMultiDelegate && delegateFromTokenContract === NULL

            return (
              <>
                {!btnDisabled && !isUndelegated && (
                  <Button
                    suffix={<CopySVG />}
                    colorStyle="blueSecondary"
                    onClick={async () => {
                      await navigator.clipboard.writeText(
                        `${window.location.origin}/strategy/${ensName || address}`
                      )

                      setToast({
                        title: 'Link copied',
                        description: 'Your strategy link has been copied.',
                      })
                    }}
                  >
                    Share strategy
                  </Button>
                )}

                <Button
                  as="a"
                  href="/manage"
                  suffix={<RightArrowSVG />}
                  colorStyle={btnDisabled ? 'disabled' : 'bluePrimary'}
                  className={cn(btnDisabled && '!cursor-not-allowed')}
                >
                  Manage strategy
                </Button>
              </>
            )
          })()}
        </ButtonWrapper>
      </Card>

      <Toast
        title="Copy successful"
        description="The link to your strategy has been copied."
        open={!!toast.title}
        msToShow={5000}
        onClose={() => setToast({})}
      />
    </>
  )
}
