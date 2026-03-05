# 💰 Finance Analyzer

Una webapp per aiutarti ad analizzare investimenti, capire i bilanci delle aziende e applicare i principi di Value Investing di Benjamin Graham e Warren Buffett.

## 🎯 Caratteristiche

### ✅ Implementato (MVP)
- **Analisi Fondamentale**: Inserisci i dati di bilancio e ottieni:
  - Calcolo automatico di tutti i ratio finanziari (P/E, P/B, ROE, ROA, Debt/Equity, etc.)
  - Score Value Investing basato sui criteri di Graham e Buffett
  - Raccomandazione automatica (Strong Buy, Buy, Hold, Avoid)
  - Indicatori visivi per ogni metrica

- **Dashboard**: Panoramica generale con statistiche e suggerimenti

### 🚧 In Arrivo
- **Portfolio Tracker**: Gestione posizioni e calcolo performance
- **Investment Journal**: Documenta thesis e retrospettive
- **Integrazione API**: Dati in tempo reale (Alpha Vantage, Yahoo Finance)
- **Grafici e Visualizzazioni**: Chart storici e comparazioni
- **Export Reports**: PDF dei tuoi report di analisi

## 🚀 Quick Start

### Prerequisiti
- Node.js (versione 18 o superiore)
- npm o yarn

### Installazione

```bash
# 1. Clona/scarica il progetto
cd finance-analyzer

# 2. Installa le dipendenze
npm install

# 3. Avvia il server di sviluppo
npm run dev

# 4. Apri il browser su http://localhost:5173
```

### Build per Produzione

```bash
# Build ottimizzato
npm run build

# Preview della build
npm run preview
```

## 📁 Struttura del Progetto

```
finance-analyzer/
├── src/
│   ├── components/
│   │   ├── common/              # Componenti riutilizzabili (Card, Button, Input)
│   │   ├── modules/
│   │   │   ├── fundamental-analysis/  # Modulo analisi fondamentale
│   │   │   ├── portfolio/            # [TODO] Modulo portfolio
│   │   │   └── journal/              # [TODO] Modulo journal
│   │   └── Navigation.tsx
│   ├── pages/                   # Pagine dell'app
│   ├── types/                   # TypeScript types
│   ├── utils/                   # Utility e calcoli finanziari
│   ├── store.ts                 # Zustand store
│   ├── App.tsx
│   └── main.tsx
├── package.json
├── vite.config.ts
├── tailwind.config.js
└── tsconfig.json
```

## 📚 Come Usare l'App

### 1. Analisi Fondamentale

1. Vai su **"Analisi Fondamentale"**
2. Inserisci i dati dall'ultimo bilancio dell'azienda:
   - **Simbolo** e **Nome azienda** (obbligatori)
   - **Dati di Conto Economico**: Revenue, Net Income
   - **Stato Patrimoniale**: Assets, Liabilities, Equity, Debt
   - **Dati per Azione**: EPS, Book Value
   - **Prezzo Corrente** e **Azioni in Circolazione**
3. Clicca **"Analizza"**
4. Ricevi:
   - Tutti i ratio calcolati
   - Score su 100 punti
   - Raccomandazione di investimento
   - Note e alert specifici

### Dove Trovare i Dati?

#### Fonti Gratuite:
- **Yahoo Finance** (finance.yahoo.com): Cerca il simbolo → Statistics & Financials
- **Google Finance** (google.com/finance)
- **EDGAR** (sec.gov) per aziende USA: 10-K e 10-Q reports
- **Sito dell'azienda**: Sezione Investor Relations

#### Dati Chiave da Cercare:
- **Income Statement**: Revenue, Net Income, EPS
- **Balance Sheet**: Total Assets, Total Liabilities, Shareholders' Equity, Long-term Debt
- **Cash Flow**: Operating Cash Flow (per future implementazioni)

## 🧮 Criteri di Valutazione

L'app analizza le aziende secondo questi criteri (da Graham/Buffett):

| Criterio | Benchmark | Peso |
|----------|-----------|------|
| P/E Ratio | < 15 | 15% |
| P/B Ratio | < 1.5 | 10% |
| ROE | ≥ 15% | 15% |
| Net Profit Margin | ≥ 10% | 10% |
| Debt/Equity | < 0.5 | 20% |
| Current Ratio | ≥ 1.5 | 15% |
| EPS Positivo | > 0 | 15% |

**Score:**
- 80-100: Strong Buy 🚀
- 60-79: Buy 👍
- 40-59: Hold ⏸️
- 0-39: Avoid ⚠️

## 🛠️ Stack Tecnologico

- **React 18** + **TypeScript**: UI moderna e type-safe
- **Vite**: Build tool velocissimo
- **Zustand**: State management semplice ed efficace
- **Tailwind CSS**: Styling utility-first
- **React Router**: Navigazione SPA
- **Lucide React**: Icone moderne
- **Recharts**: Grafici (per future implementazioni)

## 🔜 Roadmap

### Fase 2 - Portfolio & Journal
- [ ] CRUD completo per posizioni in portfolio
- [ ] Calcolo automatico di gain/loss per posizione
- [ ] Allocazione per settore/asset class
- [ ] Journal con template per thesis
- [ ] Tag e ricerca nelle note

### Fase 3 - Integrazione Dati
- [ ] Connessione API per dati in tempo reale
- [ ] Aggiornamento automatico prezzi
- [ ] Storico prezzi e grafici
- [ ] News correlate alle aziende

### Fase 4 - Features Avanzate
- [ ] Screener multi-azienda
- [ ] Comparazioni side-by-side
- [ ] Alert su prezzi target
- [ ] Export report PDF
- [ ] Modalità scura

## 💡 Tips per Sviluppatori

### Aggiungere una Nuova Metrica

1. Aggiungi il campo in `types/index.ts`
2. Implementa il calcolo in `utils/financial-calculations.ts`
3. Aggiorna `RatiosDisplay.tsx` per visualizzarla
4. Opzionale: aggiungi al criterio di valutazione in `analyzeValueInvesting()`

### Aggiungere un Nuovo Modulo

1. Crea la cartella in `components/modules/nome-modulo/`
2. Crea i componenti necessari
3. Aggiungi la route in `App.tsx`
4. Aggiungi il link in `Navigation.tsx`
5. Estendi lo store in `store.ts` se serve stato globale

### Testing con Dati Mock

Puoi creare dati di esempio in `src/utils/mock-data.ts`:

```typescript
export const mockCompany: CompanyFinancials = {
  symbol: 'TEST',
  companyName: 'Test Company Inc.',
  revenue: 1000,
  netIncome: 150,
  // ... altri campi
};
```

## 🤝 Contribuire

Questo è un progetto personale per apprendimento, ma sentiti libero di:
- Forkare e modificare per le tue esigenze
- Suggerire miglioramenti
- Segnalare bug

## ⚠️ Disclaimer

**Questa app è solo per scopi educativi e di apprendimento.**

- Non costituisce consulenza finanziaria
- I calcoli sono semplificati
- Fai sempre le tue ricerche approfondite
- Consulta un professionista per decisioni di investimento

## 📖 Risorse di Apprendimento

Libri che hanno ispirato questo progetto:
- 📘 "L'investitore intelligente" - Benjamin Graham
- 📗 "Warren Buffett e l'interpretazione dei bilanci" - Mary Buffett
- 📙 "Guida completa all'analisi tecnica dei mercati finanziari"

## 📝 License

MIT - Usa liberamente per scopi personali ed educativi

---

**Buon investing! 📈**
