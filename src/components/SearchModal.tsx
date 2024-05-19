import {
  Button,
  Dialog,
  Input,
  MagnifyingGlassSimpleSVG,
} from '@ensdomains/thorin'
import { useState } from 'react'
import { Address } from 'viem'

import { DelegateSelection } from '../screens/Manage'
import { Divider } from './Divider'
import { SearchResult } from './SearchResult'

type Props = {
  isOpen: boolean
  close: () => void
  delegates: DelegateSelection
  setDelegates: React.Dispatch<React.SetStateAction<DelegateSelection>>
}

export function SearchModal({ isOpen, close, delegates, setDelegates }: Props) {
  function addDelegate(address: Address) {
    setDelegates(
      new Map([
        ...delegates,
        [address, '0'], // Start with 0 as the default amount
      ])
    )

    close()
  }

  const [searchResults, setSearchResults] = useState<
    { name: string; address: Address }[]
  >([
    { name: 'dom.eth', address: '0xbF7e3C8B16Ae63FC74e8d35C3F5eA8A6A2A7995E' },
    {
      name: 'domico.eth',
      address: '0x0b08dA7068b73A579Bd5E8a8290ff8afd37bc32A',
    },
  ])

  return (
    <Dialog
      title="Add delegate"
      variant="closable"
      onDismiss={close}
      open={isOpen}
    >
      <Dialog.CloseButton onClick={close} />

      <Input
        label=""
        hideLabel
        placeholder="ENS name or Ethereum address"
        prefix={<MagnifyingGlassSimpleSVG />}
      />

      <div className="flex h-44 w-[38rem] max-w-full flex-col gap-3 overflow-y-scroll sm:w-[30rem]">
        {searchResults.map(({ name, address }, index) => (
          <>
            <SearchResult
              key={address}
              name={name}
              address={address}
              addDelegate={addDelegate}
            />

            {/* If its not the last delegate, add a divider */}
            {index !== searchResults.length - 1 && <Divider />}
          </>
        ))}
      </div>

      <Divider />

      <Dialog.Footer
        leading={
          <Button colorStyle="blueSecondary" onClick={close}>
            Cancel
          </Button>
        }
        trailing={null}
      />
    </Dialog>
  )
}
