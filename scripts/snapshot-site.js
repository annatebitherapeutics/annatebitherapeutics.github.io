#!/usr/bin/env node
/**
 * Snapshot the static site generated in `_site/` across desktop and mobile viewports.
 * Images are written into `snapshots/<profile>/...` mirroring the directory structure
 * so pages are easy to browse for visual regressions.
 */

const { firefox } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const SITE_DIR = path.resolve(__dirname, '..', '_site');
const SNAPSHOT_DIR = path.resolve(__dirname, '..', 'snapshots');

const PROFILES = [
  {
    name: 'desktop',
    contextOptions: {
      viewport: { width: 1440, height: 900 },
      deviceScaleFactor: 1,
      userAgent:
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
    },
  },
  {
    name: 'mobile',
    contextOptions: {
      viewport: { width: 390, height: 844 },
      deviceScaleFactor: 2,
      userAgent:
        'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
    },
  },
];

function ensureSiteBuilt() {
  if (!fs.existsSync(SITE_DIR)) {
    throw new Error(
      `No _site directory found at ${SITE_DIR}. Run \`bundle exec jekyll build\` before capturing snapshots.`
    );
  }
}

function listHtmlFiles(dir, prefix = '') {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    if (entry.name.startsWith('.')) continue;
    const fullPath = path.join(dir, entry.name);
    const relPath = path.join(prefix, entry.name);

    if (entry.isDirectory()) {
      files.push(...listHtmlFiles(fullPath, relPath));
    } else if (entry.isFile() && entry.name.endsWith('.html')) {
      files.push(relPath);
    }
  }

  return files.sort();
}

async function captureSnapshots() {
  ensureSiteBuilt();

  const pages = listHtmlFiles(SITE_DIR);
  if (!pages.length) {
    console.warn('No HTML files found in _site/. Did the build complete successfully?');
    return;
  }

  fs.mkdirSync(SNAPSHOT_DIR, { recursive: true });

  const browser = await firefox.launch({ headless: true });

  try {
    for (const profile of PROFILES) {
      const context = await browser.newContext(profile.contextOptions);
      console.log(`\nCapturing ${profile.name} snapshots (${pages.length} pages)...`);

      for (const relHtmlPath of pages) {
        const page = await context.newPage();
        const absolutePath = path.join(SITE_DIR, relHtmlPath);
        const fileUrl = `file://${absolutePath}`;

        await page.goto(fileUrl, { waitUntil: 'networkidle' });
        // Allow any late animations/fonts to settle.
        await page.waitForTimeout(150);

        const outDir = path.join(SNAPSHOT_DIR, profile.name, path.dirname(relHtmlPath));
        fs.mkdirSync(outDir, { recursive: true });

        const baseName = path.basename(relHtmlPath, '.html');
        const fileName = `${baseName}.png`;
        const outputPath = path.join(outDir, fileName);

        try {
          await page.screenshot({ path: outputPath, fullPage: true });
          console.log(`  ✓ ${profile.name.padEnd(7)} ${relHtmlPath} → ${path.relative(SNAPSHOT_DIR, outputPath)}`);
        } catch (error) {
          console.warn(
            `  ✗ ${profile.name.padEnd(7)} ${relHtmlPath} (failed to capture: ${error.message || error})`
          );
        }

        await page.close();
      }

      await context.close();
    }
  } finally {
    await browser.close();
  }

  console.log(`\nSnapshots saved to ${SNAPSHOT_DIR}`);
}

captureSnapshots().catch((error) => {
  console.error(error.message || error);
  process.exitCode = 1;
});
