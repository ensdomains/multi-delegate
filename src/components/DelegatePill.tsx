import { Typography } from '@ensdomains/thorin'
import { Address, formatUnits } from 'viem'
import { useEnsAvatar, useEnsName } from 'wagmi'

import profileIcon from '../assets/profileIcon.svg'

type Props = {
  address: Address | undefined
  amount: bigint | undefined
}

export function DelegatePill({ address, amount }: Props) {
  const { data: name } = useEnsName({ address })
  const { data: avatar } = useEnsAvatar({ name: name || undefined })

  const normalizedAmount = parseFloat(
    formatUnits(amount || BigInt(0), 18)
  ).toFixed(2)

  return (
    <div className="border-ens-additional-border flex w-fit items-center gap-2 rounded-full border bg-white p-1">
      <img
        className="rounded-full"
        src={avatar || profileIcon}
        width={32}
        height={32}
      />

      <Typography weight="bold">{name || address}</Typography>

      <div className="bg-ens-blue-surface rounded-full px-3 py-1">
        <Typography weight="bold">{normalizedAmount}</Typography>
      </div>
    </div>
  )
}
