const { test, expect } = require('@playwright/test');
const path = require('path');
const fs = require('fs');

const slugs = ['ann-01m', 'ann-01p'];
const stylePath = path.resolve(__dirname, '../_site/assets/css/styles_feeling_responsive.css');

for (const slug of slugs) {
  const builtPagePath = path.resolve(__dirname, `../_site/pipelinedrugs/${slug}/index.html`);

  test.describe(`${slug.toUpperCase()} detail header layout`, () => {
    test.beforeAll(() => {
      if (!fs.existsSync(builtPagePath)) {
        throw new Error(
          `Built drug detail page not found at ${builtPagePath}. Run \`bundle exec jekyll build\` before executing Playwright tests.`
        );
      }
    });

    test('header frame remains centered on wide viewports', async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.goto(`file://${builtPagePath}`);

      await page.addStyleTag({ path: stylePath });

      const frame = page.locator('.drug-header__frame');
      await expect(frame).toBeVisible();

      const frameBox = await frame.boundingBox();
      expect(frameBox).not.toBeNull();

      const viewportWidth = page.viewportSize().width;
      const frameCenter = frameBox.x + frameBox.width / 2;
      const viewportCenter = viewportWidth / 2;

      expect(Math.abs(frameCenter - viewportCenter)).toBeLessThan(6);
    });

    test('header frame exposes interior padding for copy', async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.goto(`file://${builtPagePath}`);

      await page.addStyleTag({ path: stylePath });

      const frame = page.locator('.drug-header__frame');
      const paddingValues = await frame.evaluate((node) => {
        const style = window.getComputedStyle(node);
        return {
          paddingLeft: parseFloat(style.paddingLeft),
          paddingRight: parseFloat(style.paddingRight),
        };
      });

      expect(paddingValues.paddingLeft).toBeGreaterThan(30);
      expect(paddingValues.paddingRight).toBeGreaterThan(30);
    });

    test('header layout matches the expected desktop appearance', async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.goto(`file://${builtPagePath}`);

      await page.addStyleTag({ path: stylePath });

      const header = page.locator('.drug-header');
      await expect(header).toHaveScreenshot(`${slug}-header-desktop-centered.png`, {
        animations: 'disabled',
        caret: 'hide',
        scale: 'device',
        maxDiffPixelRatio: 0.02,
      });
    });
  });
}
