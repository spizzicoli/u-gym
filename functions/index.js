/**
 * Foto reali degli esercizi da wger.de — gratis, nessuna chiave API, licenza CC-BY-SA
 * (uso commerciale consentito, basta citare autore e fonte: l'app lo fa già in automatico).
 *
 * wger non manda gli header CORS, quindi il browser non può chiamarlo direttamente (il browser
 * stesso blocca la richiesta). Questa funzione fa da proxy server-to-server — qui il limite CORS
 * non esiste — cerca l'esercizio, prende la foto principale + licenza/autore e la salva su
 * Firestore (exercises/{id}.photo_url ecc). Da quel momento l'app mostra la foto con un normale
 * <img src>, che non ha bisogno di CORS.
 *
 * Deploy:  cd functions && npm install && cd .. && firebase deploy --only functions
 * Costo: la sola spesa viva è avere il piano Blaze attivo; il traffico di questa funzione
 * è minimo (poche chiamate, mai verso utenti finali), quindi il costo reale è quasi nullo.
 *
 * Uso:
 *   - una singola foto:     resolveExercisePhoto({ exerciseId: 'exercise-squat', query: 'Squat' })
 *   - tutta la collezione:  backfillExercisePhotos({})  (salta chi ha già una foto)
 */
const { onCall } = require('firebase-functions/v2/https');
const { initializeApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

initializeApp();
const db = getFirestore();
const REGION = 'europe-west1';
const WGER_BASE = 'https://wger.de/api/v2';

async function searchWger(query) {
  const res = await fetch(`${WGER_BASE}/exercise/search/?term=${encodeURIComponent(query)}&language=english&format=json`);
  if (!res.ok) throw new Error(`wger search HTTP ${res.status}`);
  const data = await res.json();
  return (data.suggestions || []).map((s) => s.data?.base_id).filter(Boolean);
}

async function fetchExerciseInfo(baseId) {
  const res = await fetch(`${WGER_BASE}/exerciseinfo/${baseId}/?format=json`);
  if (!res.ok) return null;
  return res.json();
}

/** Sceglie l'immagine migliore: quella marcata "main", altrimenti la prima disponibile. */
function pickPhoto(info) {
  const images = info?.images || [];
  if (!images.length) return null;
  const img = images.find((i) => i.is_main) || images[0];
  return {
    photo_url: img.image,
    photo_license: img.license_title || img.license?.short_name || 'CC-BY-SA',
    photo_license_url: img.license_object_url || img.license?.url || 'https://creativecommons.org/licenses/by-sa/4.0/',
    photo_author: img.license_author || 'comunità wger.de',
    photo_source_url: `https://wger.de/en/exercise/${info.id}/view/`,
  };
}

async function resolveOne(query) {
  const ids = await searchWger(query);
  for (const id of ids.slice(0, 3)) {
    const info = await fetchExerciseInfo(id);
    const photo = pickPhoto(info);
    if (photo) return photo;
  }
  return null;
}

exports.resolveExercisePhoto = onCall({ region: REGION }, async (req) => {
  const { exerciseId, query } = req.data || {};
  if (!exerciseId || !query) throw new Error('exerciseId e query sono obbligatori');
  const photo = await resolveOne(query);
  if (!photo) return { ok: false, reason: 'no-match' };
  await db.collection('exercises').doc(exerciseId).set(photo, { merge: true });
  return { ok: true, ...photo };
});

exports.backfillExercisePhotos = onCall({ region: REGION, timeoutSeconds: 300 }, async () => {
  const snap = await db.collection('exercises').get();
  const results = [];
  for (const doc of snap.docs) {
    const data = doc.data();
    if (data.photo_url) { results.push({ id: doc.id, status: 'skip-existing' }); continue; }
    try {
      const photo = await resolveOne(data.name);
      if (photo) {
        await doc.ref.set(photo, { merge: true });
        results.push({ id: doc.id, status: 'ok', name: data.name });
      } else {
        results.push({ id: doc.id, status: 'no-match', name: data.name });
      }
    } catch (err) {
      results.push({ id: doc.id, status: 'error', error: String(err) });
    }
    await new Promise((r) => setTimeout(r, 300)); // non martelliamo l'API pubblica di wger
  }
  return { ok: true, count: results.length, results };
});
