import {
  Button,
  Card,
  Heading,
  RightArrowSVG,
  Typography,
} from '@ensdomains/thorin'
import { useConnectModal } from '@rainbow-me/rainbowkit'
import { useAccount, useReadContracts } from 'wagmi'

import { DelegatePill } from '../components/DelegatePill'
import { InnerCard } from '../components/InnerCard'
import { ensTokenContract, erc20MultiDelegateContract } from '../lib/contracts'

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
        <Typography>
          Delegate, rebalance or reclaim your votes to any number of delegates
          with a single transaction.
        </Typography>

        {(() => {
          if (!address) {
            return (
              <>
                <InnerCard>
                  <Typography>
                    Connect your wallet to see your delegation strategy.
                  </Typography>
                </InnerCard>

                <Button className="w-fit" onClick={openConnectModal}>
                  Connect
                </Button>
              </>
            )
          }

          return (
            <>
              <InnerCard>
                {isUsingMultiDelegate ? (
                  // I think we have to build an indexer to check the delegates
                  <Typography>Already using multi-delegate</Typography>
                ) : (
                  <div className="flex flex-wrap justify-center gap-2">
                    <DelegatePill
                      address={delegateFromTokenContract?.result}
                      amount={balance?.result}
                    />
                  </div>
                )}
              </InnerCard>

              <Button as="a" href="/manage" suffix={<RightArrowSVG />}>
                Manage strategy
              </Button>
            </>
          )
        })()}
      </Card>
    </>
  )
}
