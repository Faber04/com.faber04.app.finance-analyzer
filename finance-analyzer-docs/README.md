# 📚 Finance Analyzer - Sistema di Documentazione e Continuità

Questo sistema permette all'AI Agent (Claude) di lavorare sul progetto attraverso sessioni multiple mantenendo piena continuità e memoria del lavoro svolto.

---

## 🎯 Obiettivo

Garantire che l'Agent:
1. **Sappia sempre dove si trova** il progetto
2. **Non ripeta errori** già risolti
3. **Mantenga consistenza** nel codice
4. **Documenti progressi** per riferimento futuro
5. **Possa essere sostituito** da altro agent o developer senza perdere contesto

---

## 📁 Struttura File di Documentazione

```
finance-analyzer-docs/
├── AGENT_INSTRUCTIONS.md      # 🤖 Manuale completo per l'Agent
├── PROJECT_STATE.md            # 📊 Stato corrente del progetto
├── DEVELOPMENT_LOG.md          # 📝 Log cronologico implementazioni
├── ERROR_LOG.md                # 🐛 Database errori e soluzioni
├── SESSION_TEMPLATE.md         # 📋 Template per nuove sessioni
├── README.md                   # 📚 Questo file
└── sessions/                   # 📅 Cartella per log singole sessioni
    ├── session-01.md
    ├── session-02.md
    └── ...
```

---

## 📖 Descrizione File

### 1. `AGENT_INSTRUCTIONS.md` 🤖
**Scopo**: Manuale operativo completo per l'Agent

**Contiene:**
- Workflow standard per ogni task
- Code style e pattern da seguire
- Cosa fare e cosa NON fare
- Checklist pre/post task
- Quick reference (comandi, path, store actions)
- Template comunicazione con utente

**Quando leggerlo**: Sempre all'inizio di ogni sessione (5 min)

---

### 2. `PROJECT_STATE.md` 📊
**Scopo**: Foto istantanea dello stato corrente

**Contiene:**
- Componenti completati (con checkbox ✅/❌)
- Componenti da completare (con priorità)
- Percentuali di completamento per modulo
- Struttura file attuale
- Bug conosciuti
- Note per la prossima sessione

**Quando aggiornarlo**: Dopo ogni implementazione significativa

**Chi lo aggiorna**: Agent, sempre

---

### 3. `DEVELOPMENT_LOG.md` 📝
**Scopo**: Storia cronologica del progetto

**Contiene:**
- Log per ogni sessione con data
- Cosa è stato implementato e perché
- Decisioni tecniche prese
- File creati/modificati
- Metriche (LOC, componenti, ecc.)

**Quando aggiornarlo**: Fine di ogni sessione

**Chi lo aggiorna**: Agent, sempre

---

### 4. `ERROR_LOG.md` 🐛
**Scopo**: Database di errori e soluzioni

**Contiene:**
- Ogni errore con ID univoco (ERROR-001, ERROR-002, ...)
- Stack trace completo
- Root cause analysis
- Soluzione applicata (codice prima/dopo)
- Come prevenire in futuro
- Checklist per l'Agent

**Quando aggiornarlo**: Ogni volta che si incontra e risolve un errore

**Chi lo aggiorna**: Agent, sempre

**Formato ID**: ERROR-XXX (3 cifre progressive)

---

### 5. `SESSION_TEMPLATE.md` 📋
**Scopo**: Template standardizzato per documentare sessioni

**Contiene:**
- Struttura pre-compilata per sessione
- Checklist obiettivi
- Sezioni per implementazione, errori, decisioni
- Checklist fine sessione
- Metriche e lessons learned

**Quando usarlo**: All'inizio di ogni nuova sessione (copiare e rinominare)

**Chi lo usa**: Agent

---

## 🚀 Workflow Standard - Come Usare il Sistema

### Per l'Agent (Claude):

#### 🟢 All'Inizio di Ogni Sessione (10-15 min)

```
1. Leggi AGENT_INSTRUCTIONS.md (5 min)
   → Refresh su regole e workflow

2. Leggi PROJECT_STATE.md (3 min)
   → Capire stato attuale
   → Identificare cosa manca
   → Leggere note per questa sessione

3. Leggi DEVELOPMENT_LOG.md (ultima sessione) (2 min)
   → Capire cosa fatto l'ultima volta
   → Vedere decisioni recenti

4. Leggi ERROR_LOG.md (2 min)
   → Verificare errori aperti
   → Ricordare pattern di prevenzione

5. Copia SESSION_TEMPLATE.md → sessions/session-[N].md
   → Compila sezione Pre-Session
```

#### 🟡 Durante lo Sviluppo

```
1. Segui i pattern in AGENT_INSTRUCTIONS.md
2. Consulta ERROR_LOG.md se incontri problemi
3. Compila progressivamente session-[N].md
4. Documenta decisioni in real-time
```

#### 🔴 Quando Incontri un Errore

```
1. Analizza il problema
2. Cerca in ERROR_LOG.md se già visto
3. Se nuovo:
   - Crea entry ERROR-XXX
   - Documenta: problema, causa, soluzione
   - Aggiungi pattern prevenzione
4. Se già visto:
   - Segui soluzione documentata
   - Se non funziona, aggiorna entry
```

#### ✅ Fine Sessione (10 min)

