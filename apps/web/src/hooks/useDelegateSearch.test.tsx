import { useQuery } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { GRAPH_URL } from '../lib/env'
import { useDelegateSearch } from './useDelegateSearch'

// Mock the @tanstack/react-query useQuery hook
vi.mock('@tanstack/react-query', () => ({
  useQuery: vi.fn(),
}))

// Mock the fetch function
global.fetch = vi.fn()

describe('useDelegateSearch', () => {
  it('returns an empty array for empty search query', async () => {
    vi.mocked(useQuery).mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
    })

    const { result } = renderHook(() => useDelegateSearch(''))

    await waitFor(() => {
      expect(result.current.data).toEqual([])
    })
  })

  it('returns the search query as a result if it ends with .eth', async () => {
    const searchQuery = 'test.eth'
    vi.mocked(useQuery).mockReturnValue({
      data: [{ name: searchQuery }],
      isLoading: false,
      isError: false,
    })

    const { result } = renderHook(() => useDelegateSearch(searchQuery))

    await waitFor(() => {
      expect(result.current.data).toEqual([{ name: searchQuery }])
    })
  })

  it('fetches data from the subgraph for non-.eth queries', async () => {
    const searchQuery = 'test'
    const mockResponse = {
      data: {
        domains: [{ name: 'test1.eth' }, { name: 'test2.eth' }],
      },
    }

    global.fetch = vi.fn().mockResolvedValue({
      json: () => Promise.resolve(mockResponse),
    })

    vi.mocked(useQuery).mockImplementation(({ queryFn }) => {
      return {
        data: queryFn,
        isLoading: false,
        isError: false,
      }
    })

    const { result } = renderHook(() => useDelegateSearch(searchQuery))

    const finalResult = await result.current.data()

    await waitFor(async () => {
      expect(global.fetch).toHaveBeenCalledWith(GRAPH_URL, expect.any(Object))
      expect(finalResult).toEqual([
        { name: 'test1.eth' },
        { name: 'test2.eth' },
      ])
    })
  })

  it('adds searchQuery to the top of the list if it is a potential domain', async () => {
    const searchQuery = 'test.com'
    const mockResponse = {
      data: {
        domains: [{ name: 'test1.eth' }, { name: 'test2.eth' }],
      },
    }

    global.fetch = vi.fn().mockResolvedValue({
      json: () => Promise.resolve(mockResponse),
    })

    vi.mocked(useQuery).mockImplementation(({ queryFn }) => {
      return {
        data: queryFn,
        isLoading: false,
        isError: false,
      }
    })

    const { result } = renderHook(() => useDelegateSearch(searchQuery))
    const finalResult = await result.current.data()

    await waitFor(() => {
      expect(finalResult).toEqual([
        { name: 'test.com' },
        { name: 'test1.eth' },
        { name: 'test2.eth' },
      ])
    })
  })
})
