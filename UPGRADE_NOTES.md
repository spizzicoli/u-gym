# U-GYM – ultimo aggiornamento

## Correzioni
- Palette runtime realmente persistente e applicata a tutte le pagine; verde rinominato `U-Gym`.
- Promo, eventi e notifiche: query per palestra con fallback compatibile con documenti storici senza `gym_id`.
- GIF esercizi visibili anche nella sezione NOTE di ogni esercizio.

## Nuove funzionalità
1. **Presenze / accessi**: Home e Badge mostrano accessi settimana/mese. La fonte prevista è `gym_checkins` (fallback `attendance`) con `user_id`, `gym_id`, `scanned_at`.
2. **Dati personali**: peso, altezza, età, sesso e BMI indicativo in Profilo.
3. **Abbonamento e pagamenti**: scadenza dinamica, avviso in scadenza, richiesta rinnovo e storico acquisti dalla collezione `payments`.
4. **Percorso e costanza**: Home mostra accessi settimanali, mensili, obiettivo settimanale e avanzamento.

## Firestore
Pubblicare le nuove regole:

```bash
firebase deploy --only firestore:rules
```

Il portale futuro dovrà scrivere:
- `gym_checkins` (o `attendance`) per i passaggi al tornello;
- `payments` per abbonamenti/corsi/eventi acquistati;
- `users/{uid}` per `membership`, `membership_plan`, `membership_expires_at`, `membership_status`.

La richiesta rinnovo cliente viene salvata in `membership_renewal_requests`.

## GIF
Le GIF demo sono locali in `public/exercise-gifs/`, quindi non richiedono Firebase Storage.

## Avvio
```bash
npm install
npm run build
npx cap sync
npx cap open android
```


## Latest schema update
- Added `schede` and `scheda_exercises` for multiple workout sheets and per-sheet exercise settings.
- Client selects an active gym-specific sheet, then an active global sheet.
- Global courses, promos, notifications, events, and occupancy are combined with gym-specific records.
- Deploy Firestore rules with `firebase deploy --only firestore:rules`.

## Aggiornamento — GIF esercizi (round 2)
- Aggiunte 15 GIF dimostrative in `public/exercise-gifs/` (prima ce n'erano solo 3: squat, panca-piana, rematore — ora rifatte meglio, più le altre 12). Stesso stile grafico già presente (titolo in alto, didascalia in basso), ma con anatomia e attrezzi molto più curati (corpo con proporzioni corrette via cinematica inversa, bilancieri/manubri/attrezzature disegnate).
- **`src/lib/exerciseGifs.js`** (nuovo): prima il collegamento nome→GIF era una mappa con tre nomi scritti a mano (`GIF_FALLBACKS` in `Scheda.jsx`), che funzionava solo per un match esatto del nome. Ora è un resolver ad alias: riconosce varianti del nome ("Squat con bilanciere", "panca", "military press" ecc.) e collega comunque alla GIF giusta. Il campo `exercise.gif_url` a database ha sempre la priorità, quando presente.
- `Scheda.jsx`: usa il nuovo resolver ovunque compariva la vecchia mappa, e aggiunge una miniatura cliccabile accanto a ogni esercizio in elenco (prima la GIF si vedeva solo aprendo il pannello laterale).
- **Bug corretto in `scripts/seed-firestore.mjs`**: si aspettava un array di documenti, ma `firestore-seed.json` è un oggetto `{idDocumento: campi}` — lo script andava in errore (`documents is not iterable`) appena lanciato. Corretto per leggere il formato realmente presente nel file.
- `firestore-seed.json`: aggiunti 12 esercizi mancanti (prima solo 3), tutti collegati alla loro GIF.

Nota: queste restano GIF stilizzate (corpo disegnato, non foto reali) — più curate della versione precedente ma non fotografiche. Se in futuro vorrai le foto reali con licenza commerciale verificata (wger.de, CC-BY-SA), è un'integrazione separata che avevamo già progettato in un altro giro di lavoro: fammi sapere se vuoi che la riporti anche in questa versione del codice.

## Aggiornamento — foto reali da wger.de (round 3)
Riportata qui l'integrazione con **wger.de**: gratis, nessuna chiave API, licenza CC-BY-SA (uso commerciale consentito, basta citare autore e fonte — l'app lo fa già in automatico sotto la foto). Quando una foto è presente ha sempre la priorità sulla GIF disegnata; finché non lo è, resta la GIF come riserva — la scheda non è mai vuota.

**Cosa è stato aggiunto:**
- `functions/` (nuovo — prima non esisteva in questo progetto): due Cloud Functions, `resolveExercisePhoto` (una foto alla volta) e `backfillExercisePhotos` (tutta la collezione). Necessarie perché wger non manda gli header CORS: il browser bloccherebbe la chiamata diretta, quindi serve un proxy server-to-server.
- `firebase.json`: aggiunta la sezione `functions`.
- `scripts/backfill-wger-photos.mjs`: stessa logica, da lanciare una tantum da un computer con internet, se preferisci non toccare le Cloud Functions.
- `src/lib/exerciseGifs.js`: ora risolve anche `photo_url`/`photo_author`/`photo_license` (quando presenti su Firestore) con priorità sulla GIF disegnata.
- `Scheda.jsx`: mostra la foto reale con didascalia di attribuzione ovunque prima c'era solo la GIF (pannello esercizio, pannello note, miniatura in elenco).

**Come attivarla:**
1. `cd functions && npm install && cd ..`
2. `firebase deploy --only functions` (serve il piano Blaze di Firebase — il traffico di questa funzione è minimo, quindi il costo reale resta vicino allo zero)
3. Lancia una volta `node scripts/backfill-wger-photos.mjs` (serve `serviceAccountKey.json` da Firebase Console → Impostazioni progetto → Account di servizio) per riempire le foto degli esercizi già a database.
4. Per un nuovo esercizio creato dal portale in futuro, richiama `resolveExercisePhoto({ exerciseId, query: nomeEsercizio })`.

**Limite onesto**: wger ha solo foto statiche (non GIF animate), ed è un database comunitario aperto — non tutti gli esercizi ci sono. Per quelli mancanti resta la GIF disegnata di riserva.
