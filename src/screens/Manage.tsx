import { Button, Card, Heading, PlusSVG } from '@ensdomains/thorin'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Address } from 'viem'
import { useAccount, useReadContracts, useWriteContract } from 'wagmi'

import { ButtonWrapper } from '../components/ButtonWrapper'
import { DelegateRow } from '../components/DelegateRow'
import { SmallCard } from '../components/SmallCard'
import { ensTokenContract, erc20MultiDelegateContract } from '../lib/contracts'
import { formatNumber } from '../lib/utils'

export type DelegateSelection = Map<Address, string>

export function Manage() {
  const { address } = useAccount()
  const write = useWriteContract()
  const navigate = useNavigate()

  const [delegates, setDelegates] = useState<DelegateSelection>(
    new Map([
      ['0xb8c2C29ee19D8307cb7255e1Cd9CbDE883A267d5', '100'],
      ['0x534631Bcf33BDb069fB20A93d2fdb9e4D4dD42CF', '250'],
    ])
  )

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

  const [delegateFromTokenContract, balance] = delegateInfo || []

  if (!address) {
    return navigate('/strategy')
  }

  function handleUpdate() {
    // If the user has 1 delegate selected, use the token contract directly
    write.writeContract({
      ...ensTokenContract,
      functionName: 'delegate',
      args: ['0x0000000000000000000000000000000000000000'],
    })

    // If the user has multiple delegates selected, use the multiDelegate contract
    // write.writeContract({
    //   ...erc20MultiDelegateContract,
    //   functionName: 'delegateMulti',
    //   args: [],
    // })
  }

  return (
    <>
      <Heading className="mb-4">Manage Strategy</Heading>

      <Card>
        <SmallCard>
          <DelegateRow
            address={address}
            amount={formatNumber(balance?.result, 'string')}
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
              allocatedAmount > formatNumber(balance?.result, 'number')
            }
          >
            Update
          </Button>
        </ButtonWrapper>
      </Card>
    </>
  )
}
