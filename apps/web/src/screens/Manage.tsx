import {
  AlertSVG,
  Button,
  Dialog,
  Heading,
  PlusSVG,
  Spinner,
  Toast,
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
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false)
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false)
  const [delegationType, setDelegationType] = useState<'native' | 'multi'>(
    'multi'
  )

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
    const { multiDelegates: _multiDelegates } = delegationInfo.data ?? {}
    if (_multiDelegates) {
      // convert multiDelegate.data to a Map and set it as the initial delegates
      setDelegates(
        new Map(
          _multiDelegates?.map(
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
    }
  }, [delegationInfo.data])

  useEffect(() => {
    // Refetch the delegateInfo 1s after a transaction (to let the indexer catch up)
    if (receipt.status) {
      setIsConfirmationModalOpen(false)
      delegationInfo.refetch()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [receipt.status])

  // Redirect if the user is not connected or has 0 tokens to make error handling easier
  if (!address || !checkHasBalance({ balance, multiDelegates })) {
    navigate('/strategy')
  }

  function handleNativeDelegate() {
    if (!address) return

    // We will only be here if allocatedDelegates.length === 1, so it's safe to use the first
    write.writeContract({
      ...ensTokenContract,
      functionName: 'delegate',
      args: [allocatedDelegates[0][0]],
    })
  }

  function handleMultiDelegate() {
    if (!address) return

    if (allocatedDelegates.map((del) => del[0]).includes(address)) {
      return alert(
        'You cannot delegate to yourself via the multi-delegate contract.'
      )
    }

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
        ([address, { change }]) => [address, change * -1n] as [Address, bigint]
      )
    const removeMatchingNegativeDelegate = ([
      referenceAddress,
      referenceChange,
    ]: [Address, bigint]) => {
      const index = negativeChangingDelegates.findIndex(
        ([address, change]) =>
          address === referenceAddress && change === referenceChange
      )

      if (index !== -1) negativeChangingDelegates.splice(index, 1)
    }

    let sources: Address[] = []
    let targets: Address[] = []
    const amounts: bigint[] = []

    const checkForWithTargetTransactions = (txs: number) => {
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
            negativeConsumed.push([...negativeChangingDelegates[i], false])
            remainingChange = remainingChange - negativeChange
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

    if (positiveChangingDelegates.length) {
      checkForWithTargetTransactions(Infinity)
    }

    if (positiveChangingDelegates.length) {
      throw new Error("Couldn't get transfers")
    }

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

    if (hasOwnSource && hasOwnTarget) {
      // should be unreachable but idk
      throw new Error('unreachable??')
    }

    console.log({ sources, targets, amounts })

    write.writeContract({
      ...erc20MultiDelegateContract,
      functionName: 'delegateMulti',
      args: [
        sources.map((address) => BigInt(address)), // sources[]
        targets.map((address) => BigInt(address)), // targets[]
        amounts, // amounts[]
      ],
    })
  }

  return (
    <>
      <Heading className="mb-4">Manage Strategy</Heading>

      <div className="flex flex-col gap-4">
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
          {delegationInfo.isLoading && (
            <div className="flex justify-center py-6">
              <Spinner size="medium" color="blue" />
            </div>
          )}

          {!!delegationInfo.data && delegatesArr.length === 0 && (
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
          <Button
            prefix={<PlusSVG />}
            onClick={() => setIsSearchModalOpen(true)}
          >
            {multiDelegates?.length === 0 && allocatedDelegates.length === 0
              ? 'Add or change delegate'
              : 'Add delegate'}
          </Button>
        </ButtonWrapper>

        {/* receipt.isSuccess */}
        <Toast
          open={receipt.isSuccess}
          title="Transaction success!"
          description="Your transaction has been confirmed."
          variant="desktop"
          onClose={() => write.reset()}
          msToShow={7000}
        >
          <Button
            as="a"
            target="_blank"
            href={`https://etherscan.io/tx/${write.data}`}
            colorStyle="bluePrimary"
          >
            View on Etherscan
          </Button>
        </Toast>

        {receipt.isLoading && (
          <Spinner size="medium" color="blue" className="mx-auto" />
        )}

        {/* receipt.isError */}
        <Toast
          open={receipt.isError}
          title="Transaction failed!"
          description="Your transaction has failed."
          variant="desktop"
          onClose={() => write.reset()}
          msToShow={7000}
        >
          <Button
            as="a"
            target="_blank"
            href={`https://etherscan.io/tx/${write.data}`}
            colorStyle="redPrimary"
          >
            View on Etherscan
          </Button>
        </Toast>

        <ButtonWrapper>
          {(() => {
            const hasSufficientAllowance =
              typeof allowance === 'bigint' && requiredRebalanceAllowance <= 0n

            if (!hasSufficientAllowance) {
              return (
                <Button
                  disabled={!requiredRebalanceAllowance || receipt.isLoading}
                  onClick={() => {
                    write.writeContract({
                      ...ensTokenContract,
                      functionName: 'approve',
                      args: [
                        erc20MultiDelegateContract.address,
                        reassignedTokens,
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
                <Button
                  onClick={() => setIsConfirmationModalOpen(true)}
                  disabled={
                    toBeAllocated < 0n || changingDelegates.length === 0
                  }
                >
                  Update Strategy
                </Button>
              </>
            )
          })()}
        </ButtonWrapper>
      </div>

      <SearchModal
        isOpen={isSearchModalOpen}
        delegates={delegates}
        setDelegates={setDelegates}
        setIsModalOpen={setIsSearchModalOpen}
      />

      <Dialog
        title="Delegated tokens will become NFTs"
        variant="actionable"
        onDismiss={() => setIsConfirmationModalOpen(false)}
        open={isConfirmationModalOpen}
      >
        <Dialog.CloseButton onClick={() => setIsConfirmationModalOpen(false)} />

        {(() => {
          // 95% of token balance
          const almostFullBalance =
            ((delegationInfo.data?.balance ?? 0n) * 95n) / 100n

          // If there's exactly one delegate AND the allocated amount is moast of the balance, present the option of native delegation
          if (
            // We can only show this if there are no existing multi-delegates, otherwise we'd need a multi-step process to reclaim tokens first
            (multiDelegates ?? []).length === 0 &&
            allocatedDelegates.length === 1 &&
            allocatedDelegates[0][1].newBalance > almostFullBalance
          ) {
            const optionsClassName =
              'bg-ens-blue-surface flex flex-row items-center gap-4 rounded-lg p-4 has-[:checked]:bg-ens-blue-light'

            // Radio options to select native or multi-delegate
            return (
              <div className="flex w-[28rem] max-w-full flex-col gap-2">
                <label htmlFor="multi" className={optionsClassName}>
                  <Typography asProp="p">
                    Delegate a portion, swapping your $ENS for NFTs that
                    represent each delegate. You can undelegate anytime to swap
                    back, but new $ENS won’t be delegated automatically.
                  </Typography>

                  <input
                    type="radio"
                    className="appearance-auto"
                    name="delegation-type"
                    id="multi"
                    defaultChecked
                    onChange={() => setDelegationType('multi')}
                  />
                </label>

                <label htmlFor="native" className={optionsClassName}>
                  <Typography asProp="p">
                    Delegate all your $ENS to one person, including any new $ENS
                    you receive, for less gas.
                  </Typography>

                  <input
                    type="radio"
                    className="appearance-auto"
                    name="delegation-type"
                    id="native"
                    onChange={() => setDelegationType('native')}
                  />
                </label>
              </div>
            )
          }

          return (
            <div className="w-[28rem] max-w-full text-center">
              <Typography asProp="p">
                When you delegate your $ENS tokens they will be swapped for NFTs
                that represent each delegate. You can swap back to your tokens
                anytime by undelegating.
              </Typography>
            </div>
          )
        })()}

        <Dialog.Footer
          leading={
            <Button
              colorStyle="blueSecondary"
              onClick={() => setIsConfirmationModalOpen(false)}
            >
              Back
            </Button>
          }
          trailing={
            <Button
              colorStyle="bluePrimary"
              onClick={() => {
                if (delegationType === 'native') {
                  handleNativeDelegate()
                } else {
                  handleMultiDelegate()
                }
              }}
              loading={receipt.isLoading || write.isPending}
              disabled={toBeAllocated < 0n || changingDelegates.length === 0}
            >
              Open Wallet
            </Button>
          }
        />
      </Dialog>
    </>
  )
}
