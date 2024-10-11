import {
  AlertSVG,
  Button,
  Dialog,
  Input,
  MagnifyingGlassSVG,
  MagnifyingGlassSimpleSVG,
  Spinner,
  Typography,
} from '@ensdomains/thorin'
import { useDebounceValue } from 'usehooks-ts'
import { Address } from 'viem'

import { useDelegateSearch } from '../hooks/useDelegateSearch'
import { cn } from '../lib/utils'
import { DelegateSelection } from '../screens/Manage'
import { Divider } from './Divider'
import { SearchResult } from './SearchResult'

type Props = {
  isOpen: boolean
  delegates: DelegateSelection
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>
  setDelegates: React.Dispatch<React.SetStateAction<DelegateSelection>>
}

export function SearchModal({
  isOpen,
  delegates,
  setIsModalOpen,
  setDelegates,
}: Props) {
  const [searchQuery, setSearchQuery] = useDebounceValue<string>('', 500)
  const search = useDelegateSearch(searchQuery)

  function close() {
    setIsModalOpen(false)
    setSearchQuery('')
  }

  function addDelegate(address: Address) {
    setDelegates(
      new Map([
        ...delegates,
        [address, { preExistingBalance: 0n, newBalance: 0n }], // Start with 0 as the default amount
      ])
    )

    close()
  }

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
        onChange={(e) => {
          console.log('e', e.target.value)
          setSearchQuery(e.target.value)
        }}
        prefix={<MagnifyingGlassSimpleSVG />}
      />

      <div
        className={cn(
          '-my-3 flex h-48 w-[38rem] max-w-full flex-col overflow-y-scroll sm:w-[30rem]',
          (search.data?.length === 0 || search.isLoading || search.isError) &&
            'items-center justify-center'
        )}
      >
        {(() => {
          if (search.isLoading) {
            return (
              <Spinner
                data-testid="searchLoadingSpinner"
                size="medium"
                color="blue"
              />
            )
          }

          if (search.data?.length === 0 || search.isError) {
            const emptyQuery = searchQuery === ''

            return (
              <>
                {emptyQuery ? (
                  <MagnifyingGlassSVG className="text-ens-blue-primary mb-2 h-5 w-5" />
                ) : search.isError ? (
                  <AlertSVG className="text-ens-red-primary mb-2 h-5 w-5" />
                ) : (
                  <AlertSVG className="text-ens-yellow-primary mb-2 h-5 w-5" />
                )}

                <Typography className="w-40 text-center">
                  {emptyQuery
                    ? 'Search for an ENS name or ETH address'
                    : search.isError
                      ? 'Error fetching names'
                      : 'No results found'}
                </Typography>
              </>
            )
          }

          return search.data?.map(({ name }, index) => (
            <div key={name} className="w-full">
              <SearchResult name={name} addDelegate={addDelegate} />

              {/* If its not the last delegate, add a divider */}
              {index !== search.data.length - 1 && <Divider />}
            </div>
          ))
        })()}
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
