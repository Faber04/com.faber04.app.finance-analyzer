# 💰 Finance Analyzer

Una webapp professionale per analizzare investimenti, capire i bilanci delle aziende e applicare i principi di Value Investing di Benjamin Graham e Warren Buffett.

**🚀 Live Demo**: [https://www.faber04.com/app/finance-analyzer/](https://www.faber04.com/app/finance-analyzer/)

## 🎯 Caratteristiche Implementate

### ✅ Analisi Fondamentale Automatica
- **Auto-Fill via API**: Inserisci il simbolo e l'app recupera automaticamente gli ultimi 5 anni di bilanci da Financial Modeling Prep (FMP).
- **Calcolo Ratio**: P/E, P/B, PS, ROE, ROA, Debt/Equity, Current Ratio.
- **Value Score**: Sistema di scoring (0-100) basato sui criteri Graham/Buffett con raccomandazione finale.

### ✅ Portfolio Tracker
- **Gestione Posizioni**: Aggiungi e monitora le tue posizioni azionarie.
- **Performance Real-time**: Calcolo automatico di gain/loss (euro e %) grazie al refresh dei prezzi via API.
- **Visualizzazione Dati**: Grafico a torta per l'allocazione settoriale e grafico a barre per la performance delle singole posizioni.

### ✅ Investment Journal
- **Diario Decisionale**: Documenta la tua thesis prima dell'acquisto.
- **Tag System**: Organizza le tue note per categorie.
- **Retrospettiva**: Analizza l'esito dei tuoi investimenti e le lezioni apprese.

### ✅ Dashboard & Visualizzazioni
- **Overview Statistiche**: Visualizzazione immediata di valore totale, gain/loss e note.
- **Charts**: Grafici interattivi con Recharts per una migliore comprensione del rischio e del rendimento.

## 🚀 Quick Start

### Prerequisiti
- Node.js (versione 18 o superiore)
- npm o yarn

### Installazione Locale

```bash
# 1. Clona/scarica il progetto
git clone https://github.com/Faber04/finance-analyzer.git
cd finance-analyzer

# 2. Installa le dipendenze
npm install

# 3. Configura le variabili di ambiente
echo "VITE_FMP_API_KEY=tua_api_key_qui" > .env.local

# 4. Avvia il server di sviluppo
npm run dev
```

## 📁 Struttura del Progetto

```
finance-analyzer/
├── src/
│   ├── components/
│   │   ├── common/              # Componenti UI (Card, Button, Input)
│   │   ├── charts/              # Componenti grafici (Recharts)
│   │   ├── modules/
│   │   │   ├── fundamental-analysis/  # Modulo analisi
│   │   │   ├── portfolio/            # Modulo gestione asset
│   │   │   └── journal/              # Modulo diario investimenti
│   │   └── Navigation.tsx
│   ├── services/                # Integrazione API (FMP Stable)
│   ├── pages/                   # Pagine principali (Dashboard, Analysis, etc.)
│   ├── types/                   # TypeScript definitions
│   ├── utils/                   # Calcoli finanziari e utility
│   ├── store.ts                 # Zustand store (Persistence inclusa)
│   ├── App.tsx
│   └── main.tsx
├── finance-analyzer-docs/       # Documentazione tecnica e log
├── package.json
└── vite.config.ts
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
- **Zustand**: State management (con persistence locale)
- **Tailwind CSS**: Styling moderno e responsivo
- **Recharts**: Visualizzazioni dati dinamiche
- **Lucide React**: Icone
- **Financial Modeling Prep (FMP)**: API provider per dati finanziari real-time

## ⚠️ Disclaimer

**Questa app è solo per scopi educativi.** Non costituisce consulenza finanziaria. I dati forniti potrebbero non essere accurati al 100%. Consulta sempre un professionista prima di investire il tuo denaro.

## 📝 License

MIT - Libero utilizzo per scopi educativi.

---

**Sviluppato da @Faber04** 📈
 "Warren Buffett e l'interpretazione dei bilanci" - Mary Buffett
- 📙 "Guida completa all'analisi tecnica dei mercati finanziari"

## 📝 License

MIT - Usa liberamente per scopi personali ed educativi

---

**Buon investing! 📈**
