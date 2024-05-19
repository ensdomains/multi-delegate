import { Typography } from '@ensdomains/thorin'
import { Address } from 'viem'
import { useEnsAvatar } from 'wagmi'

import gradient from '../assets/gradient.svg'
import { truncateAddress } from '../lib/utils'

type Props = {
  name: string
  address: Address
  addDelegate: (address: Address) => void
}

export function SearchResult({ name, address, addDelegate }: Props) {
  const { data: avatar } = useEnsAvatar({ name })

  return (
    <div className="flex gap-2" onClick={() => addDelegate(address)}>
      <img
        className="rounded-full"
        src={avatar || gradient}
        width={40}
        height={40}
      />

      <div className="flex flex-col">
        <Typography asProp="span" weight="bold">
          {name}
        </Typography>
        <Typography asProp="span" fontVariant="small" color="grey">
          {truncateAddress(address)}
        </Typography>
      </div>
    </div>
  )
}
