import { Tooltip, Typography } from '@ensdomains/thorin'
import { Address } from 'viem'
import { useEnsAvatar, useEnsName } from 'wagmi'

import profileIcon from '../assets/profileIcon.svg'
import { NULL, formatNumber, truncateAddress } from '../lib/utils'

type Props = {
  address: Address | undefined
  amount: bigint | undefined
  tooltip?: string
}

export function DelegatePill({ address, amount, tooltip }: Props) {
  const { data: name } = useEnsName({ address })
  const { data: avatar } = useEnsAvatar({ name: name || undefined })

  const normalizedAmount = formatNumber(amount, 'string')
  const isUndelegated = address === NULL

  if (!address) return null

  const content = (
    <div className="border-ens-additional-border flex w-fit items-center gap-2 rounded-full border bg-white p-1">
      <img
        className="rounded-full"
        src={avatar || profileIcon}
        width={32}
        height={32}
      />

      <Typography weight="bold">
        {isUndelegated ? 'Undelegated' : name || truncateAddress(address)}
      </Typography>

      <div className="bg-ens-blue-surface rounded-full px-3 py-1">
        <Typography weight="bold">{normalizedAmount}</Typography>
      </div>
    </div>
  )

  if (tooltip) {
    return (
      <Tooltip
        additionalGap={0}
        content={<div className="text-center">{tooltip}</div>}
        mobilePlacement="top"
        mobileWidth={200}
        placement="top"
        width={200}
      >
        {content}
      </Tooltip>
    )
  }

  return content
}
