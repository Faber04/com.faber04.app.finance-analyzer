# 🐛 Error Log - Finance Analyzer

Questo file documenta tutti gli errori incontrati durante lo sviluppo, le loro soluzioni e come prevenirli in futuro.

**Formato**: Ogni errore ha un ID univoco per riferimento facile.

---

## 📋 Indice Errori

| ID | Tipo | Descrizione Breve | Status |
|----|------|-------------------|--------|
| - | - | Nessun errore registrato | - |

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

## 🎯 Categorie Errori Comuni

### TypeScript Errors
[Nessuno registrato]

### Runtime Errors
[Nessuno registrato]

### Build Errors
[Nessuno registrato]

### Logic Errors (Bug)
[Nessuno registrato]

### Performance Issues
[Nessuno registrato]

### UI/UX Bugs
[Nessuno registrato]

---

## 🔍 Come Usare Questo File

### Per l'Agent:

**PRIMA di implementare qualcosa:**
1. Cerca in questo file se errori simili sono già stati incontrati
2. Leggi le soluzioni e pattern per evitare errori noti
3. Segui le checklist di prevenzione

**QUANDO incontri un errore:**
1. Crea un nuovo entry con ID progressivo (ERROR-001, ERROR-002, ecc.)
2. Documenta tutto: sintomi, causa, soluzione
3. Aggiungi alla checklist di prevenzione
4. Aggiorna l'indice in cima al file
5. Incrementa le statistiche

**FORMATO ID:**
- ERROR-XXX dove XXX è numero progressivo a 3 cifre
- Es: ERROR-001, ERROR-002, ..., ERROR-099, ERROR-100

### Per lo Sviluppatore:

**Prima di fare debug:**
1. Controlla se l'errore è già documentato qui
2. Segui la soluzione già testata
3. Se l'errore persiste, aggiorna il documento

**Dopo aver risolto un bug:**
1. Documenta nel formato sopra
2. Aggiungi note su come prevenirlo
3. Considera se serve un test automatico

---

## 🎓 Lezioni Apprese (Quando ci saranno errori)

Questa sezione conterrà pattern ricorrenti e lezioni generali dopo aver incontrato e risolto vari errori.

**Al momento**: Nessun errore incontrato, progetto pulito al primo tentativo! ✅

---

## 📝 Note

- Mantieni questo file aggiornato ad ogni errore
- Non eliminare errori vecchi, sono documentazione preziosa
- Usa Ctrl+F per cercare errori simili
- L'Agent dovrebbe sempre consultare questo file prima di debuggare

---

**Ultimo aggiornamento**: 2026-03-05
**Prossimo review**: Dopo prossima implementazione significativa
