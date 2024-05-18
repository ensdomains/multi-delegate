import { Input, Typography } from '@ensdomains/thorin'
import { Address } from 'viem'
import { useAccount, useEnsAvatar, useEnsName } from 'wagmi'

import profileIcon from '../assets/profileIcon.svg'
import tokenIcon from '../assets/tokenIcon.svg'
import { truncateAddress } from '../lib/utils'

type Props = {
  address: Address | undefined
  amount: string | undefined
}

export function DelegateRow({ address, amount }: Props) {
  const { address: connectedAddress } = useAccount()
  const { data: name } = useEnsName({ address })
  const { data: avatar } = useEnsAvatar({ name: name || undefined })
  const isConnectedAddress = address === connectedAddress

  if (!address) return null

  return (
    <div className="flex w-full">
      <div className="flex w-full items-center gap-2">
        <img
          className="rounded-full"
          src={isConnectedAddress ? tokenIcon : avatar || profileIcon}
          width={40}
          height={40}
        />

        <Typography asProp="span" weight="bold">
          {isConnectedAddress
            ? 'Wallet balance'
            : name || truncateAddress(address)}
        </Typography>
      </div>

      <div className="flex">
        <Input
          size="small"
          placeholder=""
          label=""
          hideLabel
          value={amount}
          disabled={isConnectedAddress}
        />
      </div>
    </div>
  )
}
