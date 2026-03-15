# 🤖 Instructions for AI Agent (Claude) - Finance Analyzer Project

Questo file contiene le istruzioni specifiche per l'AI Agent che lavora su questo progetto tra sessioni diverse.

---

## 🎯 Obiettivo del Progetto

Sviluppare progressivamente una webapp di analisi finanziaria per investimenti Value Investing.

**Utente**: Developer Senior JS/TS, Junior React, Neofita investimenti.

---

## 📚 File da Leggere SEMPRE all'Inizio di Ogni Sessione

### Ordine di Lettura Obbligatorio:

1. **`PROJECT_STATE.md`** (5 min)
   - Stato corrente del progetto
   - Cosa è completato, cosa manca
   - Priorità immediate
   - Note per la prossima sessione

2. **`DEVELOPMENT_LOG.md`** (3 min)
   - Log storico implementazioni
   - Decisioni tecniche prese
   - Pattern stabiliti
   - Cosa evitare

3. **`ERROR_LOG.md`** (2 min)
   - Errori già risolti
   - Soluzioni testate
   - Pattern di prevenzione

4. **`README.md` del progetto** (2 min)
   - Documentazione generale
   - Come avviare il progetto
   - Struttura base

**Tempo totale lettura**: ~12 minuti

---

## ✅ Workflow Standard per Ogni Task

### Fase 1: Comprensione (OBBLIGATORIA)
```
1. Leggi i 4 file sopra
2. Identifica cosa devi implementare
3. Verifica in PROJECT_STATE.md lo stato attuale
4. Cerca in ERROR_LOG.md se ci sono errori noti simili
5. Controlla in DEVELOPMENT_LOG.md pattern già usati
```

### Fase 2: Pianificazione
```
1. Elenca file da creare/modificare
2. Identifica dependencies (quali componenti/funzioni servono)
3. Verifica che types esistenti siano sufficienti
4. Pianifica testing manuale
```

### Fase 3: Implementazione
```
1. Segui i pattern esistenti (vedi esempi sotto)
2. Usa TypeScript strict mode
3. Usa componenti comuni quando possibile
4. Commenta codice complesso
5. Mantieni stile consistente (vedi CODE_STYLE sotto)
```

### Fase 4: Testing
```
1. Verifica che compila (TypeScript errors?)
2. Testa manualmente nel browser
3. Verifica responsive (mobile view)
4. Controlla console per warning/errors
```

### Fase 5: Documentazione (OBBLIGATORIA)
```
1. Aggiorna PROJECT_STATE.md:
   - Spunta checkbox completati
   - Aggiungi nuovi componenti creati
   - Aggiorna percentuali completamento
   - Scrivi note per prossima sessione

2. Aggiungi entry in DEVELOPMENT_LOG.md:
   - Data e sessione
   - Cosa implementato (dettagli)
   - Decisioni tecniche
   - File creati/modificati

3. Se hai incontrato errori, documenta in ERROR_LOG.md:
   - ID univoco (ERROR-XXX)
   - Problema, causa, soluzione
   - Pattern per prevenzione

4. Aggiorna README.md se necessario:
   - Nuove features
   - Nuovi comandi
   - Nuove dipendenze

5. Pubblicazione e Versioning (FINE PRIORITY):
   - Al termine di un intero blocco "Priority", effettua la build dell'app.
   - Pubblica i file via FTP sul server di produzione (usa credenziali note).
   - Effettua sempre il commit e push sul branch `main`.
```

---

## 🎨 CODE_STYLE - Pattern da Seguire

### Pattern Component React Standard

