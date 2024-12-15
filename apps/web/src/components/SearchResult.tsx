import { Skeleton, Typography } from '@ensdomains/thorin'
import { Address } from 'viem'
import { useEnsAddress, useEnsAvatar } from 'wagmi'

import gradient from '../assets/gradient.svg'
import { truncateAddress } from '../lib/utils'

type Props = {
  name: string
  addDelegate: (address: Address) => void
}

export function SearchResult({ name, addDelegate }: Props) {
  const address = useEnsAddress({ name })
  const { data: avatar } = useEnsAvatar({ name })
  const disabled = !address.data

  return (
    <button
      data-testid="searchResult"
      className="flex w-full items-center gap-2 rounded-lg px-2 py-3 transition enabled:hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-50"
      onClick={() => {
        if (address.data) {
          addDelegate(address.data)
        }
      }}
      disabled={disabled}
    >
      <img
        className="rounded-full"
        src={avatar || gradient}
        width={40}
        height={40}
      />

      <div className="flex flex-col text-left">
        <Typography asProp="span" weight="bold">
          {name}
        </Typography>

        <Typography asProp="span" fontVariant="small" color="grey">
          {address.data ? (
            truncateAddress(address.data)
          ) : address.isLoading ? (
            <Skeleton loading>0x1234...5678</Skeleton>
          ) : null}
        </Typography>
      </div>
    </button>
  )
}
