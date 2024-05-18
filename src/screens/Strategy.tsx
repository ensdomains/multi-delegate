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

import { DelegatePill } from '../components/DelegatePill'
import { InnerCard } from '../components/InnerCard'
import { ensTokenContract, erc20MultiDelegateContract } from '../lib/contracts'
import { NULL } from '../lib/utils'

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

  const [delegateFromTokenContract, balance] = delegateInfo || []

  // prettier-ignore
  const isUsingMultiDelegate = delegateFromTokenContract?.result === erc20MultiDelegateContract.address

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

          if (balance?.result === 0n) {
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
                    address={delegateFromTokenContract?.result}
                    amount={balance?.result}
                  />
                </div>
              )}
            </InnerCard>
          )
        })()}

        <div className="mx-auto flex w-fit gap-2">
          {(() => {
            if (!address) {
              return (
                <Button className="" onClick={openConnectModal}>
                  Connect
                </Button>
              )
            }

            const btnDisabled = balance?.result === 0n
            const isUndelegated =
              !isUsingMultiDelegate &&
              delegateFromTokenContract?.result === NULL

            return (
              <>
                {!btnDisabled && !isUndelegated && (
                  <Button
                    suffix={<CopySVG />}
                    colorStyle="blueSecondary"
                    onClick={async () => {
                      await navigator.clipboard.writeText(
                        `http://localhost:5173/strategy/${address}`
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
        </div>
      </Card>
    </>
  )
}
