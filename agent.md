# Agent Quick Context - Graduate Portfolio Web Service

## 1) One-line Summary
- Static single-page portfolio site.
- Shows graduate student profile, timeline (`information.json`), and publications (`publications.json`) with tab-based navigation.
- No framework or build tool; runs with `index.html + styles.css + app.js`.

## 2) File Map and Responsibilities
- `index.html`: Full page structure (Main/Information/Publications/Extras), tab buttons, data containers, image placements.
- `styles.css`: Full visual design (dark theme, sticky tabs, cards/typography, responsive layout, publication animations).
- `app.js`: Tab navigation, IntersectionObserver-based active tab sync, JSON fetch/render, publication filtering/sorting/animation.
- `information.json`: Experience/education/teaching/awards data source.
- `publications.json`: Publications array data source.
- `profile.jpg`, `sydney_profile.jpg`: Main and Extras image assets.
- `agent.md`: Fast onboarding context for the next agent run (this file).

## 3) Runtime / Local Run
- No package installation required.
- Because the app uses `fetch('./information.json')` and `fetch('./publications.json')`, use a local server instead of opening `file://`.
- Example:
  - `cd /home/lameduck/01_web/personal`
  - `python3 -m http.server 8000`
  - Open `http://localhost:8000`

## 4) UI / Interaction Flow
- Clicking a top tab (`.tab-button`) scrolls to the target section with `scrollIntoView`.
- `IntersectionObserver` detects the currently visible section and auto-updates the active tab.
- `.section-tabs` is sticky; when stuck, `is-stuck` is toggled to enable blurred background styling.

## 5) Data Rendering Rules (Core)

### Information
- `renderInformation(data)` renders these groups in order:
  - `affiliationsAndExperience`
  - `education`
  - `teaching`
  - `awards`
- Each item uses `year|period`, `description|detail`, and `note`.
- Empty groups show `No entries yet.`.
- Safety/display processing:
  - `escapeHtml` is applied
  - Newlines (`\n`, `<br>`) are normalized into `<br>`
  - `Hanjun Kim` text is auto-linkified to `https://corelab.or.kr/~hanjun/`

### Publications
- `loadPublications()` reads `publications.json`, stores it in `publicationsData`, then renders.
- Render conditions:
  - Only items with `visible === true` are shown.
  - Items with all core fields empty (`year/title/authors/proceedings`) are excluded.
- Sorting:
  - Extracts 4-digit year(s) from `year` text and sorts descending.
  - If tied, sorts by `title` ascending.
- Name highlight:
  - `Jaemin Kim` in `authors` is highlighted (`.author-highlight`).
- First-author filter:
  - Toggle ON shows only items where `first` is `first` or `co`.
  - Badge mapping: `first -> First Author`, `co -> Co-First Author`.

## 6) Current Data State
- `information.json`: Real entries exist (education/experience/awards), `teaching` is empty.
- `publications.json`: Both sample entries are `visible: false`, so an empty publication list in UI is currently expected behavior.

## 7) Frequently Edited Areas
- Main profile text and intro: `#home` section in `index.html`.
- Contact email placeholders (`{last-name}.{first-name}@yonsei.ac.kr`): appears in two places in `index.html`.
- Publication visibility/content: `visible`, `first`, `year/title/authors/proceedings` in `publications.json`.
- Section order or tab labels: tab buttons (`data-target`) and matching section `id` in `index.html`.
- Extras image caption:
  - Caption text is currently a paragraph placed *outside* the image `figure`, right below it:
    - `January 31, 2026, Sydney - during CGO 2026.`
  - Markup location: `index.html` in `#contact` (`Extras`) section as:
    - `<p class="caption extras-banner-caption">...</p>`
  - Styling location: `styles.css`:
    - `.extras-card .extras-banner-caption { width: min(100%, 740px); margin: 8px auto 1.55em; }`
  - Purpose:
    - Keep the caption visually aligned to the image width (`740px` max).
    - Add extra vertical spacing before contact/office text.

## 8) Quick Post-change Checklist
- Active tab sync works correctly on both click and scroll.
- Information/Publications load without fetch/render errors.
- Publications filter toggle animations still behave correctly.
- Layout remains stable on mobile width (`<=760px`).
