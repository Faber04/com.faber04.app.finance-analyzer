# 💰 Finance Analyzer

Una webapp professionale per analizzare investimenti, capire i bilanci delle aziende e applicare i principi di Value Investing di Benjamin Graham e Warren Buffett.

**🚀 Live Demo**: [https://www.faber04.com/app/finance-analyzer/](https://www.faber04.com/app/finance-analyzer/)  
**Versione Corrente**: `v0.3.4` (HashRouter Fix)  
**Stato Progetto**: Applicazione completa, verificata e pubblicata online

## 🎯 Caratteristiche Implementate

### ✅ Analisi Fondamentale Automatica

- **Auto-Fill via API**: Inserisci il simbolo e l'app recupera automaticamente gli ultimi 5 anni di bilanci da Financial Modeling Prep (FMP).
- **Calcolo Ratio**: P/E, P/B, PS, ROE, ROA, Debt/Equity, Current Ratio.
- **Value Score**: Sistema di scoring (0-100) basato sui criteri Graham/Buffett con raccomandazione finale.
- **Reset Intelligente**: Il form si resetta automaticamente ad ogni nuovo accesso per garantire un'analisi pulita.

### ✅ Portfolio Tracker

- **Gestione Posizioni**: Aggiungi e monitora le tue posizioni azionarie.
- **Performance Real-time**: Calcolo automatico di gain/loss (euro e %) grazie al refresh dei prezzi via API.
- **Visualizzazione Dati**: Donut chart allocazione settoriale, grafico a barre gain/loss e grafici portfolio con Recharts.
- **Gestione Completa**: Creazione, modifica ed eliminazione posizioni con form validato e modal di edit.

### ✅ Investment Journal

- **Diario Decisionale**: Documenta la tua thesis prima dell'acquisto.
- **Tag System**: Organizza le tue note per categorie.
- **Filtri e Ricerca**: Ricerca per simbolo/nome e filtri per tipo/tag.
- **Retrospettiva**: Analizza l'esito dei tuoi investimenti e le lezioni apprese.

### ✅ Navigazione e Impostazioni

- **Menu Mobile**: Hamburger menu responsive per dispositivi mobili.
- **Routing Produzione**: HashRouter per compatibilita con hosting senza fallback server-side.
- **Settings Page**: Pagina dedicata alle impostazioni e alle integrazioni API.

### ✅ Dashboard & Analisi Recenti

- **Analisi Recenti**: Storico persistente (localStorage) delle ultime 10 aziende analizzate, con score e raccomandazione visibili subito in homepage.
- **Overview Statistiche**: Visualizzazione immediata di valore totale, gain/loss e note del portfolio.
- **Charts**: Grafici interattivi con Recharts per una migliore comprensione del rischio e del rendimento.

## 🚀 Quick Start

### Prerequisiti

- Node.js (versione 18 o superiore)
- npm o yarn

### Installazione Locale

```bash
# 1. Clona/scarica il progetto
git clone https://github.com/Faber04/com.faber04.finance-analyzer.git
cd com.faber04.finance-analyzer

# 2. Installa le dipendenze
npm install

# 3. Configura le variabili di ambiente
echo "VITE_FMP_API_KEY=tua_api_key_qui" > .env.local

# 4. Avvia il server di sviluppo
npm run dev
```

### Configurazione API Key
L'applicazione richiede una API Key di **Financial Modeling Prep**. Puoi configurarla in due modi:
1. **Nell'App**: Vai nella pagina **Impostazioni** e configura l'integrazione API (i dati vengono salvati nel browser).
2. **File Environment**: Crea un file `.env.local` nella cartella `finance-analyzer/` con: `VITE_FMP_API_KEY=tua_api_key`.

### Nota Routing in Produzione

L'app e pubblicata in sottocartella (`/app/finance-analyzer/`) e usa HashRouter. Le route in produzione hanno formato:
- `https://www.faber04.com/app/finance-analyzer/#/analysis`
- `https://www.faber04.com/app/finance-analyzer/#/portfolio`

## 📁 Struttura del Progetto

```text
src/
	components/
		common/                         # Card, Button, Input, componenti riutilizzabili
		modules/
			fundamental-analysis/         # Input dati, ratios, value score
			portfolio/                    # Lista posizioni, form, modal, allocazione
			journal/                      # Form entry, lista, filtri, card
		charts/                         # Grafici dashboard e portfolio (Recharts)
		Navigation.tsx                  # Navbar + menu mobile
	pages/
		DashboardPage.tsx
		AnalysisPage.tsx
		PortfolioPage.tsx
		JournalPage.tsx
		SettingsPage.tsx
	services/                         # API client + integrazione FMP
	store.ts                          # Zustand global state + persistence
	types/                            # TypeScript domain models
	utils/                            # Calcoli finanziari e formatter
```

## 🧮 Criteri di Valutazione (Scoring)

L'app analizza le aziende secondo i pesi definiti in `financial-calculations.ts`:

| Criterio | Benchmark | Peso |
|----------|-----------|------|
| P/E Ratio | < 15 | 15% |
| P/B Ratio | < 1.5 | 10% |
| ROE | ≥ 15% | 15% |
| Net Profit Margin | ≥ 10% | 10% |
| Debt/Equity | < 0.5 | 20% |
| Current Ratio | ≥ 1.5 | 15% |
| EPS Positivo | > 0 | 15% |

## 🛠️ Stack Tecnologico

- **React 18** + **TypeScript**
- **Vite**: Build tool e dev server
- **Zustand**: State management
- **Tailwind CSS**: Styling moderno e responsivo
- **Recharts**: Visualizzazioni dati
- **Lucide React**: Icone
- **Financial Modeling Prep (FMP)**: API provider

## 🗺️ Roadmap (Allineata a PROJECT_STATE)

- **0.4.0**: Screener multi-azienda + comparazione side-by-side.
- **0.5.0**: Export PDF (analisi e portfolio) + storico export.
- **0.6.0**: Dark mode + miglioramenti mobile + accessibilita base.
- **0.7.0**: PWA installabile + alert + centro notifiche.
- **0.8.0**: Backtesting MVP con metriche chiave.
- **1.0.0**: Stabilizzazione finale, test end-to-end e documentazione release.

## ⚠️ Disclaimer

**Questa app è solo per scopi educativi.** Non costituisce consulenza finanziaria. I dati forniti potrebbero non essere accurati al 100%. Consulta sempre un professionista prima di investire il tuo denaro.

## 📝 License

MIT - Libero utilizzo per scopi educativi e personali.

---

**Sviluppato da @Faber04** 📈
