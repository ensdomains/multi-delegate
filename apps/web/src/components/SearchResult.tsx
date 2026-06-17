import { Skeleton, Typography } from '@ensdomains/thorin'
import { Address } from 'viem'
import { useEnsAddress, useEnsAvatar } from 'wagmi'

import gradient from '../assets/gradient.svg'
import { truncateAddress } from '../lib/utils'

type Props = {
  address?: Address
  name?: string
  addDelegate: (address: Address) => void
}

export function SearchResult({
  address: providedAddress,
  name,
  addDelegate,
}: Props) {
  const resolvedAddress = useEnsAddress({ name: name ?? undefined })
  const { data: avatar } = useEnsAvatar({ name })

  const address = providedAddress ?? resolvedAddress.data
  const disabled = !address

  return (
    <button
      data-testid="searchResult"
      className="flex w-full items-center gap-2 rounded-lg px-2 py-3 transition enabled:hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-50"
      onClick={() => {
        if (address) {
          addDelegate(address)
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
        {name && (
          <Typography asProp="span" weight="bold">
            {name}
          </Typography>
        )}

        <Typography
          asProp="span"
          fontVariant="small"
          weight={providedAddress ? 'bold' : 'normal'}
          color={providedAddress ? 'text' : 'grey'}
        >
          {address ? (
            truncateAddress(address)
          ) : !address ? (
            <Skeleton loading>0x1234...5678</Skeleton>
          ) : null}
        </Typography>
      </div>
    </button>
  )
}