```typescript
import React, { useState } from 'react';
import { Card, Button, Input } from '@/components/common';
import { useAppStore } from '@/store';
import { TipoNecessario } from '@/types';

interface ComponentProps {
  prop1: string;
  prop2?: number;
}

export const NomeComponent: React.FC<ComponentProps> = ({ prop1, prop2 }) => {
  // 1. Store hooks
  const { action1, action2 } = useAppStore();
  
  // 2. Local state
  const [localState, setLocalState] = useState('');
  
  // 3. Handlers
  const handleSubmit = () => {
    // Validazione
    if (!localState) return;
    
    // Action
    action1(localState);
  };
  
  // 4. Render
  return (
    <Card title="Titolo" subtitle="Sottotitolo opzionale">
      <div className="space-y-4">
        <Input
          label="Label"
          value={localState}
          onChange={(e) => setLocalState(e.target.value)}
        />
        <div className="flex justify-end">
          <Button onClick={handleSubmit}>Invia</Button>
        </div>
      </div>
    </Card>
  );
};
```

### Pattern Store Action

```typescript
// In store.ts
addNuovaAction: (data: TipoInput) => {
  const id = `prefix_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  set((state) => ({
    nuovoArray: [...state.nuovoArray, { ...data, id }],
  }));
},
```

### Pattern Type Definition

```typescript
// In types/index.ts
export interface NuovoType {
  id: string;
  requiredField: string;
  optionalField?: number;
  date: string; // ISO format
}
```

### Naming Conventions

- **Components**: PascalCase (`PortfolioList.tsx`)
- **Functions**: camelCase (`calculateTotal()`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_POSITIONS`)
- **Files**: kebab-case (`financial-calculations.ts`) o PascalCase per componenti
- **CSS Classes**: Tailwind utilities

### Import Order

```typescript
// 1. React & libraries
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// 2. Internal absolute imports
import { Card } from '@/components/common';
import { useAppStore } from '@/store';
import { Type1, Type2 } from '@/types';

// 3. Relative imports
import { helperFunction } from './helpers';

// 4. Assets/Styles (se necessario)
import './styles.css';
```

---

## 🚫 Cosa NON Fare

### ❌ NON Modificare Senza Motivo:
- Store structure (è già ottimizzato)
- Types esistenti (estendi invece di modificare)
- Componenti common (funzionano già bene)
- Pattern di routing (è standard React Router)

### ❌ NON Usare:
- Class components (solo functional)
- Redux (abbiamo Zustand)
- CSS custom files (usa Tailwind)
- Any type in TypeScript
- console.log in produzione (usa in dev, rimuovi dopo)

### ❌ NON Creare:
- Duplicati di componenti esistenti
- Utility functions se esistono già simili
- Nuovi pattern senza documentarli

---

## ✅ Cosa Fare SEMPRE

### ✅ DO Use:
- TypeScript strict types
- Tailwind per styling
- Componenti common esistenti
- Store Zustand per state globale
- React hooks (useState, useEffect, useMemo, useCallback)

### ✅ DO Check:
- TypeScript compila senza errori
- No warning in console
- Responsive design (mobile + desktop)
- Accessibilità base (labels, aria-labels dove serve)

### ✅ DO Document:
- Commenti per logica complessa
- JSDoc per funzioni utility complesse
- Aggiornare PROJECT_STATE.md
- Aggiungere entry in DEVELOPMENT_LOG.md

---

## 🎯 Priority System

Quando l'utente chiede "continua" o "prosegui", usa questo ordine:

### Priority 1: Portfolio Module
1. Creare `src/components/modules/portfolio/PortfolioList.tsx`
2. Creare `src/components/modules/portfolio/AddPositionForm.tsx`
3. Creare `src/components/modules/portfolio/PositionCard.tsx`
4. Aggiornare `src/pages/PortfolioPage.tsx`
5. Aggiungere chart allocazione settori

### Priority 2: Journal Module
1. Creare componenti journal
2. Implementare form entry
3. Aggiungere filtri e search

### Priority 3: API Integration
1. Servizio API base
2. Integrazione Alpha Vantage
3. Cache e error handling

---

## 🔍 Checklist Prima di Dire "Completato"

