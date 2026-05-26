const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const {
  buildPreviewPlan,
  getChangedNewsPostPaths,
  getPreviewableNewsPostPaths,
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

test('getPreviewableNewsPostPaths ignores deleted news posts and preserves modified ones', () => {
  assert.deepEqual(
    getPreviewableNewsPostPaths([
      'M\t_posts/news/2026-04-21-feature.md',
      'D\t_posts/news/2026-04-20-old-post.md',
      'R100\t_posts/news/2026-04-19-before.md\t_posts/news/2026-04-19-after.md',
      'A\t_posts/news/2026-04-22-new-post.markdown',
      'M\tpages/news.md',
    ]),
    [
      '_posts/news/2026-04-21-feature.md',
      '_posts/news/2026-04-19-after.md',
      '_posts/news/2026-04-22-new-post.markdown',
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

test('buildPreviewPlan derives the post output path from categories and slug instead of title matching', () => {
  const repoRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'annate-pr-preview-dupes-'));
  const postSourcePath = path.join(repoRoot, '_posts/news/2026-04-21-feature.md');

  write(
    postSourcePath,
    `---\ntitle: "Shared Title"\ndate: "2026-04-21"\ncategories:\n- press-release\n- events\n---\n\nBody copy.\n`
  );

  write(path.join(repoRoot, '_site/index.html'), '<html><body><h1>Home</h1></body></html>');
  write(path.join(repoRoot, '_site/news/index.html'), '<html><body><h1>News</h1></body></html>');
  write(
    path.join(repoRoot, '_site/aaa-wrong/index.html'),
    '<html><head><title>Shared Title</title></head><body><h1>Shared Title</h1></body></html>'
  );
  write(
    path.join(repoRoot, '_site/press-release/events/feature/index.html'),
    '<html><head><title>Shared Title</title></head><body><h1>Shared Title</h1></body></html>'
  );

  const plan = buildPreviewPlan({ repoRoot, postSourcePath });

  assert.equal(
    path.relative(repoRoot, plan.targets[2].htmlPath),
    '_site/press-release/events/feature/index.html'
  );
  assert.equal(plan.targets[2].routePath, '/press-release/events/feature/');
});
