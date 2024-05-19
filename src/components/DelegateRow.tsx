import { Input, Typography } from '@ensdomains/thorin'
import { Address } from 'viem'
import { useAccount, useEnsAvatar, useEnsName } from 'wagmi'

import profileIcon from '../assets/profileIcon.svg'
import tokenIcon from '../assets/tokenIcon.svg'
import { truncateAddress } from '../lib/utils'
import { DelegateSelection } from '../screens/Manage'

type Props = {
  address: Address | undefined
  amount: string | undefined
  setDelegates?: React.Dispatch<React.SetStateAction<DelegateSelection>>
}

export function DelegateRow({ address, amount, setDelegates }: Props) {
  const { address: connectedAddress } = useAccount()
  const { data: name } = useEnsName({ address })
  const { data: avatar } = useEnsAvatar({ name: name || undefined })
  const isConnectedAddress = address === connectedAddress

  function setDelegateAmount(newAmount: string) {
    if (!setDelegates || !address) return

    setDelegates((prev) => {
      const newDelegates = new Map(prev)
      newDelegates.set(address, newAmount)
      return newDelegates
    })
  }

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
          onChange={(e) => setDelegateAmount(e.target.value)}
          error={amount && !/^\d+$/.test(amount) ? true : false}
          disabled={isConnectedAddress}
        />
      </div>
    </div>
  )
}
