import React from 'react'
import { describe, expect, it, vi } from 'vitest'
import { useAccount, useEnsName } from 'wagmi'

import { useDelegationInfo } from '../hooks/useDelegationInfo'
import { render, screen } from '../test/test-utils'
import { Strategy } from './Strategy'

// Mock the hooks
vi.mock('wagmi', async () => {
  const actual = await vi.importActual('wagmi')
  return {
    ...actual,
    useAccount: vi.fn(() => ({ address: undefined })),
    useEnsName: vi.fn(() => ({ data: undefined })),
  }
})

vi.mock('../hooks/useDelegationInfo', () => ({
  useDelegationInfo: vi.fn(() => ({ data: undefined })),
}))

describe('Strategy component', () => {
  it('renders the title correctly', () => {
    render(<Strategy />)
    const titleElement = screen.getByText('Your Strategy')
    expect(titleElement).toBeDefined()
  })

  it('displays connect wallet message when not connected', () => {
    vi.mocked(useAccount).mockReturnValue({ address: undefined })
    render(<Strategy />)
    expect(
      screen.getByText('Connect your wallet to see your delegation strategy.')
    ).toBeDefined()
  })

  it('displays loading state', () => {
    vi.mocked(useAccount).mockReturnValue({ address: '0x123' })
    vi.mocked(useDelegationInfo).mockReturnValue({
      isLoading: true,
      data: undefined,
    })
    render(<Strategy />)
    expect(screen.getByTestId('skeleton-loading')).toBeDefined()
  })

  it('displays no tokens message when balance is zero', () => {
    vi.mocked(useAccount).mockReturnValue({ address: '0x123' })
    vi.mocked(useDelegationInfo).mockReturnValue({
      isLoading: false,
      data: { balance: 0n, multiDelegates: [] },
    })
    render(<Strategy />)
    expect(
      screen.getByText('You do not have any $ENS to delegate.')
    ).toBeDefined()
  })

  it('displays delegation information when available', () => {
    vi.mocked(useAccount).mockReturnValue({ address: '0x123' })
    vi.mocked(useDelegationInfo).mockReturnValue({
      isLoading: false,
      data: {
        balance: 93103382673616334848n,
        delegateFromTokenContract: '0x456',
        multiDelegates: [{ delegate: '0x789', amount: '96103382673616334848' }],
      },
    })
    render(<Strategy />)
    expect(screen.getByText('0x456...x456')).toBeDefined()
    expect(screen.getByText('93.1')).toBeDefined()
    expect(screen.getByText('0x789...x789')).toBeDefined()
    expect(screen.getByText('96.1')).toBeDefined()
  })

  it('displays ENS name when available', () => {
    vi.mocked(useAccount).mockReturnValue({ address: '0x123' })
    vi.mocked(useEnsName).mockReturnValue({ data: 'test.eth' })
    vi.mocked(useDelegationInfo).mockReturnValue({
      isLoading: false,
      data: { balance: 100n, multiDelegates: [] },
    })
    render(<Strategy />)
    expect(screen.getByText('Share strategy')).toBeDefined()
  })

  it('does not display share strategy button when balance is zero', () => {
    vi.mocked(useAccount).mockReturnValue({ address: '0x123' })
    vi.mocked(useDelegationInfo).mockReturnValue({
      isLoading: false,
      data: {
        balance: 0n,
        multiDelegates: [],
        delegateFromTokenContract: null,
      },
    })
    render(<Strategy />)
    expect(screen.getByText('Manage strategy')).toBeDefined()
    expect(screen.queryByText('Share strategy')).toBeNull()
  })
})
