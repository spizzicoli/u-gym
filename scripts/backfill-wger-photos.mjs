#!/usr/bin/env node
/**
 * Riempie exercises/{id}.photo_url (+ autore/licenza) cercando una foto reale su wger.de
 * (gratis, nessuna chiave richiesta, licenza CC-BY-SA)
 *
 * Uso su Windows:
 *   node scripts/backfill-wger-photos.mjs
 */
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { createRequire } from 'module';
import { existsSync } from 'fs';
import { resolve } from 'path';

const require = createRequire(import.meta.url);

const possiblePaths = [
  resolve('./serviceAccountKey.json'),
  resolve('./scripts/serviceAccountKey.json')
];

const keyPath = possiblePaths.find((p) => existsSync(p));

if (!keyPath) {
  throw new Error('File serviceAccountKey.json non trovato nella radice del progetto.');
}

const serviceAccount = require(keyPath);

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

// Mappatura dei termini italiani verso quelli inglesi riconosciuti da wger
const TRANSLATIONS = {
  'panca piana': 'bench press',
  'rematore': 'row',
  'squat': 'squat',
  'crunch': 'crunch',
  'crunch reverse': 'reverse crunch',
  'jumping jacks': 'jumping jack',
  'affondi': 'lunge',
  'stacco': 'deadlift',
  'trazioni': 'pull up',
  'distensioni': 'shoulder press',
  'curl': 'biceps curl'
};

function translateTerm(term) {
  const clean = term.toLowerCase().trim();
  return TRANSLATIONS[clean] || clean;
}

async function searchWger(query) {
  const searchTerm = translateTerm(query);
  
  // Utilizziamo l'endpoint principale /exercise/ filtering per nome
  const res = await fetch(`https://wger.de/api/v2/exercise/?name=${encodeURIComponent(searchTerm)}&language=2&format=json`);
  if (!res.ok) return [];
  
  const data = await res.json();
  if (data.results && data.results.length > 0) {
    return data.results.map((item) => item.id);
  }

  // Fallback sull'endpoint di ricerca generico se il primo non restituisce nulla
  const searchRes = await fetch(`https://wger.de/api/v2/exercise/search/?term=${encodeURIComponent(searchTerm)}&format=json`);
  if (!searchRes.ok) return [];
  const searchData = await searchRes.json();
  return (searchData.suggestions || []).map((s) => s.data?.id || s.data?.base_id).filter(Boolean);
}

async function fetchExerciseInfo(id) {
  const res = await fetch(`https://wger.de/api/v2/exerciseinfo/${id}/?format=json`);
  if (!res.ok) return null;
  return res.json();
}

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

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function main() {
  const snap = await db.collection('exercises').get();
  console.log(`Trovati ${snap.size} esercizi.`);
  for (const doc of snap.docs) {
    const data = doc.data();
    if (data.photo_url) { console.log(`– ${data.name}: già presente, salto`); continue; }
    
    // Ignoriamo le voci cumulative come "Gambe - addominali - petto..."
    if (data.name.includes('-') && data.name.length > 25) {
      console.log(`– ${data.name}: nome cumulativo, salto`);
      continue;
    }

    try {
      const photo = await resolveOne(data.name);
      if (photo) {
        await doc.ref.set(photo, { merge: true });
        console.log(`✓ ${data.name} → ${photo.photo_url}`);
      } else {
        console.log(`✗ ${data.name}: nessuna foto trovata su wger`);
      }
    } catch (err) {
      console.error(`! ${data.name}:`, err.message);
    }
    await sleep(300);
  }
  console.log('Fatto.');
}

main().then(() => process.exit(0)).catch((err) => { console.error(err); process.exit(1); });