import fs from 'node:fs';
import process from 'node:process';
import admin from 'firebase-admin';

const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
if (!serviceAccountPath) {
  throw new Error('Imposta GOOGLE_APPLICATION_CREDENTIALS al percorso del service account Firebase.');
}

const seedPath = new URL('../firestore-seed.json', import.meta.url);
const seed = JSON.parse(fs.readFileSync(seedPath, 'utf8'));
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();

for (const [collectionName, documents] of Object.entries(seed)) {
  for (const document of documents) {
    const { id, ...data } = document;
    const reference = id
      ? db.collection(collectionName).doc(String(id))
      : db.collection(collectionName).doc();
    await reference.set(data, { merge: true });
  }
  console.log(`${collectionName}: ${documents.length} documenti`);
}

console.log('Bootstrap Firestore completato.');
