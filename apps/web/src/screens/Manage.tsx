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
import { Address } from 'viem'
import {
  useAccount,
  useEnsName,
  useWaitForTransactionReceipt,
  useWriteContract,
} from 'wagmi'

import { ButtonWrapper } from '../components/ButtonWrapper'
import { DelegateRow } from '../components/DelegateRow'
import { Helper } from '../components/Helper'
import { SearchModal } from '../components/SearchModal'
import { SmallCard } from '../components/SmallCard'
import { useDelegationInfo } from '../hooks/useDelegationInfo'
import { checkHasBalance, truncateAddress } from '../lib/utils'

export type DelegateSelection = Map<
  Address,
  { preExistingBalance: bigint | null; newBalance: bigint }
>

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
    (acc, [, { newBalance }]) => acc + newBalance,
    0n
  )
  const alreadyAllocatedVotingPower = delegatesArr.reduce(
    (acc, [, { preExistingBalance }]) => acc + (preExistingBalance || 0n),
    0n
  )

  // Count the number of delegates with >0 amount
  const allocatedDelegates = delegatesArr.filter(
    ([, { newBalance }]) => newBalance > 0n
  )

  const { multiDelegates, delegateFromTokenContract, balance, allowance } =
    delegationInfo.data ?? {}
  const hasPreExistingDelegates = !!multiDelegates?.length
  const toBeAllocated =
    (balance || 0n) - (allocatedVotingPower - alreadyAllocatedVotingPower)
  const reassignedTokens = delegatesArr.reduce(
    (acc, [, { preExistingBalance, newBalance }]) => {
      return acc + (newBalance - (preExistingBalance || 0n))
    },
    0n
  )
  const requiredRebalanceAllowance = reassignedTokens - (allowance || 0n)

  const { data: delegateFromTokenContractEnsName } = useEnsName({
    address: delegateFromTokenContract ?? undefined,
  })

  const selfDelegate = [
    address!,
    { preExistingBalance: balance || 0n, newBalance: toBeAllocated },
  ] as const
  const changingDelegates = [...delegatesArr, selfDelegate]
    .filter(
      ([, { preExistingBalance, newBalance }]) =>
        preExistingBalance !== newBalance
    )
    .map(
      ([address, { preExistingBalance, newBalance }]) =>
        [
          address,
          {
            preExistingBalance,
            newBalance,
            change: newBalance - (preExistingBalance || 0n),
          },
        ] as const
    )

  // Set the initial delegates
  useEffect(() => {
    if (!multiDelegates) return

    // convert multiDelegate.data to a Map and set it as the initial delegates
    setDelegates(
      new Map(
        multiDelegates?.map(
          (delegate) =>
            [
              delegate.delegate,
              {
                preExistingBalance: BigInt(delegate.amount),
                newBalance: BigInt(delegate.amount),
              },
              // formatUnits(BigInt(delegate.amount), 18),
            ] as const
        )
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
  if (!address || !checkHasBalance({ balance, multiDelegates })) {
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

      console.log({
        changingDelegates,
      })

      const positiveChangingDelegates = changingDelegates
        .slice()
        .filter(([, { change }]) => change > 0n)
        .sort(([, { change: a }], [, { change: b }]) => Number(b - a))
        .map(([address, { change }]) => [address, change] as [Address, bigint])
      const negativeChangingDelegates = changingDelegates
        .slice()
        .filter(([, { change }]) => change < 0n)
        .sort(([, { change: a }], [, { change: b }]) => Number(a - b))
        .map(
          ([address, { change }]) =>
            [address, change * -1n] as [Address, bigint]
        )
      const removeMatchingNegativeDelegate = ([
        referenceAddress,
        referenceChange,
      ]: [Address, bigint]) => {
        const index = negativeChangingDelegates.findIndex(
          ([address, change]) =>
            address === referenceAddress && change === referenceChange
        )
        console.log('Removing neg for index', index)
        if (index !== -1) negativeChangingDelegates.splice(index, 1)
      }

      let sources: Address[] = []
      let targets: Address[] = []
      const amounts: bigint[] = []

      const checkForWithTargetTransactions = (txs: number) => {
        console.log('Checking for txs', txs)
        for (const [
          positiveAddress,
          positiveChange,
        ] of positiveChangingDelegates) {
          const negativeConsumed: [Address, bigint, partial: boolean][] = []
          let remainingChange = positiveChange
          let i = 0

          while (i < negativeChangingDelegates.length) {
            if (i > txs) break
            const negativeDelegate = negativeChangingDelegates[i]
            const [negativeDelegateAddress, negativeChange] = negativeDelegate
            if (
              remainingChange > negativeChange ||
              remainingChange === negativeChange
            ) {
              console.log({ remainingChange, negativeChange })
              negativeConsumed.push([...negativeChangingDelegates[i], false])
              remainingChange = remainingChange - negativeChange
              console.log('Remaining change after', remainingChange)
              i++
              if (remainingChange === 0n) break
              else continue
            }

            negativeConsumed.push([
              negativeDelegateAddress,
              remainingChange,
              true,
            ])
            negativeDelegate[1] = negativeChange - remainingChange
            remainingChange = 0n
            console.log('Using partial')
            console.log('Remaining partial', negativeDelegate)
            break
          }

          if (remainingChange !== 0n) continue

          for (const [
            negativeAddress,
            negativeChange,
            partial,
          ] of negativeConsumed) {
            sources.push(negativeAddress)
            targets.push(positiveAddress)
            amounts.push(negativeChange)
            if (!partial)
              removeMatchingNegativeDelegate([negativeAddress, negativeChange])
          }
          positiveChangingDelegates.splice(
            positiveChangingDelegates.findIndex(
              ([address, change]) =>
                address === positiveAddress && change === positiveChange
            ),
            1
          )
        }
      }

      for (let i = 1; i < 10; i++) {
        checkForWithTargetTransactions(i)
        if (!positiveChangingDelegates.length) break
      }

      if (positiveChangingDelegates.length)
        checkForWithTargetTransactions(Infinity)
      console.log({ sources, targets, amounts })
      if (positiveChangingDelegates.length)
        throw new Error("couldn't get transfers")

      console.log('123 TEST 123!!!!\n\n\n')

      let hasOwnSource = false
      let hasOwnTarget = false

      const allReferences = amounts
        .map((a, i) => {
          let source: Address | undefined = sources[i]
          if (source === address) {
            hasOwnSource = true
            source = undefined
          }
          let target: Address | undefined = targets[i]
          if (target === address) {
            hasOwnTarget = true
            target = undefined
          }

          return {
            source,
            target,
            amount: a,
          }
        })
        .sort((a, b) => {
          if (a.target === undefined || a.source === undefined) return 1
          if (b.target === undefined || b.source === undefined) return -1
          return 0
        })

      sources = []
      targets = []

      for (let i = 0; i < allReferences.length; i++) {
        const reference = allReferences[i]
        if (reference.source) sources[i] = reference.source
        if (reference.target) targets[i] = reference.target
        amounts[i] = reference.amount
      }

      console.log({
        sources: sources.slice(),
        targets: targets.slice(),
        amounts: amounts.slice(),
      })

      if (hasOwnSource && hasOwnTarget) {
        // should be unreachable but idk
        throw new Error('unreachable??')
      }

      console.log({
        sources,
        targets,
        amounts,
      })

      // If the user has multiple delegates selected, use the multiDelegate contract
      write
        .writeContractAsync({
          ...erc20MultiDelegateContract,
          functionName: 'delegateMulti',
          args: [
            sources.map((address) => BigInt(address)), // sources[]
            targets.map((address) => BigInt(address)), // targets[]
            amounts, // amounts[]
          ],
        })
        .catch((e) => {
          console.error(e)
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
            newBalance={toBeAllocated}
            preExistingBalance={balance || 0n}
            hasPreExistingDelegates={hasPreExistingDelegates}
            description={
              delegateFromTokenContract
                ? `Delegating to ${delegateFromTokenContractEnsName ?? truncateAddress(delegateFromTokenContract)}`
                : undefined
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

          {delegatesArr.map(
            ([address, { preExistingBalance, newBalance }], index) => (
              <div key={address}>
                <DelegateRow
                  address={address}
                  preExistingBalance={preExistingBalance}
                  newBalance={newBalance}
                  hasPreExistingDelegates={hasPreExistingDelegates}
                  setDelegates={setDelegates}
                  className="pb-3 last:pb-0"
                />

                {/* If its not the last delegate, add a divider */}
                {index !== delegatesArr.length - 1 && <SmallCard.Divider />}
              </div>
            )
          )}
        </SmallCard>

        {toBeAllocated < 0n && (
          <Helper alignment="horizontal" type="error">
            Not enough $ENS
          </Helper>
        )}

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
              typeof allowance === 'bigint' && requiredRebalanceAllowance <= 0n

            console.log({
              allowance,
              reassignedTokens,
              requiredRebalanceAllowance,
              hasSufficientAllowance,
            })

            if (!hasSufficientAllowance) {
              return (
                <Button
                  disabled={!requiredRebalanceAllowance}
                  onClick={() => {
                    write.writeContract({
                      ...ensTokenContract,
                      functionName: 'approve',
                      args: [
                        erc20MultiDelegateContract.address,
                        requiredRebalanceAllowance,
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
                  disabled={!allocatedVotingPower || toBeAllocated < 0n}
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
