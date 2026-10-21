# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Personal academic portfolio for Jaemin Kim (CoreLab, Yonsei University), deployed via GitHub Pages from `main` (`jae-min-kim.github.io`). Plain static site: `index.html` + `styles.css` + `app.js`, no framework, no build step, no package manager, no tests or linter.

`agent.md` holds a more detailed onboarding note (rendering rules, frequently edited spots, post-change checklist). Keep it in sync when behavior it describes changes.

## Deployment

Deployed only through GitHub Pages: pushing to `main` publishes the site. There is no local run setup.

## Architecture

- **Single page, four sections** (`#home`, `#information`, `#publications`, `#contact`, all `.panel`). Tabs in `.section-tabs` are `.tab-button`s whose `data-target` must match a section `id`. Tabs scroll to sections rather than hiding them; an `IntersectionObserver` in `app.js` syncs the active tab while scrolling. Note the "Extras" tab targets `id="contact"`.
- **Static content** (profile, intro, social links, Extras photo/caption, office address) is hand-written in `index.html`. The email appears twice there in obfuscated `{first-name}.{last-name}@yonsei.ac.kr` form on purpose.
- **Data-driven content** is fetched at load (`cache: 'no-store'`) and rendered as HTML strings into `#information-container` and `#publications-container`:
  - `information.json`: keys `affiliationsAndExperience`, `education`, `teaching`, `awards` (rendered as "Recognition"). Items use `year`/`period`, `description`/`detail`, optional `note`. `<br>` and `\n` both become line breaks; "Hanjun Kim" is auto-linked to his homepage.
  - `publications.json`: array of `{visible, first, year, title, authors, proceedings, link}`. A non-empty `link` (http/https only) turns the title into an external link. Only `visible: true` entries render. `first` is `"first"`, `"co"`, or anything else, and it drives the badge and the "First Author only" toggle. Entries are sorted by the largest 4-digit year in `year` (descending), then by title. "Jaemin Kim" in `authors` is highlighted. The two `visible: false` entries are sample templates kept for reference; don't delete them.
- All JSON values pass through `escapeHtml` before any intentional markup (`<br>`, links, highlights) is added back. Keep that order when adding new formatting.
- **Publication filter animation**: toggling runs fade-out, then a height transition, then fade-in. `publicationsAnimationToken` cancels stale runs when the toggle is clicked quickly. Keyframes `publicationFadeIn`/`publicationFadeOut` live in `styles.css`.
- **Styling**: dark theme with CSS variables on `:root`; mobile breakpoint is `max-width: 760px`. The sticky tab bar depends on `html { overflow-x: clip; }` with no `overflow` on `body`. Using `overflow-x: hidden` on either one breaks `position: sticky`. JS toggles `.is-stuck` on the tab bar for its blurred background.
