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
import { useAccount, useReadContracts } from 'wagmi'

import { ButtonWrapper } from '../components/ButtonWrapper'
import { DelegatePill } from '../components/DelegatePill'
import { InnerCard } from '../components/InnerCard'
import { ensTokenContract } from '../lib/contracts'
import { NULL, checkIfUsingMultiDelegate } from '../lib/utils'

export function Strategy() {
  const { address } = useAccount()
  const { openConnectModal } = useConnectModal()

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
            <InnerCard>
              {isUsingMultiDelegate ? (
                // I think we have to build an indexer to check the delegates
                <Typography asProp="p">Already using multi-delegate</Typography>
              ) : (
                <div className="flex flex-wrap justify-center gap-2">
                  <DelegatePill
                    address={delegateFromTokenContract}
                    amount={balance}
                  />
                </div>
              )}
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
