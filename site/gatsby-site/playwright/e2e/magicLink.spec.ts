import { expect } from '@playwright/test';
import { generateMagicLink, test } from '../utils';

/**
 * Tests for the /magic-link interstitial page.
 */

test.describe('Magic link interstitial', () => {
  test('automatically redirects after a short delay', async ({ page }) => {
    const redirectTo = '/account';

    const magicLink = await generateMagicLink('test.user@incidentdatabase.ai', redirectTo);

    await page.goto(magicLink);

    await expect(page.getByText('You will be redirected in 5 seconds.')).toBeVisible();

    await page.waitForURL(redirectTo, { timeout: 7000 });
  });
});
