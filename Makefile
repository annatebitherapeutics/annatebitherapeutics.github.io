SHELL := /bin/bash

.PHONY: build serve test test-update snapshots snapshots-only snapshots-update playwright-install clean ci

build:
	bundle exec jekyll build

serve:
	bundle exec jekyll serve --livereload

test:
	npm run test

test-update:
	npm run test:update

snapshots:
	npm run snapshots

snapshots-only:
	npm run snapshots:only

snapshots-update: snapshots

playwright-install:
	npm run playwright:install

ci: test snapshots

clean:
	rm -rf _site .jekyll-cache .sass-cache snapshots test-results playwright-report
	find . -name "*.DS_Store" -delete
