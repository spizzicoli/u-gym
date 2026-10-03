# Firebase setup

## 1. Console Firebase

Nel progetto `u-gym-52fce` abilita:

- Authentication -> Sign-in method -> Email/Password
- Firestore Database
- Storage

Crea almeno un utente titolare in Authentication e il relativo documento in `users`:

```json
{
  "email": "titolare@palestra.it",
  "username": "titolare",
  "role": "gym_owner"
}
```

Il campo `id` del documento deve essere uguale all'UID dell'utente Firebase Auth.

## 2. Regole e indici

Con Firebase CLI installata e autenticata:

```powershell
firebase use u-gym-52fce
firebase deploy --only firestore:rules,firestore:indexes,storage
```

## 3. Importazione contenuti Supabase

Scarica un service account da Firebase Console -> Project settings -> Service accounts -> Generate new private key. Non inserirlo nel progetto e non pubblicarlo.

Imposta le variabili nella sessione PowerShell:

```powershell
$env:GOOGLE_APPLICATION_CREDENTIALS = 'C:\percorso\service-account.json'
$env:OLD_SUPABASE_URL = 'https://...supabase.co'
$env:OLD_SUPABASE_ANON_KEY = '...'
```

Poi esegui dalla cartella dell'app:

```powershell
npm run firebase:migrate-supabase
```

Lo script trasferisce palestre, schede, esercizi, corsi, affluenza, notifiche, promo, eventi, iscrizioni e messaggi. `corsi` viene convertita nella collezione Firebase `courses`.

Gli utenti non vengono copiati: le password hash Supabase non sono importabili in Firebase Auth. Devono essere ricreati oppure reimpostati tramite il flusso password reset.

## 4. Avvio locale

App clienti:

```powershell
npm run dev
```

Portale titolari, dalla cartella esterna `C:\Users\samue\Documents\Progetti\green-theory-portal`:

```powershell
npm run dev
```

L'app usa la porta 3000 e il portale la 3001.

## 5. Push notifications su Android (app ibrida Capacitor)

U-GYM è un'app ibrida: il codice principale è Web/React, ma quando viene installata come app Android esiste anche un progetto nativo. Per il push Android Capacitor usa Firebase Cloud Messaging.

1. Firebase Console -> `u-gym-52fce` -> Impostazioni progetto -> Le tue app.
2. Se non esiste ancora, aggiungi una **app Android** con package name esatto:
   `com.ugym.app`
3. Scarica `google-services.json`.
4. Copialo in:
   `android/app/google-services.json`
5. Dalla root:
   `npm install`
   `npx cap sync`
6. Apri Android Studio con:
   `npx cap open android`

Il codice cliente registra il token FCM in `users/{uid}/devices/{deviceId}`.

> La registrazione del token non invia da sola i messaggi. L'invio automatico delle push (chat, promozioni, eventi, ecc.) verrà collegato al backend/portale palestra con Firebase Admin SDK/Cloud Functions.

## 6. Posizione

Su Android il progetto dichiara `ACCESS_COARSE_LOCATION` e `ACCESS_FINE_LOCATION`. La schermata Palestre richiede il permesso al momento del tap su **Usa la mia posizione** e ordina le sedi per distanza quando ogni palestra ha `latitude` e `longitude`.
