import React from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useEnsAvatar, useEnsName } from 'wagmi'

import { render, screen } from '../test/test-utils'
import { DelegateRow } from './DelegateRow'

// Mock wagmi hooks
vi.mock(import('wagmi'), async (importOriginal) => {
  const wagmi = await importOriginal()
  return {
    ...wagmi,
    WagmiProvider: ({ children }) => <>{children}</>,
    useEnsName: vi.fn(),
    useEnsAvatar: vi.fn(),
    useEnsResolver: vi.fn(),
    createConfig: vi.fn(),
    http: vi.fn(),
  }
})

describe('DelegateRow', () => {
  const defaultProps = {
    address: '0x1234567890123456789012345678901234567890',
    preExistingBalance: 1000000000000000000n,
    newBalance: 15000000000000000000n,
  }

  beforeEach(() => {
    vi.mocked(useEnsName).mockReturnValue({ data: null })
    vi.mocked(useEnsAvatar).mockReturnValue({ data: null })
  })

  it('renders nothing when address is null', () => {
    const { container } = render(
      <DelegateRow
        address={undefined}
        preExistingBalance={1000000000000000000n}
        newBalance={2000000000000000000n}
      />
    )
    expect(container.firstChild).toBeNull()
  })

  it('renders address correctly', () => {
    render(<DelegateRow {...defaultProps} />)
    expect(screen.getByText('0x1234...7890')).toBeTruthy()
  })

  it('renders ENS name when available', () => {
    vi.mocked(useEnsName).mockReturnValue({ data: 'test.eth' })
    render(<DelegateRow {...defaultProps} />)
    expect(screen.getByText('test.eth')).toBeTruthy()
  })

  it('renders balance correctly', () => {
    render(<DelegateRow {...defaultProps} isBalance />)
    const input = screen.getByTestId('delegate-amount-input')
    expect(input).toHaveProperty('value', '15')
  })

  it('renders difference tag when hasPreExistingDelegates is true', () => {
    render(<DelegateRow {...defaultProps} hasPreExistingDelegates />)
    expect(screen.getByText(/14/)).toBeTruthy()
  })

  it('renders description when provided', () => {
    const description = 'Test description'
    render(<DelegateRow {...defaultProps} description={description} />)
    expect(screen.getByText(description)).toBeTruthy()
  })

  it('renders avatar when available', () => {
    vi.mocked(useEnsAvatar).mockReturnValue({
      data: 'https://example.com/avatar.png',
    })
    render(<DelegateRow {...defaultProps} />)
    const avatar = screen.getByAltText('icon')
    expect(avatar).toBeTruthy()
    expect(avatar).toHaveProperty('src', 'https://example.com/avatar.png')
  })

  it('renders default icon when no avatar is available', () => {
    render(<DelegateRow {...defaultProps} />)
    const icon = screen.getByAltText('icon')
    expect(icon).toBeTruthy()
    expect(icon).toHaveProperty(
      'src',
      'http://localhost:3000/src/assets/profileIcon.svg'
    )
  })

  it('handles zero balance correctly', () => {
    render(<DelegateRow {...defaultProps} newBalance={0n} isBalance />)
    const input = screen.getByTestId('delegate-amount-input')
    expect(input).toHaveProperty('value', '0')
  })

  it('handles maximum token value correctly', () => {
    const maxTokens = 100000000n * 10n ** 18n // 100 million tokens
    render(<DelegateRow {...defaultProps} newBalance={maxTokens} isBalance />)
    const input = screen.getByTestId('delegate-amount-input')
    expect(input).toHaveProperty('value', '100000000')
  })
})
