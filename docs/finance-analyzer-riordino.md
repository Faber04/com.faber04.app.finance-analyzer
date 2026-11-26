# Finance Analyzer — Piano di riordino "Cockpit" (guida operativa)

> Guida del riordino dell'app verso l'identità **"The value investor's cockpit"**.
> Documento vivo: aggiornarlo quando una PR cambia scope o sequenza.
>
> - Data: 2026-11-26
> - Brief di riferimento (contiene la Definition of Done): [finance-analyzer-piano.md](./finance-analyzer-piano.md)
> - Stato: in corso — PR di codice non ancora aperte

## 1. Contesto e vincoli

- Dal restyling dell'attività: Finance Analyzer è il **case study n.3** (la faccia pubblica del fintech), posizionamento "The value investor's cockpit". **Promozione sospesa** finché l'app non è riorganizzata.
- Vincoli: riordino, non crescita di feature "pure"; i18n IT/EN con default EN (coerente col posizionamento EN di sito/LinkedIn/repo); brand token (navy `#0a0f1c`, teal `#0ea5e9`, ambra `#fbbf24`) come ultimo strato, dopo il riordino.
- Problemi di partenza confermati dal codice:
  - App dispersiva: 6 voci di nav piatte (`src/components/Navigation.tsx:9-16`), 6 route (`src/App.tsx:17-22`), home = mix di stats portfolio + analisi recenti (`src/pages/DashboardPage.tsx`).
  - Bug di calcolo nei fondamentali (`src/utils/financial-calculations.ts`, dettagli in Epic A).
  - Auto-fill FMP all-or-nothing: un endpoint vuoto uccide tutto (`src/services/fmp.ts:48`).

## 2. Decisioni di scope (prese il 2026-11-26)

| # | Domanda | Scelta |
|---|---------|--------|
| 1 | Criteri Graham extra (Graham Number, NCAV net-net, DCF vs prezzo, margin of safety) nello score? | Sì, dentro il Value Score come criteri pesati |
| 2 | Trend multi-anno (limit=10 su income-statement/key-metrics → EPS/ROE/dividendi 10y, CAGR)? | Sì, completo: criterio "ROE costante 10y" nello score + sparkline nella verdict card |
| 3 | Lingua UI? | i18n IT/EN con dizionari custom (no nuove librerie), default EN, preferenza persistita — come PickUpNews |
| 4 | Test runner? | Sì, Vitest come devDependency per il calc layer |

## 3. IA target — il flusso del cockpit

**ANALYZE (home) → Compare (dentro Analyze) → PORTFOLIO → JOURNAL (flight log)**; settings da icona.

```text
/            Analyze: hero search ticker → verdict card (score, criteri, recommendation, provenance)
             tab "Single | Compare (≤6 aziende, Best in Class)" → tabella comparativa
             sotto: analisi recenti (max 10) come righe di servizio
/portfolio   stats + posizioni + gain/loss live + allocazione per settore
/journal     flight log: entry collegata all'analisi di origine ("analizzato X il … → comprato → esito")
settings     icona top-right (API key), non voce di menu
```

## 4. Value Score v2 — criteri e pesi (somma 100; gli N/A sono esclusi dal totale)

| Criterio | Soglia | Peso | Note |
|---|---|---|---|
| EPS > 0 | > 0 | 10 | |
| P/E | < 15 | 10 | N/A se EPS ≤ 0 |
| P/B | < 1.5 | 5 | N/A se BVPS mancante |
| P/S | < 3 | 5 | calcolato da marketCap API, non da sharesOutstanding |
| ROE | ≥ 15% | 10 | |
| ROE costante 10y | ≥ 10% in ognuno degli ultimi 10 anni | 10 | dal trend FMP (decisione 2) |
| Net margin | ≥ 10% | 5 | |
| D/E | < 0.5 | 10 | N/A se equity ≤ 0: un dato mancante non deve mai passare il test |
| Current ratio | ≥ 1.5 | 5 | |
| Graham Number | prezzo < √(22.5 · EPS · BVPS) | 10 | |
| NCAV net-net | prezzo < ⅔ · (currentAssets − totalLiabilities) / share | 10 | |
| Margin of safety vs DCF | prezzo < 70% del DCF FMP (`profile.dcf`) | 10 | zero endpoint extra |

