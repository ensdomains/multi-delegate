import React from 'react'
import { describe, expect, it, vi } from 'vitest'

import { useDelegateSearch } from '../hooks/useDelegateSearch'
import { fireEvent, render, screen, waitFor } from '../test/test-utils'
import { SearchModal } from './SearchModal'

// Mock the useDelegateSearch hook
vi.mock('../hooks/useDelegateSearch', () => ({
  useDelegateSearch: vi.fn(() => ({
    isLoading: false,
    data: undefined,
    isError: false,
  })),
}))

// Mock the useDebounceValue hook
vi.mock('usehooks-ts', () => ({
  useDebounceValue: vi.fn((initialValue) => [initialValue, vi.fn()]),
}))

vi.mock(import('wagmi'), async (importOriginal) => {
  const wagmi = await importOriginal()
  return {
    ...wagmi,
    WagmiProvider: ({ children }) => <>{children}</>,
    useEnsAddress: vi.fn(() => ({
      data: '0x1234567890123456789012345678901234567890',
    })),
    useEnsAvatar: vi.fn(() => ({ data: null })),
  }
})

describe('SearchModal', () => {
  const mockProps = {
    isOpen: true,
    delegates: new Map(),
    setIsModalOpen: vi.fn(),
    setDelegates: vi.fn(),
  }

  it('renders the search input', () => {
    render(<SearchModal {...mockProps} />)
    expect(
      screen.getByPlaceholderText('ENS name or Ethereum address')
    ).toBeTruthy()
  })

  it('displays loading state', () => {
    vi.mocked(useDelegateSearch).mockReturnValue({
      isLoading: true,
      data: undefined,
      isError: false,
    })
    render(<SearchModal {...mockProps} />)
    expect(screen.getByTestId('searchLoadingSpinner')).toBeTruthy()
  })

  it('displays search results', () => {
    vi.mocked(useDelegateSearch).mockReturnValue({
      isLoading: false,
      data: [{ name: 'test.eth' }],
      isError: false,
    })
    render(<SearchModal {...mockProps} />)
    expect(screen.getByText('test.eth')).toBeTruthy()
  })

  it('calls addDelegate when a result is clicked', async () => {
    const mockSetDelegates = vi.fn()
    vi.mocked(useDelegateSearch).mockReturnValue({
      isLoading: false,
      data: [
        {
          name: 'test.eth',
          address: '0x1234567890123456789012345678901234567890',
        },
      ],
      isError: false,
    })
    render(<SearchModal {...mockProps} setDelegates={mockSetDelegates} />)
    fireEvent.click(screen.getByTestId('searchResult'))
    screen.debug()
    await waitFor(() => {
      expect(mockSetDelegates).toHaveBeenCalledWith(
        new Map([
          [
            '0x1234567890123456789012345678901234567890',
            { preExistingBalance: 0n, newBalance: 0n },
          ],
        ])
      )
      expect(mockProps.setIsModalOpen).toHaveBeenCalledWith(false)
    })
  })

  it('closes the modal when cancel is clicked', () => {
    render(<SearchModal {...mockProps} />)
    fireEvent.click(screen.getByText('Cancel'))
    expect(mockProps.setIsModalOpen).toHaveBeenCalledWith(false)
  })
})
