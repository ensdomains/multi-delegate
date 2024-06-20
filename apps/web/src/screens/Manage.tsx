import { Button, Card, Heading, PlusSVG } from '@ensdomains/thorin'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ensTokenContract, erc20MultiDelegateContract } from 'shared/contracts'
import { Address, formatUnits, parseUnits } from 'viem'
import { useAccount, useReadContracts, useWriteContract } from 'wagmi'

import { ButtonWrapper } from '../components/ButtonWrapper'
import { DelegateRow } from '../components/DelegateRow'
import { SearchModal } from '../components/SearchModal'
import { SmallCard } from '../components/SmallCard'
import { checkIfUsingMultiDelegate, formatNumber } from '../lib/utils'

export type DelegateSelection = Map<Address, string>

export function Manage() {
  const { address } = useAccount()
  const write = useWriteContract()
  const navigate = useNavigate()
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

  const { data: delegateInfo } = useReadContracts({
    contracts: [
      {
        ...ensTokenContract,
        functionName: 'delegates',
        // @ts-expect-error: If the user is not connected, we'll redirect them
        args: [address],
      },
      {
        ...ensTokenContract,
        functionName: 'balanceOf',
        // @ts-expect-error: If the user is not connected, we'll redirect them
        args: [address],
      },
      {
        ...ensTokenContract,
        functionName: 'allowance',
        // @ts-expect-error: If the user is not connected, we'll redirect them
        args: [address, erc20MultiDelegateContract.address],
      },
    ],
  })

  const [_delegateFromTokenContract, _balance, _allowance] = delegateInfo || []
  const balance = _balance?.result
  const delegateFromTokenContract = _delegateFromTokenContract?.result
  const allowance = _allowance?.result

  const isUsingMultiDelegate = checkIfUsingMultiDelegate(
    delegateFromTokenContract
  )

  // Set the initial delegates
  useEffect(() => {
    if (!delegateFromTokenContract || !balance) return

    if (!isUsingMultiDelegate) {
      setDelegates(
        new Map([
          ...delegates,
          [delegateFromTokenContract, formatUnits(balance, 18)],
        ])
      )
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [delegateFromTokenContract])

  // Redirect if the user is not connected or has 0 tokens to make error handling easier
  if (!address || balance === 0n) {
    navigate('/strategy')
  }

  function handleUpdate() {
    if (!address) return

    if (allocatedDelegates.length === 0) {
      alert('Please allocate some tokens to a delegate')
    } else if (allocatedDelegates.length === 1) {
      console.log('Delegating via the token contract')

      // If the user has 1 delegate selected, use the token contract directly
      write.writeContract({
        ...ensTokenContract,
        functionName: 'delegate',
        args: [allocatedDelegates[0][0]],
      })
    } else {
      console.log('Delegating via the multiDelegate contract')

      if (allocatedDelegates.map((del) => del[0]).includes(address)) {
        alert('You cannot delegate to yourself')
        return
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
          />
        </SmallCard>

        <SmallCard>
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

        <ButtonWrapper>
          {(() => {
            // TODO: Let the user allocate tokens from the allowance vs requiring full allowance
            const hasFullAllowance = !((allowance || 0n) < (balance || 0n))

            if (!hasFullAllowance && allocatedDelegates.length > 1) {
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
              <Button
                onClick={handleUpdate}
                disabled={
                  isNaN(allocatedVotingPower) ||
                  allocatedVotingPower > formatNumber(balance, 'number')
                }
              >
                Update
              </Button>
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
