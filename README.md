# garpunkal.dev

[![Playwright Tests](https://github.com/garpunkal/garpunkal.dev/actions/workflows/playwright.yml/badge.svg)](https://github.com/garpunkal/garpunkal.dev/actions/workflows/playwright.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE.md)

Personal portfolio and developer showcase for **Gareth Wright** ([garpunkal.dev](https://garpunkal.dev)).

![Screenshot of website](/screens/screenshot1.png)

---

## 🚀 Tech Stack

- **Framework**: [Astro](https://astro.build/) (v7) — Fast static-site generator with minimal client-side JavaScript.
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) (v4) — Modern styling engine integrated via `@tailwindcss/vite`.
- **Content Management**: [Squidex CMS](https://squidex.io) — Headless CMS powering projects, experiences, articles, and skills.
- **Icons**: [Simple Icons](https://simpleicons.org/) & [Devicon](https://devicon.dev/) — High-fidelity brand vector SVGs.
- **AI Enrichment**: [Google Gemini API](https://ai.google.dev/) (`gemini-3.8-flash`) — Automated metadata discovery and categorization.
- **Testing**: [Playwright](https://playwright.dev/) — End-to-end and accessibility testing in headless Chromium.
- **CI / CD**: [GitHub Actions](https://github.com/features/actions) & [Vercel](https://vercel.com/) — Automated test execution on push/PR and continuous deployment.

---

## ✨ Features & Design

- **🌗 Dark & Light Mode**:
  - Persisted user preference via `localStorage`.
  - Dark mode image & icon opacity dimming (`dark:opacity-75` / `dark:brightness-75`), smoothly transitioning to 100% on card or chip hover/focus.
  - Interactive SVG chromatic aberration filter effect on profile picture.
- **♿ Accessibility (WCAG AA Compliant)**:
  - Accessible names, titles, and `aria-label` attributes on all interactive buttons, external links, and screenshots.
  - Keyboard skip-to-main-content navigation link.
  - High-contrast color palettes tested for legibility across light and dark themes.
- **⚡ Grouped Skill Cloud**:
  - 160+ technologies organized into five thematic pillars for quick scanning:
    - **Architecture & Backend**
    - **CMS & Content Platforms**
    - **Frontend & UI**
    - **Cloud, DevOps & Tooling**
    - **AI & Emerging Tech**
  - Integrated drop-shadow vector badges with official brand colors.

---

## 🛠️ Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v22.12.0+ recommended)
- [npm](https://www.npmjs.com/)

### Installation

```bash
git clone https://github.com/garpunkal/garpunkal.dev.git
cd garpunkal.dev
npm install
```

### Environment Configuration

Copy the example environment file and add your credentials:

```bash
cp .env.example .env
```

| Variable | Description | Required |
| :--- | :--- | :--- |
| `SQUIDEX_KEY` | Squidex application name (e.g. `garpunkaldev`) | Yes |
| `SQUIDEX_CLIENT_ID` | Squidex client credentials ID | Yes |
| `SQUIDEX_CLIENT_SECRET` | Squidex client secret token | Yes |
| `GEMINI_API_KEY` | Google Gemini API key for AI skill metadata enrichment | Optional |
| `DEV_KEY` | Dev.to API key for article syndication | Optional |

### Development & Build Commands

```bash
# Start local development server (with HTTPS/mkcert)
npm run dev

# Run Astro diagnostics and generate production static build
npm run build

# Preview production build locally
npm run preview
```

---

## 🤖 AI Skill Synchronization & Icon Pipeline

The project includes automation scripts to automatically enrich skills in Squidex with canonical documentation links, brand colors, categories, and vector icons:

### 1. Enrich New & Incomplete Skills

```bash
npm run sync-skills
```

- Analyzes skills in Squidex and queries **Google Gemini** (`gemini-3.8-flash`) for:
  - **Canonical URL**: Official documentation or vendor product page (strictly avoiding Wikipedia or search engines).
  - **Icon Slug**: The official brand slug on **simpleicons.org**.
  - **Brand Colors**: Primary background HEX and contrast-tested foreground color.
  - **Category**: Mapped into one of the five active skill pillars.
- Downloads clean vector SVGs from **simpleicons.org**, sanitizes them for Squidex XML compliance, and uploads them to the Squidex `icons` asset folder.

#### Targeted or Forced Runs:
```bash
# Re-evaluate a specific skill with Gemini and SimpleIcons
node scripts/sync-new-skills.mjs --skill "Docker" --force

# Force re-evaluation of all skills
node scripts/sync-new-skills.mjs --all
```

### 2. Batch Update All Icons

```bash
npm run sync-all-icons
```

Scans all skills in Squidex, matches them against the in-memory **simpleicons.org** library (3,460+ brand icons) or CDN, uploads any missing vector SVGs, and links them to the skill records in Squidex.

### 3. Extensible Data Files

Local mappings and overrides are separated into JSON files under `scripts/data/`:
- [`scripts/data/known-urls.json`](scripts/data/known-urls.json) — Curated official URLs.
- [`scripts/data/known-colors.json`](scripts/data/known-colors.json) — Curated brand background and foreground colors.
- [`scripts/data/icon-aliases.json`](scripts/data/icon-aliases.json) — Keyword and alias mappings to SimpleIcons slugs.

---

## 🧪 Testing with Playwright

The project includes an automated test suite powered by [Playwright](https://playwright.dev/):

```bash
# Run all tests in headless Chromium
npm test

# Run tests in interactive UI mode
npm run test:ui
```

### Test Coverage:
- **Accessibility & Links** ([`playwright/accessibility.spec.ts`](playwright/accessibility.spec.ts)):
  - Asserts all interactive buttons have descriptive accessible names.
  - Verifies every link on the page has valid `href` and accessible text.
  - Validates theme toggle functionality between light and dark modes.
- **Skills Section** ([`playwright/skills.spec.ts`](playwright/skills.spec.ts)):
  - Verifies rendering of all five thematic pillars.
  - Asserts skill chips render logos and titles.
  - Tests that skill icons decrease opacity in dark mode (`dark:opacity-75`) and transition to full opacity on hover.
- **Core Routes** ([`playwright/home.spec.ts`](playwright/home.spec.ts)):
  - Page metadata and hero navigation.
  - 404 page handling for unknown routes.

Continuous testing runs automatically on pushes and pull requests via GitHub Actions ([`.github/workflows/playwright.yml`](.github/workflows/playwright.yml)).

---

## 📄 License

This project is licensed under the [MIT License](LICENSE.md).
