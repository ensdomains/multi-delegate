import { Locator, Page } from '@playwright/test'

export class HomePage {
  readonly page: Page
  readonly startButton: Locator

  constructor(page: Page) {
    this.page = page
    this.startButton = this.page.locator('text=Start')
  }

  async waitForLoad() {
    await this.startButton.waitFor()
  }

  async clickStart() {
    await this.startButton.click()
  }
}
