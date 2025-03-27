import {
  type Web3ProviderBackend,
  injectHeadlessWeb3Provider,
} from '@ensdomains/headless-web3-provider'
import { test as base } from '@playwright/test'
import { erc20MultiDelegateContract } from 'shared/contracts'
import { defineChain } from 'viem'

import { HomePage } from '../pages/homePage'
import { LoginPage } from '../pages/loginPage'
import { Accounts, createAccounts } from './accounts'

type Fixtures = {
  accounts: Accounts
  wallet: Web3ProviderBackend
  login: LoginPage
  homePage: HomePage
}

const tenderly = defineChain({
  id: 1,
  name: 'Virtual Ethereum Mainnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: {
      http: [
        'https://virtual.mainnet.rpc.tenderly.co/c4033449-8159-4a50-90f8-e89183ae2be8',
      ],
    },
  },
  blockExplorers: {
    default: {
      name: 'Explorer',
      url: 'https://virtual.mainnet.rpc.tenderly.co/c4033449-8159-4a50-90f8-e89183ae2be8',
    },
  },
  contracts: {
    erc20MultiDelegateContract,
  },
})

export const test = base.extend<Fixtures>({
  // eslint-disable-next-line no-empty-pattern
  accounts: async ({}, use) => {
    await use(createAccounts(true))
  },
  wallet: async ({ page, accounts }, use) => {
    const chains = [tenderly]
    const privateKeys = accounts.getAllPrivateKeys()
    const wallet = await injectHeadlessWeb3Provider({
      page,
      privateKeys,
      chains,
    })
    await use(wallet)
  },
  login: async ({ page, wallet, accounts }, use) => {
    const login = new LoginPage(page, wallet, accounts)
    await use(login)
  },
  homePage: async ({ page }, use) => {
    const homePage = new HomePage(page)
    await use(homePage)
  },
})