```
1. Completa session-[N].md
   - Tutte le sezioni
   - Checklist completate

2. Aggiorna PROJECT_STATE.md
   - Spunta checkbox completati
   - Aggiorna percentuali
   - Scrivi note per prossima sessione
   - Aggiorna "Ultimo aggiornamento"

3. Aggiungi entry in DEVELOPMENT_LOG.md
   - Nuova sezione "Sessione [N]"
   - Cosa implementato
   - Decisioni tecniche
   - Note per dopo

4. Se errori, verifica ERROR_LOG.md sia aggiornato

5. Comunica all'utente:
   - Summary di cosa fatto
   - Cosa funziona ora
   - Cosa fare dopo
```

---

### Per lo Sviluppatore (Umano):

#### Prima di Iniziare Nuova Sessione

```
1. Leggi PROJECT_STATE.md
   → Vedi dove sei arrivato
   → Decidi cosa fare oggi

2. Opzionale: leggi ultima sessione in sessions/
   → Rinfresca memoria su dettagli

3. Comunica all'Agent cosa vuoi implementare
```

#### Dopo che l'Agent ha Lavorato

```
1. Testa il codice
2. Dai feedback
3. Se tutto ok, l'Agent aggiorna documentazione
```

#### Periodicamente (ogni 5-10 sessioni)

```
1. Review DEVELOPMENT_LOG.md
   → Assicurati che decisioni siano coerenti

2. Review ERROR_LOG.md
   → Verifica pattern ricorrenti
   → Considera refactoring se troppi errori simili

3. Review PROJECT_STATE.md
   → Verifica percentuali riflettano realtà
   → Aggiorna priorità se necessario
```

---

## 🎯 Vantaggi del Sistema

### ✅ Per l'Agent

1. **Zero ambiguità**: Sa sempre esattamente cosa fare
2. **Memoria perfetta**: Non dimentica nulla tra sessioni
3. **Evita errori ripetuti**: Database di soluzioni sempre disponibile
4. **Consistenza**: Pattern e style documentati
5. **Autonomia**: Può lavorare senza chiedere continuamente

### ✅ Per lo Sviluppatore

1. **Continuità garantita**: Può pausare e riprendere senza perdere contesto
2. **Onboarding istantaneo**: Nuovo agent o developer può partire subito
3. **Storia completa**: Sa perché certe scelte sono state fatte
4. **Debug facilitato**: Errori già risolti documentati
5. **Progressi tracciati**: Vede avanzamento nel tempo

### ✅ Per il Progetto

1. **Qualità alta**: Code review tramite pattern documentati
2. **Manutenibilità**: Decisioni documentate
3. **Scalabilità**: Sistema funziona per progetti piccoli e grandi
4. **Portabilità**: Documentazione è platform-agnostic

---

## 📊 Metriche di Successo

Il sistema funziona bene se:

- [ ] Agent impiega < 15 min per essere operativo in nuova sessione
- [ ] Zero domande ripetute (se documentato)
- [ ] Errori ripetuti < 5% del totale
- [ ] Code style consistente al 95%+
- [ ] Ogni sessione ha documentazione completa
- [ ] PROJECT_STATE.md sempre aggiornato
- [ ] Nessun "non so cosa fare" dall'Agent

---

## 🔧 Manutenzione del Sistema

### Ogni Sessione
- Agent aggiorna tutti e 3 file principali

### Ogni 5 Sessioni
- Review generale
- Consolidare lessons learned
- Pulire note obsolete

### Ogni 10 Sessioni
- Refactor documentazione se troppo lunga
- Archiviare sessioni vecchie
- Aggiornare template se necessario

---

## 🎓 Best Practices

### DO ✅
- Essere dettagliati ma concisi
- Usare checkbox per tracking
- Aggiornare SEMPRE dopo modifiche
- Documentare "perché" oltre a "cosa"
- Usare ID univoci per errori
- Linkare file correlati

### DON'T ❌
- Saltare aggiornamenti ("lo faccio dopo")
- Essere vaghi ("sistemato bug")
- Duplicare informazioni
- Dimenticare di committare docs
- Ignorare ERROR_LOG.md quando debuggi

---

## 🚨 Troubleshooting

### Problema: Agent sembra perso
**Soluzione**: Verificare abbia letto i 4 file principali all'inizio

### Problema: Errori ripetuti
**Soluzione**: Controllare ERROR_LOG.md sia aggiornato e pattern chiari

### Problema: Code style inconsistente
**Soluzione**: Aggiornare AGENT_INSTRUCTIONS.md con esempi più chiari

### Problema: Documentazione obsoleta
**Soluzione**: Dedicare una sessione solo a cleanup docs

---

## 📝 Note Finali

Questo sistema è **vivo** e può essere migliorato nel tempo.

Se noti pattern ripetuti o inefficienze:
1. Documenta il problema
2. Proponi soluzione
3. Aggiorna i template
4. Testa con nuova sessione

**La documentazione è importante quanto il codice.**

---

## 🤝 Feedback & Iterazioni

Sistema creato: 2026-03-05 (Sessione 1)
Versione: 1.0

**Changelog sistema:**
- v1.0 (2026-03-05): Setup iniziale

---

**Ultimo aggiornamento**: 2026-03-05
**Prossima review**: Dopo sessione 5
