import React from 'react'
import { useParams } from 'react-router-dom'
import { isAddress } from 'viem'
import { describe, expect, it, vi } from 'vitest'
import { useEnsAddress, useEnsAvatar, useEnsName, useEnsText } from 'wagmi'

import { useDelegationInfo } from '../hooks/useDelegationInfo'
import { render, screen } from '../test/test-utils'
import { SharedStrategy } from './SharedStrategy'

// Mock the hooks
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useParams: vi.fn(),
    useLocation: vi.fn(() => ({
      pathname: '/mocked-path',
      search: '',
      hash: '',
      state: null,
    })),
  }
})

vi.mock('wagmi', async () => {
  const actual = await vi.importActual('wagmi')
  return {
    ...actual,
    useEnsName: vi.fn(() => ({ data: null })),
    useEnsAddress: vi.fn(() => ({ data: null })),
    useEnsAvatar: vi.fn(() => ({ data: null })),
    useEnsText: vi.fn(() => ({ data: null })),
    WagmiProvider: ({ children }: { children: React.ReactNode }) => (
      <>{children}</>
    ),
  }
})

vi.mock('viem', () => ({
  isAddress: vi.fn(),
}))

vi.mock('../hooks/useDelegationInfo', () => ({
  useDelegationInfo: vi.fn(),
}))

describe('SharedStrategy component', () => {
  it('renders the title correctly', () => {
    vi.mocked(useParams).mockReturnValue({
      addressOrName: '0x1234567890123456789012345678901234567890',
    })
    vi.mocked(isAddress).mockReturnValue(true)
    vi.mocked(useEnsName).mockReturnValue({ data: null, isLoading: false })
    vi.mocked(useEnsAddress).mockReturnValue({ data: null, isLoading: false })
    vi.mocked(useDelegationInfo).mockReturnValue({ data: {} })

    render(<SharedStrategy />)
    expect(screen.getByText('View Strategy')).toBeDefined()
  })

  it('displays ENS name when available', () => {
    vi.mocked(useParams).mockReturnValue({ addressOrName: 'test.eth' })
    vi.mocked(isAddress).mockReturnValue(false)
    vi.mocked(useEnsName).mockReturnValue({
      data: 'test.eth',
      isLoading: false,
    })
    vi.mocked(useEnsAddress).mockReturnValue({
      data: '0x1234',
      isLoading: false,
    })
    vi.mocked(useEnsAvatar).mockReturnValue({ data: null })
    vi.mocked(useEnsText).mockReturnValue({ data: 'Ceritifed rat tickler' })
    vi.mocked(useDelegationInfo).mockReturnValue({ data: {} })

    render(<SharedStrategy />)
    expect(screen.getByTestId('strategy-name')).toHaveTextContent('test.eth')
    expect(screen.getByTestId('description')).toHaveTextContent(
      'Ceritifed rat tickler'
    )
  })

  it('displays address when ENS name is not available', () => {
    vi.mocked(useParams).mockReturnValue({
      addressOrName: '0x1234567890123456789012345678901234567890',
    })
    vi.mocked(isAddress).mockReturnValue(true)
    vi.mocked(useEnsName).mockReturnValue({ data: null, isLoading: false })
    vi.mocked(useEnsAddress).mockReturnValue({ data: null, isLoading: false })
    vi.mocked(useDelegationInfo).mockReturnValue({ data: {} })

    render(<SharedStrategy />)
    expect(screen.getByTestId('strategy-name')).toHaveTextContent(
      '0x1234...7890'
    )
  })

  it('displays delegation information when available', () => {
    vi.mocked(useParams).mockReturnValue({ addressOrName: '0x1234' })
    vi.mocked(isAddress).mockReturnValue(true)
    vi.mocked(useEnsName).mockReturnValue({ data: null, isLoading: false })
    vi.mocked(useEnsAddress).mockReturnValue({ data: null, isLoading: false })
    vi.mocked(useDelegationInfo).mockReturnValue({
      data: {
        balance: 100n,
        delegateFromTokenContract: '0x5678',
        multiDelegates: [{ delegate: '0x9abc', amount: '50' }],
      },
    })

    render(<SharedStrategy />)
    expect(screen.getByText('0x5678...5678')).toBeDefined()
    expect(screen.getByText('0x9abc...9abc')).toBeDefined()
  })

  it('displays "No $ENS to delegate" message when balance is zero', () => {
    vi.mocked(useParams).mockReturnValue({ addressOrName: '0x1234' })
    vi.mocked(isAddress).mockReturnValue(true)
    vi.mocked(useEnsName).mockReturnValue({ data: null, isLoading: false })
    vi.mocked(useEnsAddress).mockReturnValue({ data: null, isLoading: false })
    vi.mocked(useDelegationInfo).mockReturnValue({
      data: {
        balance: 0n,
        multiDelegates: [],
      },
    })

    render(<SharedStrategy />)
    expect(screen.getByText('No $ENS to delegate.')).toBeDefined()
  })

  it('displays "View your own strategy" link', () => {
    vi.mocked(useParams).mockReturnValue({ addressOrName: '0x1234' })
    vi.mocked(isAddress).mockReturnValue(true)
    vi.mocked(useEnsName).mockReturnValue({ data: null, isLoading: false })
    vi.mocked(useEnsAddress).mockReturnValue({ data: null, isLoading: false })
    vi.mocked(useDelegationInfo).mockReturnValue({ data: {} })

    render(<SharedStrategy />)
    const link = screen.getByText('View your own strategy')
    expect(link).toBeDefined()
    expect(link.closest('a')).toHaveAttribute('href', '/strategy')
  })
})
