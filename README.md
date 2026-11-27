# Finance Analyzer — The Value Investor's Cockpit

A professional web app to analyze investments, read company financials and apply the value investing principles of Benjamin Graham and Warren Buffett — from raw data to a clear verdict, in one cockpit.

**Live Demo**: [https://www.faber04.com/app/finance-analyzer/](https://www.faber04.com/app/finance-analyzer/)
**Current Version**: `v0.4.0-rc.1`
**Status**: deployed and online, light/dark glass UI, EN/IT

## What it does

### Analyze — single company
- Type a ticker in the hero and the app auto-fills the latest financials from Financial Modeling Prep (FMP), with per-field provenance and 10-year history.
- All fundamental data lives in **one editable panel** — fix a number by hand if you disagree with the source.
- Fixed **Graham/Buffett criteria** (read-only) drive the analysis.
- Press **Analyze** and get ratios, a **Value Score (0–100)** with a recommendation (Strong Buy / Buy / Hold / Avoid), a score ring, a 10-year sparkline and a stale-data warning when the report is old.

### Compare — multi-company screener
- Add up to **6 tickers** and run the screener: sortable comparison table (score, P/E, P/B, ROE, D/E, recommendation) with a trophy for the best score.

### Track — portfolio
- Add positions and monitor them: real-time gain/loss via quote refresh, sector allocation donut, gain/loss bar chart and performance chart (Recharts).

### Reflect — investment journal
- Write your thesis **before** you buy, tag it, filter and search entries, and review outcomes and lessons learned.

### Design
- macOS-style design system: glass cards over a mesh gradient, **light/dark theme** (persisted), fully responsive with a solid mobile menu.
- **i18n EN/IT** with English default; empty / error / loading states on every screen.

## Quick start

### Prerequisites
- Node.js 18+

### Local setup
```bash
git clone https://github.com/Faber04/com.faber04.app.finance-analyzer.git
cd com.faber04.app.finance-analyzer
npm install
echo "VITE_FMP_API_KEY=your_fmp_key" > .env.local
npm run dev
```

### API key
The app needs a **Financial Modeling Prep** API key. Set `VITE_FMP_API_KEY` in `.env.local` (recommended) or store `FMP_API_KEY` in the browser's localStorage.

### Production routing
The app is published in a subfolder (`/app/finance-analyzer/`) and uses HashRouter:
- `https://www.faber04.com/app/finance-analyzer/#/`
- `.../#/portfolio`
- `.../#/journal`

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

## Scoring criteria (Value Score v2)

Companies are scored in `src/utils/financial-calculations.ts` — weighted Graham/Buffett criteria, sum 100. Criteria with missing data are marked N/A and excluded from the total, so a missing number never passes or fails a test:

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

## Tech stack

- **React 18** + **TypeScript**
- **Vite** build tool & dev server
- **Tailwind CSS** design system (brand tokens: navy `#0a0f1c`, teal `#0ea5e9`, amber `#fbbf24`)
- **Zustand** state management with persistence
- **Recharts** charts
- **Lucide React** icons
- **Financial Modeling Prep (FMP)** data provider

## Quality

- `npm test` — 43 tests (calculations, i18n parity, FMP client)
- `npm run lint` — ESLint, zero warnings
- `npm run build` — production build

## Roadmap

- **0.5.0**: PDF export (analysis + portfolio)
- **0.6.0**: installable PWA + price alerts + notification center
- **0.7.0**: backtesting MVP with key metrics
- **1.0.0**: final stabilization, end-to-end tests, release docs

## Disclaimer

**This app is for educational purposes only.** It is not financial advice. Data may not be 100% accurate. Always consult a professional before investing.

## License

MIT — free for educational and personal use.

---

Built by [@Faber04](https://github.com/Faber04)
