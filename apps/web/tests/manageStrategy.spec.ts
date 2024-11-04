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

  //get the balance of the user
  await page.waitForTimeout(5000)
  const balance = await page
    .getByTestId('delegate-amount-input')
    .getAttribute('value')
  expect(balance).not.toBe('0')
})
