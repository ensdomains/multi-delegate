import { ThorinGlobalStyles, lightTheme } from '@ensdomains/thorin'
import { RainbowKitProvider } from '@rainbow-me/rainbowkit'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render as rtlRender } from '@testing-library/react'
import React from 'react'
import { MemoryRouter } from 'react-router-dom'
import { ThemeProvider } from 'styled-components'
import { vi } from 'vitest'
import { WagmiProvider } from 'wagmi'

import { wagmiConfig } from '../lib/web3'

// Mock RainbowKitProvider
vi.mock('@rainbow-me/rainbowkit', async () => {
  const actual = await vi.importActual('@rainbow-me/rainbowkit')
  return {
    ...actual,
    RainbowKitProvider: ({ children }: { children: React.ReactNode }) => (
      <>{children}</>
    ),
  }
})

const queryClient = new QueryClient()

function AllTheProviders({ children }: { children: React.ReactNode }) {
  return (
    <MemoryRouter>
      <WagmiProvider config={wagmiConfig}>
        <QueryClientProvider client={queryClient}>
          <RainbowKitProvider>
            <ThemeProvider theme={lightTheme}>
              <ThorinGlobalStyles />
              {children}
            </ThemeProvider>
          </RainbowKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </MemoryRouter>
  )
}

function customRender(ui: React.ReactElement, options = {}) {
  return rtlRender(ui, { wrapper: AllTheProviders, ...options })
}

// re-export everything
export * from '@testing-library/react'

// override render method
export { customRender as render }