Ogni criterio: `{ status: 'pass' | 'fail' | 'na', value, benchmark, weight }`.

## 5. Epic e PR

### Epic A — Domain layer: calcoli corretti e auditabili → **PR1**

- **Issue**: ratio null-safe (`number | null`, mai zeri fittizi) + fix bug + Value Score v2 + trend + test.
- **File**: `src/utils/financial-calculations.ts`, `src/types/index.ts`, nuovo `src/utils/__tests__/financial-calculations.test.ts`, `package.json` (Vitest + script `test`).
- **Bug da fixare** (riferimenti verificati):
  - `quickRatio` usa un arbitrario 30% delle attività correnti come "inventario" (`financial-calculations.ts:23-24`) → usa il campo `inventory` reale (da aggiungere al form) o rimuovi il ratio.
  - `debtToEquity` = 0 se equity mancante, e il criterio `D/E < 0.5` passa (`financial-calculations.ts:21` e `:71`) → N/A.
  - `pe` negativo con EPS negativo, mostrato come valore valido (`financial-calculations.ts:11` e criterio `:43`) → N/A se EPS ≤ 0.
  - `ps` dipende da `sharesOutstanding` che spesso manca (`fmp.ts:87`) → marketCap da `quote.marketCap || profile.mktCap` (`financial-calculations.ts:13`).
  - `formatCurrency` formatta in EUR su dati in valuta del titolo (`financial-calculations.ts:136-138`) → valuta coerente e dichiarata.
- **Nuovo**: `CompanyFinancials += { dcf?, inventory? }`, nuovo tipo `HistoricalMetrics[]` (date, eps, roe, revenue, netIncome, dividendPerShare, bookValuePerShare per anno), `ValueInvestingScore.criteria += status`, calcolo trend (EPS CAGR, ROE per anno, costanza ROE).
- **AC**: `npm test`, `npm run lint`, `npm run build` verdi; i test coprono null/zero/negativi per ogni ratio; i pesi sommano 100; N/A esclusi dal totale.

### Epic B — Data layer FMP robusto → **PR2**

- **Issue**: aggregatore tollerante + fallback per campo + provenance + history 10y + error taxonomy + localStorage versionata + cache quote.
- **File**: `src/services/fmp.ts`, `src/services/api.ts`, `src/services/types.ts`, `src/store.ts`.
- **Cosa**:
  - Check all-or-nothing (`fmp.ts:48`) → per-endpoint try/catch; errore solo se ticker proprio inesistente (profile/quote vuoti).
  - `limit=1` (`fmp.ts:16,19,22`) → history con `limit=10` su income-statement e key-metrics; balance-sheet resta `limit=1`.
  - Fallback per campo: `longTermDebt || totalDebt` (`fmp.ts:76`), `epsdiluted || eps` (`fmp.ts:81`), shares da `quote.sharesOutstanding || income.weightedAverageShsOutDil` (`fmp.ts:87`), marketCap da `quote.marketCap || profile.mktCap`, dividendo da key-metrics o `profile.lastDiv`, book value da key-metrics o equity/shares.
  - **Provenance** per campo (`api` / `derived` / `manual`), esposta come badge in UI: ogni numero deve essere risalibile.
  - Error taxonomy (`api.ts:36-42`): 401/403 key invalida, 429 quota/rate limit, array vuoto = ticker inesistente, network/offline.
  - localStorage versionata `fa:v1:*` con migrazione da `com.faber04.finance-analyzer-storage` (`store.ts:168`).
  - Cache in-memory ~60s sulle quote in `getBulkQuotes` (`fmp.ts:98`) per non bruciare rate limit.
- **AC**: auto-fill con un endpoint mancante mostra badge "derived/missing" invece di fallire; ogni endpoint storico torna fino a 10 record; migrazione preserva portfolio/journal/recenti.

### Epic C — IA / routing (il "senso logico") → **PR3**

