import {
  Web3ProviderBackend,
  Web3RequestKind,
} from '@ensdomains/headless-web3-provider'
import { Locator, Page, expect } from '@playwright/test'

import { Accounts, User } from '../fixtures/accounts'

export class LoginPage {
  private readonly page: Page

  private readonly wallet: Web3ProviderBackend

  private readonly accounts: Accounts

  private readonly ConnectButton: Locator

  private readonly BrowserWallet: Locator

  private readonly NotConnected: Locator

  constructor(page: Page, wallet: Web3ProviderBackend, accounts: Accounts) {
    this.page = page
    this.wallet = wallet
    this.accounts = accounts
    this.ConnectButton = this.page.getByAltText('profile icon')
    this.BrowserWallet = this.page.getByText('Headless Web3 Provider')
    this.NotConnected = this.page.getByText(
      'Please select an option and connect your wallet'
    )
  }

  async waitForLoad() {}

  async connect(user: User) {
    if (user !== 'user') {
      const pk = this.accounts.getPrivateKey(user)
      await this.wallet.changeAccounts([pk!])
      expect(
        this.wallet.getPendingRequestCount(Web3RequestKind.RequestAccounts)
      ).toEqual(0)
      await this.waitForLoad()
      return
    }
    await this.waitForLoad()
    await this.ConnectButton.click()
    await this.BrowserWallet.click()
    await expect(
      this.page.getByText('Confirm connection in the extension')
    ).toBeVisible({
      timeout: 15000,
    })
    expect(
      this.wallet.getPendingRequestCount(Web3RequestKind.RequestPermissions)
    ).toEqual(1)
    await this.wallet.authorize(Web3RequestKind.RequestPermissions)
    expect(
      this.wallet.getPendingRequestCount(Web3RequestKind.RequestPermissions)
    ).toEqual(0)
    await expect
      .poll(() =>
        this.wallet.getPendingRequestCount(Web3RequestKind.RequestAccounts)
      )
      .toEqual(1)
    await this.wallet.authorize(Web3RequestKind.RequestAccounts)
    expect(
      this.wallet.getPendingRequestCount(Web3RequestKind.RequestAccounts)
    ).toEqual(0)
    await expect(this.NotConnected).not.toBeVisible()
  }

  async disconnect() {
    await this.ConnectButton.click()
    expect(this.page.getByText('Disconnect').nth(1)).toBeVisible()
    await this.page.getByText('Disconnect').nth(1).click()
    await expect(this.ConnectButton).toBeVisible()
  }
}
