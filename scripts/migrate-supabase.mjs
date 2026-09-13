import fs from 'node:fs';
import process from 'node:process';
import admin from 'firebase-admin';

const required = ['OLD_SUPABASE_URL', 'OLD_SUPABASE_ANON_KEY', 'GOOGLE_APPLICATION_CREDENTIALS'];
for (const name of required) {
  if (!process.env[name]) throw new Error(`Variabile mancante: ${name}`);
}

const serviceAccount = JSON.parse(fs.readFileSync(process.env.GOOGLE_APPLICATION_CREDENTIALS, 'utf8'));
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const firestore = admin.firestore();

const tables = {
  gyms: 'gyms',
  scheda_days: 'scheda_days',
  exercises: 'exercises',
  corsi: 'courses',
  occupancy: 'occupancy',
  notifications: 'notifications',
  promos: 'promos',
  events: 'events',
  event_partecipants: 'event_participants',
  community_messages: 'community_messages',
  pt_messages: 'pt_messages',
};

async function readTable(table) {
  const response = await fetch(`${process.env.OLD_SUPABASE_URL}/rest/v1/${table}?select=*`, {
    headers: {
      apikey: process.env.OLD_SUPABASE_ANON_KEY,
      Authorization: `Bearer ${process.env.OLD_SUPABASE_ANON_KEY}`,
    },
  });
  if (!response.ok) throw new Error(`${table}: ${response.status} ${await response.text()}`);
  return response.json();
}

for (const [source, target] of Object.entries(tables)) {
  const rows = await readTable(source);
  const batch = firestore.batch();
  for (const row of rows) {
    const sourceId = row.id == null ? undefined : String(row.id);
    const reference = sourceId
      ? firestore.collection(target).doc(sourceId)
      : firestore.collection(target).doc();
    const { password_hash: ignoredPasswordHash, ...safeRow } = row;
    batch.set(reference, safeRow, { merge: true });
  }
  await batch.commit();
  console.log(`${source} -> ${target}: ${rows.length} documenti`);
}

console.log('Migrazione contenuti completata. Gli utenti devono essere ricreati tramite Firebase Auth.');
