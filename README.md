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
