# Annate B Therapeutics Website

This repository contains the public website for Annate B Therapeutics. It is a Jekyll-based site deployed to GitHub Pages and customized for the company’s pages, pipeline content, team information, and visual regression checks.

## Credits

This site is built on top of the original *Feeling Responsive* Jekyll theme by Moritz "mo." Sauer / Phlow. The upstream project remains MIT licensed, and this repository keeps that attribution in place while documenting the Annate B Therapeutics site itself rather than the generic template.

## Stack

- Jekyll on Ruby 3.2
- Node.js 20 for local automation and Playwright
- GitHub Actions for Pages deployment
- Playwright snapshot tests for key page layouts

## Local Environment

The repo includes a committed `website` environment spec for mamba/conda in [environment.yml](environment.yml).

Create or update the local environment and install the repo dependencies with:

```bash
./scripts/setup-website-env.sh
```

That script will:

- create or update the `website` environment
- install the Ruby and Node dependencies used by this repo
- install Bundler `2.4.1`
- install the Chromium browser used by Playwright

## Local Testing

Run the local build and browser test flow with:

```bash
./scripts/test-website.sh
```

That command:

- builds the Jekyll site into `_site/`
- runs the Playwright checks in `test/`

If a visual change is intentional, review the snapshot diffs before updating any expected screenshots.

## Deployment

GitHub Actions deploys the site from `main` to GitHub Pages.

- pull requests validate the Jekyll build before merge
- pushes to `main` deploy the site
- pushes to `main` also create an automated annotated git tag through [.github/workflows/release-tag.yml](.github/workflows/release-tag.yml)

Release tags use this format:

```text
release-YYYYMMDD-HHMMSS-<shortsha>
```

## Repository Notes

- Primary site workflow: [.github/workflows/jekyll.yml](.github/workflows/jekyll.yml)
- Agent guidance for automated contributors: [AGENTS.md](AGENTS.md)
- License and theme credit: [LICENSE](LICENSE)
