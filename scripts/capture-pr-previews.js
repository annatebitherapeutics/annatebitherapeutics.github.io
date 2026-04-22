#!/usr/bin/env node
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const { spawnSync } = require('node:child_process');

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function ensureFile(filePath, description) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`${description} not found at ${filePath}`);
  }
}

function readFrontMatter(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  const match = raw.match(/^---\n([\s\S]*?)\n---/);
  if (!match) {
    throw new Error(`Missing YAML front matter in ${filePath}`);
  }

  const data = {};
  let currentKey = null;

  for (const line of match[1].split('\n')) {
    if (!line.trim()) {
      continue;
    }

    const keyMatch = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (keyMatch) {
      currentKey = keyMatch[1];
      const rawValue = keyMatch[2].trim();
      if (!rawValue) {
        data[currentKey] = [];
      } else {
        data[currentKey] = rawValue.replace(/^['"]|['"]$/g, '');
      }
      continue;
    }

    const listMatch = line.match(/^\s*-\s*(.*)$/);
    if (listMatch && currentKey) {
      if (!Array.isArray(data[currentKey])) {
        data[currentKey] = [];
      }
      data[currentKey].push(listMatch[1].trim().replace(/^['"]|['"]$/g, ''));
    }
  }

  return data;
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

function getChangedNewsPostPaths(paths) {
  return paths.filter((filePath) => /^_posts\/news\/.*\.(md|markdown)$/i.test(filePath));
}

function getGitDiffPaths(repoRoot, baseRef) {
  const base = baseRef || 'origin/main...HEAD';
  const result = spawnSync('git', ['diff', '--name-only', base], {
    cwd: repoRoot,
    encoding: 'utf8',
  });

  if (result.status !== 0) {
    throw new Error(`git diff failed: ${result.stderr || result.stdout}`.trim());
  }

  return result.stdout
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

function findBuiltPostHtml(siteDir, title) {
  const files = listHtmlFiles(siteDir);
  const titlePattern = new RegExp(`<title[^>]*>\\s*${escapeRegExp(title)}\\s*</title>`, 'i');
  const h1Pattern = new RegExp(`<h1[^>]*>\\s*${escapeRegExp(title)}\\s*</h1>`, 'i');
  const ogTitlePattern = new RegExp(`property=["']og:title["'][^>]*content=["']${escapeRegExp(title)}["']`, 'i');

  for (const relPath of files) {
    const absPath = path.join(siteDir, relPath);
    const html = fs.readFileSync(absPath, 'utf8');
    if (titlePattern.test(html) || h1Pattern.test(html) || ogTitlePattern.test(html)) {
      return absPath;
    }
  }

  throw new Error(`Unable to find a built HTML page in ${siteDir} for post title "${title}"`);
}

function toRoutePath(siteDir, htmlPath) {
  const relativePath = path.relative(siteDir, htmlPath).split(path.sep).join('/');
  if (relativePath === 'index.html') {
    return '/';
  }

  if (relativePath.endsWith('/index.html')) {
    return `/${relativePath.slice(0, -'index.html'.length)}`;
  }

  return `/${relativePath.replace(/\.html$/i, '')}`;
}

function buildPreviewPlan({ repoRoot, postSourcePath, outputDir }) {
  const siteDir = path.join(repoRoot, '_site');
  ensureFile(path.join(siteDir, 'index.html'), 'Front page export');
  ensureFile(path.join(siteDir, 'news', 'index.html'), 'News page export');
  ensureFile(postSourcePath, 'News post source');

  const frontMatter = readFrontMatter(postSourcePath);
  if (!frontMatter.title) {
    throw new Error(`Missing title in ${postSourcePath}`);
  }

  const postHtmlPath = findBuiltPostHtml(siteDir, frontMatter.title);
  const screenshotDir = outputDir || path.join(repoRoot, 'pr-previews');

  return {
    repoRoot,
    siteDir,
    postSourcePath,
    postTitle: frontMatter.title,
    screenshotDir,
    targets: [
      {
        name: 'front-page',
        label: 'Front page',
        htmlPath: path.join(siteDir, 'index.html'),
        routePath: toRoutePath(siteDir, path.join(siteDir, 'index.html')),
        screenshotPath: path.join(screenshotDir, 'front-page.png'),
      },
      {
        name: 'news-page',
        label: 'News page',
        htmlPath: path.join(siteDir, 'news', 'index.html'),
        routePath: toRoutePath(siteDir, path.join(siteDir, 'news', 'index.html')),
        screenshotPath: path.join(screenshotDir, 'news-page.png'),
      },
      {
        name: 'post-page',
        label: frontMatter.title,
        htmlPath: postHtmlPath,
        routePath: toRoutePath(siteDir, postHtmlPath),
        screenshotPath: path.join(screenshotDir, 'post-page.png'),
      },
    ],
  };
}

function writeManifest(plan) {
  fs.mkdirSync(plan.screenshotDir, { recursive: true });

  const manifest = {
    generatedAt: new Date().toISOString(),
    postSourcePath: path.relative(plan.repoRoot, plan.postSourcePath),
    postTitle: plan.postTitle,
    screenshots: plan.targets.map((target) => ({
      name: target.name,
      label: target.label,
      htmlPath: path.relative(plan.repoRoot, target.htmlPath),
      routePath: target.routePath,
      screenshotPath: path.relative(plan.repoRoot, target.screenshotPath),
    })),
  };

  fs.writeFileSync(path.join(plan.screenshotDir, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);
  fs.writeFileSync(
    path.join(plan.screenshotDir, 'README.md'),
    [
      '# PR website previews',
      '',
      `Generated for: \`${manifest.postSourcePath}\``,
      '',
      ...manifest.screenshots.map((shot) => `- **${shot.label}** — \`${shot.screenshotPath}\``),
      '',
    ].join('\n')
  );
}

function getContentType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return (
    {
      '.css': 'text/css; charset=utf-8',
      '.gif': 'image/gif',
      '.html': 'text/html; charset=utf-8',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.js': 'application/javascript; charset=utf-8',
      '.json': 'application/json; charset=utf-8',
      '.png': 'image/png',
      '.svg': 'image/svg+xml',
      '.txt': 'text/plain; charset=utf-8',
      '.webp': 'image/webp',
      '.woff': 'font/woff',
      '.woff2': 'font/woff2',
      '.xml': 'application/xml; charset=utf-8',
    }[ext] || 'application/octet-stream'
  );
}

function createSiteServer(siteDir) {
  const server = http.createServer((request, response) => {
    const pathname = decodeURIComponent((request.url || '/').split('?')[0]);
    const relativePath = pathname === '/'
      ? 'index.html'
      : pathname.endsWith('/')
        ? `${pathname.slice(1)}index.html`
        : pathname.slice(1);
    const normalized = path.normalize(relativePath).replace(/^([.][.][/\\])+/, '');
    let filePath = path.join(siteDir, normalized);

    if (!filePath.startsWith(siteDir)) {
      response.writeHead(403);
      response.end('Forbidden');
      return;
    }

    if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
      filePath = path.join(filePath, 'index.html');
    }

    if (!fs.existsSync(filePath)) {
      response.writeHead(404);
      response.end('Not found');
      return;
    }

    response.writeHead(200, { 'Content-Type': getContentType(filePath) });
    response.end(fs.readFileSync(filePath));
  });

  return new Promise((resolve, reject) => {
    server.on('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const address = server.address();
      resolve({
        close: () => new Promise((done, fail) => server.close((error) => (error ? fail(error) : done()))),
        origin: `http://127.0.0.1:${address.port}`,
      });
    });
  });
}

async function captureScreenshots(plan) {
  const { chromium } = require('@playwright/test');

  fs.mkdirSync(plan.screenshotDir, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const siteServer = await createSiteServer(plan.siteDir);

  try {
    const context = await browser.newContext({
      viewport: { width: 1600, height: 1200 },
      deviceScaleFactor: 1,
    });

    for (const target of plan.targets) {
      const page = await context.newPage();
      await page.goto(`${siteServer.origin}${target.routePath}`, { waitUntil: 'networkidle' });
      const declineConsent = page.locator('[data-consent-decline]');
      if (await declineConsent.count()) {
        await declineConsent.first().click().catch(() => {});
      }
      await page.waitForTimeout(150);
      await page.screenshot({ path: target.screenshotPath, fullPage: true });
      await page.close();
      console.log(`✓ ${target.name} -> ${path.relative(plan.repoRoot, target.screenshotPath)}`);
    }

    await context.close();
  } finally {
    await Promise.allSettled([siteServer.close(), browser.close()]);
  }
}

function parseArgs(argv) {
  const args = {
    repoRoot: process.cwd(),
    outputDir: null,
    postSourcePath: null,
    baseRef: null,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--repo-root') args.repoRoot = path.resolve(argv[++i]);
    else if (arg === '--output-dir') args.outputDir = path.resolve(args.repoRoot, argv[++i]);
    else if (arg === '--post-source') args.postSourcePath = path.resolve(args.repoRoot, argv[++i]);
    else if (arg === '--base-ref') args.baseRef = argv[++i];
    else throw new Error(`Unknown argument: ${arg}`);
  }

  return args;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const repoRoot = path.resolve(args.repoRoot);
  const changedPostPaths = args.postSourcePath
    ? [path.relative(repoRoot, args.postSourcePath)]
    : getChangedNewsPostPaths(getGitDiffPaths(repoRoot, args.baseRef));

  if (changedPostPaths.length === 0) {
    throw new Error('No changed news post found. Pass --post-source _posts/news/<file>.md or update a newsroom post in this branch.');
  }

  if (changedPostPaths.length > 1) {
    throw new Error(`Expected exactly one changed news post, found ${changedPostPaths.length}: ${changedPostPaths.join(', ')}`);
  }

  const postSourcePath = path.resolve(repoRoot, changedPostPaths[0]);
  const plan = buildPreviewPlan({
    repoRoot,
    postSourcePath,
    outputDir: args.outputDir || path.join(repoRoot, 'pr-previews'),
  });

  await captureScreenshots(plan);
  writeManifest(plan);
  console.log(`Saved PR previews to ${path.relative(repoRoot, plan.screenshotDir)}`);
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error.message || error);
    process.exitCode = 1;
  });
}

module.exports = {
  buildPreviewPlan,
  findBuiltPostHtml,
  getChangedNewsPostPaths,
  readFrontMatter,
};
