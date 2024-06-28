import {
  AlertSVG,
  Button,
  Card,
  Heading,
  PlusSVG,
  Spinner,
  Typography,
} from '@ensdomains/thorin'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ensTokenContract, erc20MultiDelegateContract } from 'shared/contracts'
import { Address, formatUnits, parseUnits } from 'viem'
import {
  useAccount,
  useWaitForTransactionReceipt,
  useWriteContract,
} from 'wagmi'

import { ButtonWrapper } from '../components/ButtonWrapper'
import { DelegateRow } from '../components/DelegateRow'
import { Helper } from '../components/Helper'
import { SearchModal } from '../components/SearchModal'
import { SmallCard } from '../components/SmallCard'
import { useDelegationInfo } from '../hooks/useDelegationInfo'
import { formatNumber, truncateAddress } from '../lib/utils'

export type DelegateSelection = Map<Address, string>

export function Manage() {
  const { address } = useAccount()
  const write = useWriteContract()
  const receipt = useWaitForTransactionReceipt({ hash: write.data })

  const navigate = useNavigate()
  const delegationInfo = useDelegationInfo(address)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const [delegates, setDelegates] = useState<DelegateSelection>(new Map())
  const delegatesArr = Array.from(delegates)

  // Count the total voting power of the selected delegates
  const allocatedVotingPower = delegatesArr.reduce(
    (acc, [, amount]) => acc + Number(amount),
    0
  )

  // Count the number of delegates with >0 amount
  const allocatedDelegates = delegatesArr.filter(
    ([, amount]) => Number(amount) > 0
  )

  const { multiDelegates, delegateFromTokenContract, balance, allowance } =
    delegationInfo.data ?? {}

  // Set the initial delegates
  useEffect(() => {
    if (!multiDelegates) return

    // convert multiDelegate.data to a Map and set it as the initial delegates
    setDelegates(
      new Map(
        multiDelegates?.map((delegate) => [
          delegate.delegate,
          formatUnits(BigInt(delegate.amount), 18),
        ])
      )
    )
  }, [multiDelegates])

  // Refetch the delegateInfo 1s after a transaction (to let the indexer catch up)
  useEffect(() => {
    if (receipt.status) {
      setTimeout(() => delegationInfo.refetch(), 1000)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [receipt.status])

  // Redirect if the user is not connected or has 0 tokens to make error handling easier
  if (!address || balance === 0n) {
    navigate('/strategy')
  }

  function handleUpdate() {
    if (!address) return

    if (allocatedDelegates.length === 0) {
      alert('Please allocate some tokens to a delegate')
    } else {
      console.log('Delegating via the multiDelegate contract')

      if (allocatedDelegates.map((del) => del[0]).includes(address)) {
        return alert('You cannot delegate to yourself')
      }

      // If the user has multiple delegates selected, use the multiDelegate contract
      write.writeContract({
        ...erc20MultiDelegateContract,
        functionName: 'delegateMulti',
        args: [
          [], // sources[]
          allocatedDelegates.map((del) => BigInt(del[0])), // targets[]
          allocatedDelegates.map((del) => parseUnits(del[1], 18)), // amounts[]
        ],
      })
    }
  }

  return (
    <>
      <Heading className="mb-4">Manage Strategy</Heading>

      <Card>
        <SmallCard>
          <DelegateRow
            isBalance={true}
            address={address}
            amount={formatNumber(balance, 'string')}
            description={
              delegateFromTokenContract &&
              `Delegating to ${truncateAddress(delegateFromTokenContract)}`
            }
          />
        </SmallCard>

        <SmallCard>
          {delegatesArr.length === 0 && (
            <div className="flex flex-col items-center gap-2 py-6 text-center">
              <AlertSVG className="text-ens-grey-primary" />
              <Typography color="grey">
                Not using the Multi-Delegate contract yet
              </Typography>
            </div>
          )}

          {delegatesArr.map(([address, amount], index) => (
            <div key={address}>
              <DelegateRow
                address={address}
                amount={amount}
                setDelegates={setDelegates}
                className="pb-3 last:pb-0"
              />

              {/* If its not the last delegate, add a divider */}
              {index !== delegatesArr.length - 1 && <SmallCard.Divider />}
            </div>
          ))}
        </SmallCard>

        <ButtonWrapper>
          <Button prefix={<PlusSVG />} onClick={() => setIsModalOpen(true)}>
            Add delegate
          </Button>
        </ButtonWrapper>

        <div className="py-1">
          <Card.Divider />
        </div>

        {receipt.isSuccess && (
          <Helper type="success" className="mx-auto">
            Transaction success!
          </Helper>
        )}

        {receipt.isLoading && (
          <Spinner size="medium" color="blue" className="mx-auto" />
        )}

        {receipt.isError && (
          <Helper type="error">
            <div>
              Transaction failed. It will likely work if you try again a few
              times. Tenderly sends a different gas estimate to the wallet each
              time for some reason.{' '}
              <a
                href="https://dashboard.tenderly.co/explorer/vnet/78d3d569-cb63-45a9-8b8c-9d152d90c3ed/transactions"
                target="_blank"
                className="text-ens-red-primary font-bold underline"
              >
                See more here
              </a>
              .
            </div>
          </Helper>
        )}

        <ButtonWrapper>
          {(() => {
            const hasSufficientAllowance =
              (allowance || 0n) >=
              parseUnits(allocatedVotingPower.toString(), 18)

            if (!hasSufficientAllowance) {
              return (
                <Button
                  disabled={!balance}
                  onClick={() => {
                    write.writeContract({
                      ...ensTokenContract,
                      functionName: 'approve',
                      args: [
                        erc20MultiDelegateContract.address,
                        // @ts-expect-error: Button is disabled if there is no balance
                        balance,
                      ],
                    })
                  }}
                >
                  Approve
                </Button>
              )
            }

            return (
              <>
                {(multiDelegates?.length || 0) > 0 && (
                  <Button
                    colorStyle="blueSecondary"
                    onClick={() => {
                      write.writeContract({
                        ...erc20MultiDelegateContract,
                        functionName: 'delegateMulti',
                        args: [
                          multiDelegates!.map((delegate) =>
                            BigInt(delegate.tokenId)
                          ), // sources[]
                          [], // targets[]
                          multiDelegates!.map((delegate) =>
                            BigInt(delegate.amount)
                          ), // amounts[]
                        ],
                      })
                    }}
                  >
                    Reclaim Tokens
                  </Button>
                )}

                <Button
                  onClick={handleUpdate}
                  disabled={
                    !allocatedVotingPower ||
                    isNaN(allocatedVotingPower) ||
                    allocatedVotingPower > formatNumber(balance, 'number')
                  }
                >
                  Update Strategy
                </Button>
              </>
            )
          })()}
        </ButtonWrapper>
      </Card>

      <SearchModal
        isOpen={isModalOpen}
        delegates={delegates}
        setDelegates={setDelegates}
        setIsModalOpen={setIsModalOpen}
      />
    </>
  )
}
