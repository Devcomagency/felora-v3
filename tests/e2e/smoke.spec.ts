import { test, expect } from '@playwright/test'

test('homepage renders', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveTitle(/Felora/i)
})

test('map page shows skeleton or map', async ({ page }) => {
  await page.goto('/map')
  await expect(page.getByText('Chargement de la carte').or(page.locator('#map').first())).toBeVisible({ timeout: 5000 })
})

test.describe.skip('certification flow (requires local user context)', () => {
  test('loads certification page or redirects to signup', async ({ page }) => {
    await page.goto('/certification')
    await expect(page).toHaveURL(/(certification|register\/indepandante)/)
  })
})

