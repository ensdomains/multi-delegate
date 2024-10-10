import React from 'react'
import { createRoot } from 'react-dom/client'
import { describe, expect, it, vi } from 'vitest'

// Mock the modules and components
vi.mock(import('react-dom/client'), async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    createRoot: vi.fn(() => ({
      render: vi.fn(),
    })),
  }
})

vi.mock('@ensdomains/thorin', () => ({
  ThorinGlobalStyles: () => null,
  lightTheme: {},
}))

vi.mock('@rainbow-me/rainbowkit', () => ({
  RainbowKitProvider: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}))

vi.mock('@tanstack/react-query', () => ({
  QueryClient: vi.fn(),
  QueryClientProvider: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}))

vi.mock('react-router-dom', () => ({
  BrowserRouter: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}))

vi.mock('wagmi', () => ({
  WagmiProvider: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}))

vi.mock('./lib/web3.ts', () => ({
  wagmiConfig: {},
}))

describe('main.tsx', () => {
  it('renders without crashing', async () => {
    const root = document.createElement('div')
    root.id = 'root'
    document.body.appendChild(root)

    await import('./main.tsx')

    expect(createRoot).toHaveBeenCalledWith(root)

    // Clean up
    document.body.removeChild(root)
  })
})