- **File**: `src/App.tsx`, `src/components/Navigation.tsx`, `src/pages/*`, `src/components/modules/screener/*`.
- **Issue**: home = Analyze; screener = Compare mode dentro Analyze; nav a 3 voci; settings da icona; stats portfolio dentro Portfolio; journal come flight log.
- **Cosa**:
  - Route (`App.tsx:17-22`): `/` = Analyze, `/portfolio`, `/journal`, `/settings` raggiungibile solo da icona.
  - Nav (`Navigation.tsx:9-16`): 3 voci primarie (Analyze · Portfolio · Journal) + selettore lingua + icona settings.
  - Screener → tab "Single | Compare (≤6)" dentro Analyze, riuso di `ScreenerInput`/`ScreenerComparisonTable`, Best in Class resta; `ScreenerPage` esce dalle route.
  - Statistiche portfolio (valore, gain/loss, conteggi) spostate da `DashboardPage` dentro `PortfolioPage`; `DashboardPage` rimpiazzata da Analyze home (hero search + recenti).
  - Journal flight-log: entry collegata alla recente analisi per symbol (`analyzedAt` → buy/sell → outcome).
- **AC**: entering the app, in 5 secondi è chiaro il gesto principale (cercare un ticker); giro end-to-end senza inciampare.

### Epic D — i18n IT/EN → **PR4**

- **File**: nuovi `src/i18n/it.ts`, `src/i18n/en.ts`, context/hook custom, selettore in nav, persistenza `fa:v1:lang`.
- **Issue**: estrarre tutte le stringhe UI dai componenti (oggi hardcoded IT) nei dizionari; default EN; nessuna stringa mista residua.
- **AC**: grep del codebase senza testi UI hardcoded nei componenti; switch IT/EN persiste al reload.

### Epic E — Stati e UX → **PR5, PR6**

- **PR5 — Stati**: empty states con CTA (portfolio vuoto, journal vuoto, nessuna analisi recente); skeleton durante l'auto-fill API; error states distinti (key invalida / ticker inesistente / quota / offline) con retry (`api.ts:36-42`).
- **PR6 — Verdict card + brand**: anello score 0-100, checklist criteri pass/fail/N/A con valore vs benchmark, badge recommendation, badge provenance, sparkline trend 10y (recharts), "as of reportDate" + warning se dati > 12 mesi; poi brand token navy/teal/ambra come ultimo strato.
- **AC**: i 3 stati (empty/error/loading) sono visivamente distinti per le 3 interazioni principali (cerca/analizza, auto-fill, refresh prezzi).

## 6. Sequenza e convenzioni

**PR1 → PR2 → PR3 → PR4 → PR5 → PR6.**

- Ogni PR: branch `vibe/<slug>-550a39`, draft PR, `npm test` + `npm run lint` + `npm run build` verdi.
- Commit in stile conventional (`feat:`, `fix:`, `docs:`, `chore:`), come da storico del repo.
- DoD incrementale: la checklist in sezione 8 deve essere verde a fine PR6.

## 7. Rischi

- FMP free plan: verificare che `limit=10` sugli statement sia permesso dalla key; fallback `limit=5` o endpoint `ratios` storico.
- La API key viaggia in query string (richiesto da FMP): mai loggarla; `.env` mai committato.
- i18n custom senza librerie: più estrazione manuale delle stringhe, ma zero dipendenze — coerente con le regole del repo. Unica nuova dipendenza approvata: Vitest (dev).

## 8. Definition of done (dal brief §7, estesa)

- [ ] In 5 secondi dall'apertura è chiaro il gesto principale (cercare un ticker)
- [ ] Nav a 3 voci che racconta il ciclo (analyze / track / reflect)
- [ ] Screener come modalità di Analyze, Best in Class incluso
- [ ] Statistiche portfolio dentro Portfolio, non in home
- [ ] UI i18n IT/EN coerente (default EN), zero testi misti
- [ ] Empty/error/loading states sistemati per le 3 interazioni principali
- [ ] Giro end-to-end: cerco → analizzo → confronto 2 aziende → aggiungo posizione → scrivo la thesis
- [ ] Value Score v2: N/A gestiti, pesi somma 100, test unitari verdi

## 9. Post-riordino (promozione del case study n.3 — fuori dallo scope di queste PR)

README EN con posizionamento "cockpit" → screenshot reale (dati censurati) per la card del sito (tema v6, non ancora caricato) → voce Projects su LinkedIn → post.
