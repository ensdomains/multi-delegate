import { Button, Card, Heading, PlusSVG } from '@ensdomains/thorin'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Address, formatUnits } from 'viem'
import { useAccount, useReadContracts, useWriteContract } from 'wagmi'

import { ButtonWrapper } from '../components/ButtonWrapper'
import { DelegateRow } from '../components/DelegateRow'
import { SmallCard } from '../components/SmallCard'
import { ensTokenContract, erc20MultiDelegateContract } from '../lib/contracts'
import { checkIfUsingMultiDelegate, formatNumber } from '../lib/utils'

export type DelegateSelection = Map<Address, string>

export function Manage() {
  const { address } = useAccount()
  const write = useWriteContract()
  const navigate = useNavigate()

  const [delegates, setDelegates] = useState<DelegateSelection>(new Map())
  const delegatesArr = Array.from(delegates)
  const allocatedAmount = delegatesArr.reduce(
    (acc, [, amount]) => acc + Number(amount),
    0
  )

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
    return navigate('/strategy')
  }

  function handleUpdate() {
    if (delegatesArr.length === 1) {
      // If the user has 1 delegate selected, use the token contract directly
      write.writeContract({
        ...ensTokenContract,
        functionName: 'delegate',
        args: ['0x0000000000000000000000000000000000000000'],
      })
    } else {
      // If the user has multiple delegates selected, use the multiDelegate contract
      write.writeContract({
        ...erc20MultiDelegateContract,
        functionName: 'delegateMulti',
        args: [
          [], // sources[]
          [], // targets[]
          [], // amounts[]
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
            address={address}
            amount={formatNumber(balance, 'string')}
          />
        </SmallCard>

        <SmallCard>
          {delegatesArr.map(([address, amount], index) => (
            <>
              <DelegateRow
                key={index}
                address={address}
                amount={amount}
                setDelegates={setDelegates}
              />

              {/* If its not the last delegate, add a divider */}
              {index !== delegatesArr.length - 1 && <SmallCard.Divider />}
            </>
          ))}
        </SmallCard>

        <ButtonWrapper>
          <Button prefix={<PlusSVG />}>Add delegate</Button>
        </ButtonWrapper>

        <div className="py-1">
          <Card.Divider />
        </div>

        <ButtonWrapper>
          <Button
            onClick={handleUpdate}
            disabled={
              isNaN(allocatedAmount) ||
              allocatedAmount > formatNumber(balance, 'number')
            }
          >
            Update
          </Button>
        </ButtonWrapper>
      </Card>
    </>
  )
}
