import { Input, Tag, Typography } from '@ensdomains/thorin'
import { Address, formatEther, formatUnits, parseUnits } from 'viem'
import { useEnsAvatar, useEnsName } from 'wagmi'

import profileIcon from '../assets/profileIcon.svg'
import tokenIcon from '../assets/tokenIcon.svg'
import { NULL, cn, truncateAddress } from '../lib/utils'
import { DelegateSelection } from '../screens/Manage'

type Props = {
  isBalance?: boolean
  address: Address | undefined
  preExistingBalance: bigint | null
  newBalance: bigint
  hasPreExistingDelegates?: boolean
  setDelegates?: React.Dispatch<React.SetStateAction<DelegateSelection>>
  className?: React.HTMLAttributes<HTMLDivElement>['className']
  description?: string
}

const MAX_TOKENS_VALUE = parseUnits('100000000', 18)

export function DelegateRow({
  isBalance,
  address,
  preExistingBalance,
  newBalance,
  hasPreExistingDelegates,
  setDelegates,
  className,
  description,
}: Props) {
  const { data: name } = useEnsName({ address })
  const { data: avatar } = useEnsAvatar({ name: name || undefined })

  const isUndelegated = address === NULL
  const isEmpty = !isBalance && newBalance <= 0n

  function setDelegateAmount(newAmount: string) {
    if (!setDelegates || !address) return

    const parsedAmount = parseUnits(newAmount, 18)
    const amount =
      parsedAmount > MAX_TOKENS_VALUE ? MAX_TOKENS_VALUE : parsedAmount

    setDelegates((prev) => {
      const newDelegates = new Map(prev)
      newDelegates.set(address, {
        preExistingBalance,
        newBalance: amount,
      })
      return newDelegates
    })
  }

  if (!address) return null

  return (
    <div className={cn('flex w-full', className)}>
      <div className="flex w-full items-center gap-2">
        <img
          className={cn('rounded-full', isEmpty ? 'grayscale' : '')}
          src={isBalance ? tokenIcon : avatar || profileIcon}
          width={40}
          height={40}
        />

        <div className="flex flex-col">
          <Typography
            asProp="span"
            weight="bold"
            color={isEmpty ? 'textTertiary' : 'text'}
          >
            {isBalance
              ? 'Wallet balance'
              : isUndelegated
                ? 'Undelegated'
                : name || truncateAddress(address)}
          </Typography>

          {description && (
            <Typography fontVariant="small" color="grey">
              {description}
            </Typography>
          )}
        </div>
      </div>

      <div className="flex flex-row items-center gap-x-4">
        {(() => {
          if (!hasPreExistingDelegates) return null

          const diff = newBalance - (preExistingBalance || 0n)

          if (diff === 0n)
            return (
              <Tag size="small" colorStyle="greySecondary">
                –
              </Tag>
            )

          const isPositive = diff > 0n

          return (
            <Tag
              size="small"
              colorStyle={isPositive ? 'greenSecondary' : 'redSecondary'}
            >
              {isPositive ? '+' : ''}
              {formatEther(diff)}
            </Tag>
          )
        })()}
        <div className="w-32">
          <Input
            size="small"
            placeholder=""
            label=""
            hideLabel
            value={formatUnits(newBalance, 18)}
            onChange={(e) => setDelegateAmount(e.target.value)}
            disabled={isBalance}
            className={
              isBalance && newBalance < 0n
                ? '!text-ens-red-primary !font-bold'
                : ''
            }
          />
        </div>
      </div>
    </div>
  )
}
