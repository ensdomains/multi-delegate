import {
  Button,
  Card,
  CopySVG,
  Heading,
  Helper,
  RightArrowSVG,
  Typography,
} from '@ensdomains/thorin'
import { useConnectModal } from '@rainbow-me/rainbowkit'
import clsx from 'clsx'
import { ensTokenContract } from 'shared/contracts'
import { useAccount, useReadContracts } from 'wagmi'

import { ButtonWrapper } from '../components/ButtonWrapper'
import { DelegatePill } from '../components/DelegatePill'
import { InnerCard } from '../components/InnerCard'
import { useDelegates } from '../hooks/useDelegates'
import { NULL } from '../lib/utils'

export function Strategy() {
  const { address } = useAccount()
  const { openConnectModal } = useConnectModal()
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

  const isUsingMultiDelegate = !!multiDelegate.data

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

          if (balance === 0n) {
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
          )
        })()}

        <ButtonWrapper>
          {(() => {
            if (!address) {
              return (
                <Button className="" onClick={openConnectModal}>
                  Connect
                </Button>
              )
            }

            const btnDisabled = balance === 0n
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
                        `${window.location.origin}/strategy/${address}`
                      )

                      alert('Copied to clipboard')
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
                  className={clsx(btnDisabled && '!cursor-not-allowed')}
                >
                  Manage strategy
                </Button>
              </>
            )
          })()}
        </ButtonWrapper>
      </Card>
    </>
  )
}
