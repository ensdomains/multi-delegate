import { Button, Card, Heading } from '@ensdomains/thorin'
import { useNavigate } from 'react-router-dom'
import { useAccount, useReadContracts, useWriteContract } from 'wagmi'

import { ensTokenContract, erc20MultiDelegateContract } from '../lib/contracts'

export function Manage() {
  const { address } = useAccount()
  const write = useWriteContract()
  const navigate = useNavigate()

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

  if (!address || balance?.result === 0n) {
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

      <Card className="text-center">
        <div className="mx-auto flex w-fit gap-2">
          <Button onClick={handleUpdate}>Update</Button>
        </div>
      </Card>
    </>
  )
}
