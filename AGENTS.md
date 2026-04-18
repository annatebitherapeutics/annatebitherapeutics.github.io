# Agent Rules

This repository is a Jekyll site deployed with GitHub Pages. Agents working here should follow these rules.

## Environment

- Use the `website` mamba environment for local work when available.
- Prefer `mamba run -n website <command>` for non-interactive execution.
- The expected Ruby version is defined in [.ruby-version](.ruby-version) and should match CI.
- Use Node from the same environment for `npm` and Playwright commands.
- When running from `/mnt/c` under WSL, avoid repo-local Bundler install paths because Bundler treats those directories as world-writable.
- Prefer temp paths for local tooling state in that case:
  - `HOME=/tmp/website-home`
  - `BUNDLE_PATH=/tmp/website-bundle`
  - `PLAYWRIGHT_BROWSERS_PATH=/tmp/website-playwright`
- Prefer reproducible installs:
  - `bundle install`
  - `npm ci`
  - `npx playwright install`

## Primary Commands

- Build the site: `bundle exec jekyll build`
- Serve locally: `bundle exec jekyll serve --livereload`
- Run the test flow: `npm test`
- Update snapshots only when intentionally refreshing expected output: `npm run test:update`
- In the `website` conda environment, prefer `ruby -S bundle _2.4.1_ ...` if the packaged `bundle` shim is broken.

## CI Expectations

- Pull requests should validate the Jekyll build.
- Pages configuration and deployment steps should remain limited to non-PR runs.
- Changes to Ruby, Bundler, Node, or lockfiles must be checked against `.github/workflows/jekyll.yml`.

## Change Scope

- Keep changes tightly scoped to the requested task.
- Do not include unrelated untracked assets, media, or local scratch files in commits.
- Treat generated lockfile changes as intentional only when they are required for dependency or runtime updates.

## Git Workflow

- Work from a task-specific branch, not `main`.
- Before staging, inspect `git status --short --branch`.
- Stage only the files that belong to the task.
- Do not rewrite or revert unrelated user changes.

## Validation Order

- If dependencies changed, validate in this order:
  - `bundle exec jekyll build`
  - `npm test` if browser tests are relevant
- If the full test suite cannot run, state the blocker clearly in the final handoff.

## Content and Deployment Safety

- Avoid changing site content, images, or data files unless the task requires it.
- Do not alter deployment behavior casually; this site publishes from GitHub Actions to Pages.
- If a security update changes runtime requirements, update both local guidance and CI configuration in the same task.
