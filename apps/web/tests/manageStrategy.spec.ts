import { expect } from '@playwright/test'

import { test } from '../playwright/fixtures'

test('get started link', async ({ page, login, homePage }) => {
  await page.goto('/')

  // Connect the user.
  await login.connect('user')

  // Click the get started link.
  await homePage.clickStart()

  // Expects page to have a heading with the name of Installation.
  await expect(page.getByText('Share strategy')).toBeVisible()

  // Expects page to have a button with the text "Manage strategy".
  await expect(page.getByText('Manage strategy')).toBeVisible()

  // Expects page to have a button with the text "Share strategy".
  await expect(page.getByText('Share strategy')).toBeVisible()

  //Click the "Manage strategy" button.
  await page.click('text=Manage strategy')

  // Wait for the delegate amount input to appear and have a value loaded
  const delegateInput = page.getByTestId('delegate-amount-input').nth(0)
  await expect(delegateInput).toBeVisible()

  // Wait for the value to be populated (keep checking until it has any value)
  await expect(async () => {
    const value = await delegateInput.getAttribute('value')
    expect(value).not.toBe('0')
    expect(value).not.toBe('')
    expect(value).not.toBe(null)
  }).toPass({ timeout: 10000 })

  // Manage the strategy
  await page.click('text=Add or change delegate')

  //enter "leonardo" in the input field which has placeholder as "ENS name or Ethereum address"
  await page.fill(
    'input[placeholder="ENS name or Ethereum address"]',
    'leonardo'
  )
})
