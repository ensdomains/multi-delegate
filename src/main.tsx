import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from 'styled-components'
import { ThorinGlobalStyles, lightTheme } from '@ensdomains/thorin'
import { WagmiProvider } from 'wagmi'
import React from 'react'
import ReactDOM from 'react-dom/client'

import { wagmiConfig } from './lib/web3.ts'
import App from './App.tsx'

const queryClient = new QueryClient()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <WagmiProvider config={wagmiConfig}>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider theme={lightTheme}>
            <ThorinGlobalStyles />
            <App />
          </ThemeProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </BrowserRouter>
  </React.StrictMode>
)