Prima di dichiarare un task completato, verifica:

- [ ] Codice compila senza errori TypeScript
- [ ] Componente renderizza correttamente
- [ ] Funziona su mobile (responsive)
- [ ] Store state si aggiorna correttamente
- [ ] No warning in console browser
- [ ] PROJECT_STATE.md aggiornato
- [ ] DEVELOPMENT_LOG.md aggiornato
- [ ] Se ci sono stati errori, ERROR_LOG.md aggiornato
- [ ] Codice segue i pattern stabiliti
- [ ] Import sono puliti e ordinati

---

## 🎓 Context per l'Agent

### Livello Utente:
- **JavaScript/TypeScript**: Senior (usa pattern avanzati)
- **React**: Junior (spiega concetti, usa pattern semplici)
- **Finanza**: Neofita (spiega cosa fanno i calcoli)

### Tone:
- Professionale ma friendly
- Spiega decisioni tecniche
- Non dare per scontate conoscenze React avanzate
- Spiega termini finanziari

### Communication:
- Sii conciso ma completo
- Evidenzia cosa hai fatto
- Specifica cosa manca
- Suggerisci next steps

---

## 📝 Template Comunicazione con Utente

**All'inizio della sessione:**
```
Ho letto i file di stato del progetto:
- PROJECT_STATE.md: [breve summary]
- Ultima sessione: [data]
- Stato attuale: [percentuale completamento]

Cosa vuoi implementare oggi?
```

**Durante implementazione:**
```
✅ Ho creato/modificato:
- File 1: [descrizione]
- File 2: [descrizione]

🔧 Ho implementato:
- Feature X
- Feature Y

📝 Aggiornato:
- PROJECT_STATE.md
- DEVELOPMENT_LOG.md

🎯 Prossimi passi suggeriti:
- Step 1
- Step 2
```

**Quando incontri un errore:**
```
🐛 Ho incontrato un errore:
- Problema: [descrizione]
- Causa: [analisi]
- Soluzione applicata: [fix]
- Documentato in ERROR_LOG.md come ERROR-XXX

✅ Ora funziona correttamente.
```

---

## 🚀 Quick Reference

### Comandi Utili
```bash
npm install          # Prima volta
npm run dev          # Sviluppo
npm run build        # Build produzione
npm run preview      # Preview build
```

### File Path Alias
```typescript
@/components/*       // src/components/*
@/types/*           // src/types/*
@/utils/*           // src/utils/*
@/store             // src/store.ts
```

### Store Actions Disponibili
```typescript
// Analisi
setAnalysis(data)
clearAnalysis()

// Portfolio
addPosition(position)
updatePosition(id, updates)
removePosition(id)
updatePortfolioPrice(symbol, price)

// Journal
addJournalEntry(entry)
updateJournalEntry(id, updates)
removeJournalEntry(id)

// UI
setLoading(bool)
setError(string)
```

---

## 🎯 Obiettivi per Ogni Sessione

**Minimo**:
- Implementare almeno 1 componente funzionante
- Aggiornare documentazione
- Zero errori TypeScript

**Ideale**:
- Completare 1 modulo intero
- Aggiungere tests manuali
- Documentare decisioni

**Eccellente**:
- Completare feature + UI polish
- Aggiungere edge cases handling
- Suggerire miglioramenti

---

## 📞 Quando Chiedere Chiarimenti

Chiedi all'utente quando:
- Ci sono più modi per implementare qualcosa
- Serve una decisione di design/UX
- Pattern esistente non è chiaro
- Specifiche ambigue

NON chiedere per:
- Decisioni tecniche standard (usa i pattern)
- Styling (usa Tailwind come altri componenti)
- Struttura file (segui quella esistente)

---

**Fine istruzioni agent**

Questo file è la tua guida principale. Segui queste regole e il progetto procederà in modo pulito e organizzato attraverso le sessioni.
