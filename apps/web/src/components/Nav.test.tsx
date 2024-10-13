import { useConnectModal } from '@rainbow-me/rainbowkit'
import React from 'react'
import { describe, expect, it, vi } from 'vitest'
import { useAccount, useDisconnect, useEnsAvatar, useEnsName } from 'wagmi'

import { fireEvent, render, screen } from '../test/test-utils'
import { Nav } from './Nav'

vi.mock(import('wagmi'), async (importOriginal) => {
  const wagmi = await importOriginal()
  return {
    ...wagmi,
    WagmiProvider: ({ children }) => <>{children}</>,
    useEnsName: vi.fn(() => ({ data: undefined })),
    useEnsAvatar: vi.fn(() => ({ data: undefined })),
    useEnsResolver: vi.fn(),
    createConfig: vi.fn(),
    http: vi.fn(),
    useAccount: vi.fn(() => ({ address: undefined })),
    useDisconnect: vi.fn(() => ({ disconnect: vi.fn() })),
  }
})

vi.mock('@rainbow-me/rainbowkit', () => ({
  useConnectModal: vi.fn(),
}))

describe('Nav component', () => {
  it('renders the logo', () => {
    render(<Nav />)
    const logo = screen.getByAltText('logo')
    expect(logo).toBeTruthy()
  })

  it('renders the DAO and App links', () => {
    render(<Nav />)
    expect(screen.getByText('DAO')).toBeTruthy()
    expect(screen.getByText('App')).toBeTruthy()
  })

  it('renders the warning message', () => {
    render(<Nav />)
    expect(screen.getByText(/Use this JSON RPC in your wallet/)).toBeTruthy()
  })

  it('renders profile icon when not connected', () => {
    vi.mocked(useAccount).mockReturnValue({ address: undefined })
    const mockOpenConnectModal = vi.fn()
    vi.mocked(useConnectModal).mockReturnValue({
      openConnectModal: mockOpenConnectModal,
    })

    render(<Nav />)
    const profileIcon = screen.getByAltText('profile icon')
    expect(profileIcon).toBeTruthy()
  })

  it('renders Profile component when connected', () => {
    vi.mocked(useAccount).mockReturnValue({
      address: '0x1234567890123456789012345678901234567890',
    })
    vi.mocked(useEnsName).mockReturnValue({ data: 'test.eth' })
    vi.mocked(useEnsAvatar).mockReturnValue({
      data: 'https://example.com/avatar.png',
    })
    const mockDisconnect = vi.fn()
    vi.mocked(useDisconnect).mockReturnValue({ disconnect: mockDisconnect })

    render(<Nav />)
    const profile = screen.getByText('test.eth')
    expect(profile).toBeTruthy()

    // Test disconnect functionality
    fireEvent.click(profile)
    const disconnectButton = screen.getByText('Disconnect')
    fireEvent.click(disconnectButton)
    expect(mockDisconnect).toHaveBeenCalled()
  })
})
