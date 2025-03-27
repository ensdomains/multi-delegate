import { useQuery } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { Address, PublicClient } from 'viem'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { usePublicClient } from 'wagmi'

import { useDelegationInfo } from './useDelegationInfo'

vi.mock('@tanstack/react-query')
vi.mock('wagmi')
vi.mock('../lib/env', () => ({
  PONDER_URL: null,
  RPC_URL: 'http://localhost:8545',
  REOWN_PROJECT_ID: 'swag',
}))

// Mock contracts
vi.mock('shared/contracts', () => ({
  ensTokenContract: { address: '0xensTokenAddress' },
  erc20MultiDelegateContract: {
    address: '0xmultiDelegateAddress',
    deployedBock: '123456',
    abi: [{}, {}, {}, {}, {}, { type: 'event' }],
  },
}))

describe('useDelegationInfo', () => {
  const mockAddress: Address = '0x1234567890123456789012345678901234567890'
  const mockPublicClient = {
    multicall: vi.fn(),
    getLogs: vi.fn(),
    readContract: vi.fn(),
  } as unknown as PublicClient

  beforeEach(() => {
    vi.clearAllMocks()
    ;(usePublicClient as any).mockReturnValue(mockPublicClient)
    ;(useQuery as any).mockImplementation(({ queryFn }) => ({
      data: queryFn,
    }))
  })

  it('should return empty object for invalid address', async () => {
    const { result } = renderHook(() => useDelegationInfo('invalid-address'))
    const resolvedResult = await result.current.data()

    await waitFor(() => {
      expect(resolvedResult).toEqual({})
    })
  })

  it('should fetch delegation info for valid address', async () => {
    const mockMulticallResult = [
      { result: '0xdelegateAddress' },
      { result: BigInt(1000) },
      { result: BigInt(500) },
    ]
    mockPublicClient.multicall.mockResolvedValue(mockMulticallResult)
    mockPublicClient.getLogs.mockResolvedValue([])

    const { result } = renderHook(() => useDelegationInfo(mockAddress))
    const resolvedResult = await result.current.data()

    await waitFor(() => {
      expect(resolvedResult).toEqual({
        multiDelegates: [],
        delegateFromTokenContract: '0xdelegateAddress',
        balance: BigInt(1000),
        allowance: BigInt(500),
      })
    })
  })

  it('should handle zero address delegate', async () => {
    const mockMulticallResult = [
      { result: '0x0000000000000000000000000000000000000000' },
      { result: BigInt(1000) },
      { result: BigInt(500) },
    ]
    mockPublicClient.multicall.mockResolvedValue(mockMulticallResult)
    mockPublicClient.getLogs.mockResolvedValue([])

    const { result } = renderHook(() => useDelegationInfo(mockAddress))
    const resolvedResult = await result.current.data()

    await waitFor(() => {
      expect(resolvedResult).toEqual({
        multiDelegates: [],
        delegateFromTokenContract: null,
        balance: BigInt(1000),
        allowance: BigInt(500),
      })
    })
  })

  it('should fetch multi-delegates from event logs', async () => {
    const mockMulticallResult = [
      { result: '0xdelegateAddress' },
      { result: BigInt(1000) },
      { result: BigInt(500) },
    ]
    mockPublicClient.multicall.mockResolvedValue(mockMulticallResult)
    mockPublicClient.getLogs.mockResolvedValue([
      { args: { ids: [BigInt(1), BigInt(2)] } },
    ])
    mockPublicClient.readContract.mockResolvedValue([BigInt(100), BigInt(200)])

    const { result } = renderHook(() => useDelegationInfo(mockAddress))
    const resolvedResult = await result.current.data()

    await waitFor(() => {
      expect(resolvedResult).toEqual({
        multiDelegates: [
          { delegate: '0x1', tokenId: '1', amount: '100' },
          { delegate: '0x2', tokenId: '2', amount: '200' },
        ],
        delegateFromTokenContract: '0xdelegateAddress',
        balance: BigInt(1000),
        allowance: BigInt(500),
      })
    })
  })
})
