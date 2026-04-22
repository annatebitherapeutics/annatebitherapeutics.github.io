const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const {
  buildPreviewPlan,
  getChangedNewsPostPaths,
} = require('../capture-pr-previews');

function write(filePath, content) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content);
}

test('getChangedNewsPostPaths keeps only markdown news posts', () => {
  assert.deepEqual(
    getChangedNewsPostPaths([
      '_posts/news/2026-04-21-feature.md',
      '_posts/news/notes.txt',
      'pages/news.md',
      '_posts/events/2026-04-21-feature.md',
      '_posts/news/2026-04-22-followup.markdown',
    ]),
    [
      '_posts/news/2026-04-21-feature.md',
      '_posts/news/2026-04-22-followup.markdown',
    ]
  );
});

test('buildPreviewPlan resolves homepage, newsroom, and changed post output paths', () => {
  const repoRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'annate-pr-preview-'));

  const postSourcePath = path.join(repoRoot, '_posts/news/2026-04-21-feature.md');
  write(
    postSourcePath,
    `---\ntitle: "Preview Story"\ndate: "2026-04-21"\ncategories:\n- press-release\n---\n\nBody copy.\n`
  );

  write(path.join(repoRoot, '_site/index.html'), '<html><body><h1>Home</h1></body></html>');
  write(path.join(repoRoot, '_site/news/index.html'), '<html><body><h1>News</h1></body></html>');
  write(
    path.join(repoRoot, '_site/press-release/feature/index.html'),
    '<html><head><title>Preview Story</title></head><body><h1>Preview Story</h1></body></html>'
  );

  const plan = buildPreviewPlan({
    repoRoot,
    postSourcePath,
    outputDir: path.join(repoRoot, 'pr-previews'),
  });

  assert.equal(plan.postSourcePath, postSourcePath);
  assert.equal(plan.targets.length, 3);
  assert.deepEqual(
    plan.targets.map((target) => ({
      name: target.name,
      htmlPath: path.relative(repoRoot, target.htmlPath),
      routePath: target.routePath,
      screenshotPath: path.relative(repoRoot, target.screenshotPath),
    })),
    [
      {
        name: 'front-page',
        htmlPath: '_site/index.html',
        routePath: '/',
        screenshotPath: 'pr-previews/front-page.png',
      },
      {
        name: 'news-page',
        htmlPath: '_site/news/index.html',
        routePath: '/news/',
        screenshotPath: 'pr-previews/news-page.png',
      },
      {
        name: 'post-page',
        htmlPath: '_site/press-release/feature/index.html',
        routePath: '/press-release/feature/',
        screenshotPath: 'pr-previews/post-page.png',
      },
    ]
  );
});
