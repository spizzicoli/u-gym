import { useEffect, useState } from 'react';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

const seed = {
  gyms: {
    'gym-milano': { name: 'U-GYM Milano', address: 'Milano', distance: '2,4 km', open: true, hours: '06:00 - 22:00', members: 248 },
    'gym-monza': { name: 'U-GYM Monza', address: 'Monza', distance: '8,1 km', open: true, hours: '06:00 - 22:00', members: 176 },
    'gym-torino': { name: 'U-GYM Torino', address: 'Torino', distance: '145 km', open: false, hours: '07:00 - 21:00', members: 119 },
  },
  courses: {
    'course-yoga': { name: 'Yoga Flow', coach: 'Elena Rossi', schedule: 'Lunedi e Mercoledi, 18:30', duration: '60 min', spots: 8, max_spots: 20, price: '12 euro', tag: 'BENESSERE', tag_color: '#76c893', description: 'Respirazione, mobilita e rilassamento.', enrolled: 12 },
    'course-functional': { name: 'Functional Training', coach: 'Marco Bianchi', schedule: 'Martedi e Giovedi, 19:00', duration: '50 min', spots: 4, max_spots: 16, price: '15 euro', tag: 'ENERGY', tag_color: '#f4a261', description: 'Allenamento dinamico per tutto il corpo.', enrolled: 12 },
  },
  scheda_days: {
    'day-push': { day: 'Push', sort_order: 1 },
    'day-pull': { day: 'Pull', sort_order: 2 },
    'day-legs': { day: 'Legs', sort_order: 3 },
  },
  exercises: {
    'exercise-bench': { scheda_day_id: 'day-push', name: 'Panca piana', sets: '4 x 8', weight: '60 kg', muscle: 'Petto', gif_url: '', sort_order: 1 },
    'exercise-row': { scheda_day_id: 'day-pull', name: 'Rematore', sets: '4 x 10', weight: '40 kg', muscle: 'Dorso', gif_url: '', sort_order: 1 },
    'exercise-squat': { scheda_day_id: 'day-legs', name: 'Squat', sets: '4 x 8', weight: '70 kg', muscle: 'Gambe', gif_url: '', sort_order: 1 },
  },
  occupancy: {
    'milano-08': { gym_id: 'gym-milano', hour: 8, percentage: 32 },
    'milano-13': { gym_id: 'gym-milano', hour: 13, percentage: 54 },
    'milano-18': { gym_id: 'gym-milano', hour: 18, percentage: 86 },
    'milano-21': { gym_id: 'gym-milano', hour: 21, percentage: 41 },
  },
  promos: {
    'promo-welcome': { title: 'Porta un amico', short_description: 'Una settimana per voi due.', description: 'Invita un amico e ricevete entrambi una settimana gratuita.', image_url: '', expires_at: '2026-12-31', active: true, created_at: new Date().toISOString() },
  },
  events: {
    'event-open-day': { title: 'Open Day U-GYM', date: '2026-10-10', location: 'U-GYM Milano', short_description: 'Prova gratuita e tour della palestra.', description: 'Una giornata dedicata a nuovi corsi, trainer e consulenze.', created_at: new Date().toISOString() },
  },
  notifications: {
    'notification-welcome': { type: 'info', title: 'Benvenuto in U-GYM', body: 'Scegli un corso e inizia il tuo percorso.', created_at: new Date().toISOString() },
  },
};

export default function SeedData() {
  const [status, setStatus] = useState('');
  const [running, setRunning] = useState(false);
  const [sessionUid, setSessionUid] = useState('');

  useEffect(() => {
    return auth.onAuthStateChanged((firebaseUser) => setSessionUid(firebaseUser?.uid || ''));
  }, []);

  const insertSeed = async () => {
    setRunning(true);
    setStatus('Inserimento dati in corso...');
    try {
      const firebaseUser = auth.currentUser;
      if (!firebaseUser) throw new Error('Sessione Firebase non disponibile. Ricarica la pagina e accedi di nuovo.');

      let profileSnapshot;
      try {
        profileSnapshot = await getDoc(doc(db, 'users', firebaseUser.uid));
      } catch (error) {
        throw new Error(`Lettura del profilo negata. Pubblica le regole users e verifica che l'ID sia ${firebaseUser.uid}. (${error.code})`);
      }
      const profile = profileSnapshot.exists() ? profileSnapshot.data() : null;
      if (!profileSnapshot.exists()) {
        throw new Error(`Manca users/${firebaseUser.uid}. Crea il documento con questo ID e role: gym_owner.`);
      }
      if (!['gym_owner', 'gym_admin'].includes(profile.role)) {
        throw new Error(`Il documento users/${firebaseUser.uid} ha role "${profile.role || 'mancante'}", non "gym_owner".`);
      }

      for (const [collectionName, documents] of Object.entries(seed)) {
        for (const [id, data] of Object.entries(documents)) {
          try {
            await setDoc(doc(db, collectionName, id), { ...data, seeded_at: serverTimestamp() }, { merge: true });
          } catch (error) {
            throw new Error(`Blocco su ${collectionName}/${id}: ${error.code || error.message}`);
          }
        }
      }
      setStatus('Dati demo inseriti. Torna alla schermata palestre.');
    } catch (error) {
      setStatus(error.message);
    } finally {
      setRunning(false);
    }
  };

  return (
    <div style={{ maxWidth: 620, margin: '60px auto', padding: 24, color: '#fff' }}>
      <h1>Carica dati demo</h1>
      <p>Inserisce palestre, corsi, schede, esercizi, promo, eventi, notifiche e affluenza in Firestore.</p>
      {sessionUid && (
        <p style={{ wordBreak: 'break-all', fontSize: 13 }}>
          UID sessione Firebase: {sessionUid}
        </p>
      )}
      <button className="btn-primary" onClick={insertSeed} disabled={running}>{running ? 'INSERIMENTO...' : 'INSERISCI DATI DEMO'}</button>
      {status && <p style={{ marginTop: 20 }}>{status}</p>}
    </div>
  );
}
