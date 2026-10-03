# 🏋️ U-GYM App

App ibrida iOS/Android per la palestra U-GYM, sviluppata con React + SCSS + Capacitor + Material UI.

---

## 📋 Prerequisiti

- **Node.js** v18 o superiore → [nodejs.org](https://nodejs.org)
- **npm** v9 o superiore (incluso con Node)
- Per iOS: **Xcode** 14+ (solo macOS)
- Per Android: **Android Studio** + SDK

---

## 🚀 Avvio in locale (browser)

```bash
# 1. Installa le dipendenze
npm install

# 2. Avvia il server di sviluppo
npm run dev
```

Apri il browser su: **http://localhost:3000**

> 💡 Per simulare un dispositivo mobile, apri i DevTools (F12) → icona dispositivo mobile (Ctrl+Shift+M)

---

## 📱 Build e deploy su dispositivo

### Build produzione
```bash
npm run build
```

### Sync con Capacitor
```bash
# Installa Capacitor CLI (una volta sola)
npm install -g @capacitor/cli

# Sincronizza la build con i progetti nativi
npx cap sync
```

### iOS
```bash
# Apri in Xcode
npx cap open ios

# Oppure esegui direttamente
npx cap run ios
```

### Android
```bash
# Apri in Android Studio
npx cap open android

# Oppure esegui direttamente
npx cap run android
```

---

## 🗂️ Struttura del progetto

```
src/
├── context/
│   └── AppContext.jsx       # Stato globale (auth, palestra selezionata)
├── components/
│   ├── BottomNav.jsx        # Navigazione inferiore
│   └── BottomNav.scss
├── pages/
│   ├── Login.jsx            # Accesso
│   ├── Register.jsx         # Registrazione
│   ├── Gyms.jsx             # Selezione palestra + geolocalizzazione
│   ├── Home.jsx             # Affluenza in tempo reale
│   ├── Scheda.jsx           # Scheda allenamento con esercizi
│   ├── Badge.jsx            # QR code accesso tornello
│   ├── Corsi.jsx            # Lista corsi
│   ├── CorsoDetail.jsx      # Dettaglio corso + pagamento
│   └── PrivacyPolicy.jsx    # Privacy Policy GDPR
└── styles/
    ├── _variables.scss      # Design tokens (colori, font, spacing)
    └── global.scss          # Stili globali
```

---

## 🛠️ Modifiche comuni

### Cambiare i colori
Modifica `src/styles/_variables.scss`:
```scss
$color-green: #3ddc84;   // colore principale
$color-bg: #111214;      // sfondo scuro
```

### Aggiungere una palestra
In `src/pages/Gyms.jsx`, aggiungi un oggetto all'array `MOCK_GYMS`.

### Aggiungere un esercizio alla scheda
In `src/pages/Scheda.jsx`, aggiungi un oggetto all'array `SCHEDA` nel giorno desiderato.

### Aggiungere un corso
In `src/pages/Corsi.jsx`, aggiungi un oggetto all'array `CORSI`.

### Collegare un backend reale
- **Auth**: sostituisci la funzione `login()` in `AppContext.jsx` con una chiamata API
- **Geolocalizzazione**: usa `@capacitor/geolocation` — già installato, vedi commenti in `Gyms.jsx`
- **Pagamenti**: integra Stripe SDK sostituendo la funzione `pay()` in `CorsoDetail.jsx`
- **Affluenza**: sostituisci i dati mock in `Home.jsx` con una chiamata API real-time (es. WebSocket)

---

## 📦 Stack tecnologico

| Tecnologia | Versione | Utilizzo |
|---|---|---|
| React | 18 | UI framework |
| React Router | 6 | Navigazione SPA |
| Material UI | 5 | Componenti (TextField, Checkbox…) |
| SCSS | - | Stili custom |
| Capacitor | 6 | Bridge nativo iOS/Android |
| qrcode.react | 3 | Generazione QR Badge |
| Vite | 5 | Build tool |

---

## 🔐 Note sicurezza produzione

- Implementare JWT authentication con refresh token
- Usare HTTPS per tutte le API
- Il QR code dovrebbe usare token firmati con scadenza server-side
- I pagamenti devono passare per Stripe/provider certificato PCI DSS
- Non esporre mai chiavi API nel codice client

---

## 📞 Supporto

Per domande: [privacy@ugym.it](mailto:privacy@ugym.it)

## Upgrade cliente — chat, posizione, performance, push

- La chat `/community` ora ha due tab: **Utenti** e **Personal Trainer**.
- La chat PT usa `user_id + trainer_id`, evitando di scaricare la conversazione degli altri clienti.
- Chat supporta testo, immagini e audio.
- Le cronologie chat sono limitate agli ultimi 60 messaggi.
- Le liste Firestore principali sono limitate e filtrabili per `gym_id`.
- La Home legge l'affluenza della palestra selezionata da Firestore.
- La selezione palestra usa Capacitor Geolocation su Android/iOS e geolocation web nel browser.
- La scheda salva localmente il completamento degli esercizi e il timer della sessione.
- Allenamento Casa legge gli esercizi da Firestore e permette di selezionarli o generare una sessione casuale di quattro esercizi.
- Le GIF demo sono in `public/exercise-gifs/`.
- Le notifiche push native sono predisposte con Capacitor. Per Android serve registrare `com.ugym.app` nel progetto Firebase e inserire `android/app/google-services.json`.


## U-GYM development mode (Firebase free plan)
This client build does not use Firebase Storage. Chat currently uses Firestore text/emoji only. Run `npm install` after extracting so the added Capacitor Local Notifications dependency is installed.

## Modello schede U-GYM aggiornato
Il client supporta `schede` -> `scheda_days` -> `scheda_exercises` -> `exercises`, scegliendo la scheda attiva specifica della palestra o, se assente, quella globale. Rimane la compatibilità con le vecchie schede.

Contenuti globali: promo, notifiche, eventi, corsi e rilevazioni affluenza senza `gym_id` vengono considerati visibili anche quando l'utente ha una palestra selezionata.

## Build iOS con Codemagic e installazione tramite AltStore

Il workflow `ios-unsigned` in `codemagic.yaml` genera un IPA non firmato, senza richiedere un account Apple Developer. È pensato per l'installazione personale tramite AltStore/AltServer, non per la pubblicazione su App Store.

1. Pubblica il progetto su GitHub e accedi a [Codemagic](https://codemagic.io/) con GitHub.
2. Aggiungi il repository `spizzicoli/u-gym` e consenti a Codemagic di leggere il repository.
3. In **Start new build**, scegli il branch `main` e il workflow `ios-unsigned`.
4. Avvia la build e, quando termina, scarica l'artefatto `U-GYM-unsigned.ipa`.
5. Installa AltStore sul tuo iPhone usando AltServer sul computer (iPhone e computer collegati via USB o sulla stessa rete Wi-Fi).
6. Sul telefono apri AltStore, vai in **My Apps**, premi **+** e seleziona l'IPA scaricato. Per mantenere l'app installata, AltStore deve poterla aggiornare periodicamente (in genere ogni 7 giorni con un Apple ID gratuito).

Codemagic usa un runner macOS per creare il progetto iOS Capacitor e compilare l'app. La prima build può richiedere qualche minuto. Non caricare su GitHub chiavi private Firebase o file service account.


## U-GYM client registry sync

Ad ogni accesso autenticato il client sincronizza automaticamente il profilo in `clients/{uid}`. Questo include anche gli utenti registrati prima dell'introduzione della collection `clients`, quindi non serve ricrearli: basta aprire/aggiornare il client con questa versione e accedere con il proprio account.
