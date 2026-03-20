# 🐛 Error Log - Finance Analyzer

Questo file documenta tutti gli errori incontrati durante lo sviluppo, le loro soluzioni e come prevenirli in futuro.

**Formato**: Ogni errore ha un ID univoco per riferimento facile.

---

## 📋 Indice Errori

| ID | Tipo | Descrizione Breve | Status |
|----|------|-------------------|--------|
| ERROR-001 | API | FMP Legacy Endpoint (403 Forbidden) | ✅ Risolto |

---

## Template Errore

```markdown
## 🔴 ERROR-[ID] - [Titolo Breve]

**Data**: [YYYY-MM-DD]
**Sessione**: [N]
**Severità**: 🔴 Critico / 🟡 Warning / 🟢 Minore
**Status**: ❌ Non risolto / ✅ Risolto / 🚧 In corso

### 📝 Descrizione

[Descrizione dettagliata del problema]

### 🔍 Come si Manifesta

**Sintomi:**
- [Lista sintomi visibili]

**Condizioni:**
- [Quando/dove si verifica]
- [Steps per riprodurre]

### 💻 Stack Trace / Messaggio Errore

```
[Copia esatta del messaggio di errore]
```

### 🕵️ Root Cause

**Causa principale:**
[Analisi della causa root]

**Cause secondarie:**
- [Se applicabile]

### ✅ Soluzione

**Fix applicato:**
[Descrizione della soluzione]

**File modificati:**
- `path/to/file.ts` - [Cosa cambiato]

**Codice prima:**
```typescript
// Codice che causava l'errore
```

**Codice dopo:**
```typescript
// Codice corretto
```

### 🛡️ Prevenzione Futura

**Come evitare questo errore:**
1. [Step 1]
2. [Step 2]

**Pattern da seguire:**
[Best practice da usare]

**Checklist per l'Agent:**
- [ ] Verificare [cosa]
- [ ] Controllare [cosa]

### 🔗 Errori Correlati

- ERROR-[X] - [Relazione]

### 📚 Risorse

- [Link a documentazione]
- [Link a discussion]

---
```

## 📊 Statistiche

**Totale errori registrati**: 0
**Errori risolti**: 0
**Errori aperti**: 0
**Errori critici**: 0

---

## 🔴 ERROR-001 - FMP Legacy Endpoint (403 Forbidden)

**Data**: 2026-03-20
**Sessione**: 5
**Severità**: 🔴 Critico
**Status**: ✅ Risolto

### 📝 Descrizione

Le chiamate alle API di Financial Modeling Prep (FMP) fallivano con errore HTTP 403 Forbidden e un messaggio indicante che l'endpoint utilizzato era "Legacy" e non più supportato per i nuovi account (creati dopo il 31 agosto 2025).

### 🔍 Come si Manifesta

**Sintomi:**
- Cliccando su "Auto-Fill" nella pagina Analisi, i campi non venivano popolati.
- Messaggio di errore: `Legacy Endpoint : Due to Legacy endpoints being no longer supported...`

**Condizioni:**
- Qualsiasi chiamata agli endpoint `/v3/` usando path parameters per il simbolo (es. `/v3/profile/AAPL`).

### 💻 Stack Trace / Messaggio Errore

```json
{
    "Error Message": "Legacy Endpoint : Due to Legacy endpoints being no longer supported - This endpoint is only available for legacy users who have valid subscriptions prior August 31, 2025. Please visit our documentation page https://site.financialmodelingprep.com/developer/docs for our current APIs. "
}
```

### 🕵️ Root Cause

**Causa principale:**
FMP ha rimosso il supporto per gli endpoint basati su path parameter (`/api/v3/endpoint/SYMBOL`) per tutti i nuovi utenti, obbligando l'uso della versione `/stable/` con query parameters (`/stable/endpoint?symbol=SYMBOL`).

### ✅ Soluzione

**Fix applicato:**
1. Migrazione della `BASE_URL` in `api.ts` a `https://financialmodelingprep.com/stable`.
2. Aggiornamento di tutti i fetcher in `fmp.ts` per utilizzare il parametro di ricerca `?symbol=`.

**File modificati:**
- `src/services/api.ts` - Aggiornata BASE_URL.
- `src/services/fmp.ts` - Aggiornati path degli endpoint.

### 🛡️ Prevenzione Futura

**Come evitare questo errore:**
1. Consultare sempre la documentazione "Stable" delle API di terze parti.
2. Monitorare i messaggi di deprecazione nei log delle API.

**Checklist per l'Agent:**
- [x] Verificare se l'endpoint è stabile o legacy.
- [x] Controllare le comunicazioni dei provider API.

---

## 📊 Statistiche

**Totale errori registrati**: 1
**Errori risolti**: 1
**Errori aperti**: 0
**Errori critici**: 1

---

## 🎓 Lezioni Apprese

Le API di Financial Modeling Prep hanno una politica di deprecazione aggressiva per i nuovi account. Gli endpoint `/v3/` documentati in molti tutorial sono ora considerati Legacy. Usare sempre `/stable/` per garantire compatibilità.

---


## 📝 Note

- Mantieni questo file aggiornato ad ogni errore
- Non eliminare errori vecchi, sono documentazione preziosa
- Usa Ctrl+F per cercare errori simili
- L'Agent dovrebbe sempre consultare questo file prima di debuggare

---

**Ultimo aggiornamento**: 2026-03-05
**Prossimo review**: Dopo prossima implementazione significativa
