# Finance Analyzer — Brief di riorganizzazione ("Cockpit")

> Contesto: l'app esiste e funziona (live su faber04.com/app/finance-analyzer/, React + TypeScript + Tailwind + Recharts, API FMP). Il problema non è cosa fa: è come si presenta. Oggi è "un po' tutto e un po' niente". Questo brief la riorganizza attorno a UNA identità, senza tagliare funzionalità.

## 1. Identità: "The value investor's cockpit"

Una console per l'intero ciclo decisionale dell'investitore:

```text
ANALIZZA      → analisi fondamentale con Value Score (Graham/Buffett)
CONFRONTA     → screener multi-azienda (fino a 6)
TIENI IL POLSO → portfolio tracker con prezzi live
RIFLETTI      → investment journal (thesis, esiti, lezioni)
```

**One-liner per ogni canale**: "One console for the full investment decision loop."

## 2. Principio guida: c'è UN pannello principale

Un cockpit ha un pannello che comanda. Qui è **ANALYZE**: il gesto d'ingresso dell'investitore è *"questo titolo, com'è messo?"* — tutto il resto ruota attorno a quel verdetto. Ogni schermata deve rispondere alla domanda "e questo come mi aiuta a decidere?".

## 3. Audit di ciò che c'è oggi (da README e uso)

- Analisi fondamentale con auto-fill API FMP, ratio (P/E, P/B, PS, ROE, ROA, D/E, Current), Value Score 0-100 con raccomandazione, reset intelligente del form
- Portfolio tracker: posizioni, gain/loss live, donut allocazione, barre gain/loss
- Investment journal: thesis, tag, filtri, retrospettiva
- Screener: confronto fino a 6 aziende, tabella ordinabile, "Best in Class"
- Homepage attuale: analisi recenti (storico localStorage, ultime 10) + overview statistiche
- Altro: menu hamburger mobile, HashRouter, settings page con API key, form validati

**Il disordine percepito**: 4 funzioni allo stesso livello gerarchico + una homepage che è un mix (recents + statistiche) che non dice chi è il padrone di casa.

## 4. Riordino proposto (non elimina nulla: riallinea)

1. **Homepage = ANALYZE.** Appena entri, il protagonista è la ricerca: campo ticker in grande + bottone. Sotto: le analisi recenti (le "recenti" sono già lì, diventano righe di servizio, mica il titolo del giornale). Le statistiche portfolio si spostano in PORTFOLIO, dove è giusto che vivano.
2. **SCREENER entra dentro ANALYZE.** Lo screener è "analisi multipla": perfetto come *modalità* di Analyze ("Compare mode: aggiungi fino a 6 aziende"). Una sezione in meno nel menu, e la stessa feature diventa più leggibile come parte del racconto. Il "Best in Class" resta: il trofeo è pieno di personalità, tenerlo sottolineato.
3. **Navigazione primaria a 3 voci**: Analyze · Portfolio · Journal. Impostazioni da icona, non da voce di menu. (Se un giorno una funzione esce, esce da qui, non dalla pancia.)
4. **Journal come "flight log"**: la retrospettiva è il tocco da investitore evoluto. Nella pagina, se compare un richerterà collegamento con Analyze ("hai analizzato X il 3 maggio → hai comprato → com'è andata"), è la ciliegina che trasforma il journal da blocco note a parte del ciclo.

## 5. Coerenza linguistica (da decidere subito, condiziona tutto il resto)

Oggi l'app è in italiano? Il sistema del posizionamento è in **inglese** (LinkedIn EN, sito EN, repo EN, demo EN). Due strade oneste:
- **A (consigliata per coerenza)**: UI in inglese. I clienti EU la vedono come parte del racconto unico.
- **B**: i18n IT/EN come PickUpNews (più lavoro, ma-consistenza con il case study n.1). In ogni caso: decidere ora, non dopo.

## 6. Pulizie di contorno (le piccole cose che fanno "ordinato")

- **Empty states**: portfolio vuoto e journal vuoto devono avere un messaggio che invita al primo gesto (non aree bianche)
- **Error states API**: ticker inesistente, quota API finita, offline: tre stati chiaramente diversi tra loro con un 'retry' dove serve
- **Loading**: durante l'auto-fill API, feedback visibile del recupero (skeleton o spinner, ma dichiarato)
- **localStorage**: chiavi versionate (`fa:v1:...`) così un domani cambi schema senza rompere le sessioni aperte, audit di cosa resta salvato dopo "reset intelligente"

## 7. Definition of done (accettazione)

- [ ] Apprendo l'app e in 5 secondi capisco qual è il gesto principale (cercare un ticker)
- [ ] La navigazione ha 3 voci primarie che raccontano il ciclo (analyze/track/reflect)
- [ ] Lo screener è una modalità di Analyze e funziona come prima (Best in Class incluso)
- [ ] Le statistiche del portfolio vivono in Portfolio, non in homepage
- [ ] UI in una lingua sola, decisa e applicata ovunque (niente misto IT/EN)
- [ ] Empty/error/loading states sistemati per le 3 interazioni principali
- [ ] Un giro completo end-to-end (cerco → analizzo → confronto 2 aziende → aggiungo posizione → scrivo la thesis) senza inciampare

## 8. Cosa resta volutamente fuori da questo giro

- Nessuna nuova feature: questo giro è di **riordino**, non di crescita
- Redesign grafico totale: eventuali design tokens brand (navy #0a0f1c, teal #0ea5e9) possono arrivare dopo, come veste esterna
- Eventuali refactor architetturali: solo se conseguiano al riordino, mai come fine a sé stessi
