import { expect } from '@playwright/test';
import { test } from '../utils';
import { init } from '../memory-mongo';

const scenarios = [
  {
    name: 'landing sponsor modal',
    run: async ({ page }) => {
      await page.goto('/');
      await page.locator('[data-cy="Waking Up Foundation-image"]').scrollIntoViewIfNeeded();
      await page.locator('[data-cy="Waking Up Foundation-image"]').click();
      await page.locator('[data-cy="sponsor-modal"]').waitFor();
      await page.locator('[data-cy="close-modal"]').click();
      await page.locator('[data-cy="sponsor-modal"]').waitFor({ state: 'hidden' });
    },
  },
  {
    name: 'citation info modal',
    run: async ({ page }) => {
      await page.goto('/cite/1');
      await page.locator('button:has-text("Citation Info")').click();
      const modal = page.locator('[data-cy="citation-info-modal"]');
      await modal.waitFor();
      await modal.getByText('Close').click();
      await modal.waitFor({ state: 'hidden' });
    },
  },
  {
    name: 'edit user modal',
    run: async ({ page, login }) => {
      await login();
      await page.goto('/account?askToCompleteProfile=1');
      const modal = page.getByTestId('edit-user-modal');
      await modal.waitFor();
      await page.locator('[aria-label="Close"]').click();
      await modal.waitFor({ state: 'hidden' });
    },
  },
  {
    name: 'incident version modal',
    run: async ({ page, login }) => {
      await init();
      await login();
      await page.goto('/incidents/history/?incident_id=1');
      await page.locator('[data-cy="history-row"]').first().locator('[data-cy="view-full-version-button"]').click();
      const modal = page.locator('[data-cy="version-view-modal"]');
      await modal.waitFor();
      await modal.locator('button').getByText('Close').click();
      await modal.waitFor({ state: 'hidden' });
    },
  },
];

test.describe('Modals should not leave body overflow hidden', () => {
  for (const scenario of scenarios) {
    test(scenario.name, async ({ page, login }) => {
      await scenario.run({ page, login });
      const hasOverflow = await page.evaluate(() => document.body.classList.contains('overflow-hidden'));
      expect(hasOverflow).toBe(false);
    });
  }
});
