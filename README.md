<h1 align="center">Finance Analyzer</h1>

<p align="center"><b>The Value Investor's Cockpit</b><br>
Analyze companies with Graham & Buffett's value investing principles — from raw financials to a clear verdict, in one place.</p>

<p align="center">
  <a href="https://www.faber04.com/app/finance-analyzer/"><img src="https://img.shields.io/badge/Live_Demo-0ea5e9?style=for-the-badge" alt="Live demo"></a>
  <a href="https://github.com/Faber04/com.faber04.app.finance-analyzer"><img src="https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white" alt="GitHub"></a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/version-0.4.0--rc.1-0ea5e9" alt="version">
  <img src="https://img.shields.io/badge/tests-43_passing-22c55e" alt="tests">
  <img src="https://img.shields.io/badge/license-MIT-fbbf24" alt="license">
  <img src="https://img.shields.io/badge/EN_%2F_IT-i18n-8b5cf6" alt="i18n">
</p>

---

## The cockpit

| | | |
|---|---|---|
| **Analyze** | **Compare** | **Track** | **Reflect** |
| Type a ticker: FMP auto-fills financials with per-field provenance and 10-year history. All data in one editable panel. Press Analyze for ratios + Value Score. | Screener for up to 6 companies side by side: sortable table, best-in-class trophy. | Portfolio with live gain/loss, sector donut, performance and gain/loss charts. | Investment journal: write the thesis before you buy, tag, filter, review outcomes. |

Every analysis ends in a **Verdict Card**: Value Score 0–100, recommendation (Strong Buy / Buy / Hold / Avoid), score ring, 10-year sparkline, provenance badge and a stale-data warning when the report is old.

### Design

macOS-style design system: **glass cards** over a mesh gradient, **light/dark theme** (persisted), responsive with a solid mobile menu, empty / error / loading states on every screen, **EN/IT i18n** with English default.

---

## Scoring — Value Score v2

Weighted Graham/Buffett criteria in `src/utils/financial-calculations.ts` (sum 100). Criteria with missing data are N/A and excluded from the total — a missing number never passes or fails a test.

| Criterion | Benchmark | Weight |
|-----------|-----------|--------|
| EPS | > 0 | 10% |
| P/E | < 15 | 10% |
| P/B | < 1.5 | 5% |
| P/S | < 3 | 5% |
| ROE | ≥ 15% | 10% |
| ROE 10y trend | ≥ 10% in each of the last 10 years | 10% |
| Net margin | ≥ 10% | 5% |
| Debt/Equity | < 0.5 | 10% |
| Current ratio | ≥ 1.5 | 5% |
| Graham Number | price < √(22.5·EPS·BVPS) | 10% |
| NCAV net-net | price < ⅔·NCAV per share | 10% |
| Margin of safety vs DCF | price < 70% of FMP DCF | 10% |

---

## Quick start

```bash
git clone https://github.com/Faber04/com.faber04.app.finance-analyzer.git
cd com.faber04.app.finance-analyzer
npm install
echo "VITE_FMP_API_KEY=your_fmp_key" > .env.local
npm run dev
```

**API key**: set `VITE_FMP_API_KEY` in `.env.local`, or store `FMP_API_KEY` in the browser localStorage. Data provider: [Financial Modeling Prep](https://financialmodelingprep.com).

Production uses HashRouter under a subfolder: `https://www.faber04.com/app/finance-analyzer/#/`, `#/portfolio`, `#/journal`.

---

## Tech stack

<p align="center">
  <img src="https://img.shields.io/badge/React_18-61dafb?logo=react&logoColor=black" alt="React">
  <img src="https://img.shields.io/badge/TypeScript-3178c6?logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/Vite-646cff?logo=vite&logoColor=white" alt="Vite">
  <img src="https://img.shields.io/badge/Tailwind-38bdf8?logo=tailwindcss&logoColor=white" alt="Tailwind">
  <img src="https://img.shields.io/badge/Zustand-ff7a00" alt="Zustand">
  <img src="https://img.shields.io/badge/Recharts-ff6b6b" alt="Recharts">
  <img src="https://img.shields.io/badge/Vitest-6e9f18?logo=vitest&logoColor=white" alt="Vitest">
</p>

Brand tokens: navy `#0a0f1c`, teal `#0ea5e9`, amber `#fbbf24`.

## Project structure

```text
src/
  components/
    common/                    # Card, Button, Input, EmptyState, ErrorState, Skeleton
    modules/
      analyze/                 # Hero ticker search, editable FinancialsPanel, CriteriaPanel
      fundamental-analysis/    # RatiosDisplay, VerdictCard (score ring + sparkline)
      screener/                # ScreenerInput, ScreenerComparisonTable
      portfolio/               # Positions, forms, charts
      journal/                 # Entries, filters, cards
    charts/                    # Recharts wrappers (theme-aware via CSS vars)
    Navigation.tsx, LanguageSelector.tsx, ThemeToggle.tsx
  pages/                       # AnalyzePage, PortfolioPage, JournalPage
  i18n/                        # en/it dictionaries + parity tests
  services/                    # FMP API client with error taxonomy
  store.ts                     # Zustand store + localStorage persistence
  utils/                       # financial-calculations (ratios, value score)
```

## Quality

```bash
npm test        # 43 tests: calculations, i18n parity, FMP client
npm run lint    # ESLint, zero warnings
npm run build   # production build
```

## Roadmap

- **0.5.0** — PDF export (analysis + portfolio)
- **0.6.0** — installable PWA + price alerts + notification center
- **0.7.0** — backtesting MVP with key metrics
- **1.0.0** — final stabilization, end-to-end tests, release docs

---

> **Disclaimer**: this app is for educational purposes only and is not financial advice. Data may not be 100% accurate. Always consult a professional before investing.

<p align="center">
  <img src="https://img.shields.io/badge/license-MIT-fbbf24" alt="MIT">
</p>

<p align="center">Built by <a href="https://github.com/Faber04">@Faber04</a></p>
