import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  setDoc,
  serverTimestamp,
  where,
  addDoc,
} from 'firebase/firestore';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { auth, db } from './firebase';

const toData = (snapshot) => ({ id: snapshot.id, ...snapshot.data() });
const toPlainDate = (value) => (value?.toDate ? value.toDate().toISOString() : value || null);
const AUTH_REQUEST_TIMEOUT_MS = 20000;

function withAuthTimeout(promise) {
  let timeoutId;
  const timeout = new Promise((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error(
      'Firebase non risponde. Controlla la connessione e riprova.'
    )), AUTH_REQUEST_TIMEOUT_MS);
  });

  return Promise.race([promise, timeout]).finally(() => clearTimeout(timeoutId));
}

// Keep reads bounded. The old helper could download an entire collection on every screen.
const getCollection = async (name, { sortField = null, direction = 'asc', max = 50, filters = [] } = {}) => {
  const reference = collection(db, name);
  const constraints = [...filters];
  if (sortField) constraints.push(orderBy(sortField, direction));
  constraints.push(limit(max));
  const snapshot = await getDocs(query(reference, ...constraints));
  return snapshot.docs.map(toData);
};

const userData = (data, id) => ({
  id,
  username: data.username,
  email: data.email,
  role: data.role || 'client',
  trainer_id: data.trainer_id || null,
});

export async function registerUser(username, email, password, role = 'client') {
  const credential = await createUserWithEmailAndPassword(auth, email.trim(), password);
  const profile = {
    username: username.trim(), email: email.trim(), role: role === 'cliente' ? 'client' : role,
    trainer_id: null, created_at: new Date().toISOString(),
  };
  await setDoc(doc(db, 'users', credential.user.uid), profile);
  // Keep the portal registry in sync immediately, including brand-new accounts.
  await setDoc(doc(db, 'clients', credential.user.uid), {
    uid: credential.user.uid,
    name: profile.username,
    email: profile.email,
    membership_status: 'attivo',
    created_at: serverTimestamp(),
    updated_at: serverTimestamp(),
  }, { merge: true });
  return userData(profile, credential.user.uid);
}

export async function loginUser(credential, password) {
  let email = credential.trim();
  if (!email.includes('@')) {
    const snapshot = await withAuthTimeout(
      getDocs(query(collection(db, 'users'), where('username', '==', email), limit(1)))
    );
    if (snapshot.empty) throw new Error('Credenziali non valide');
    email = snapshot.docs[0].data().email;
  }
  const result = await withAuthTimeout(signInWithEmailAndPassword(auth, email, password));
  return userData({
    email: result.user.email,
    username: result.user.displayName || result.user.email?.split('@')[0] || 'Atleta',
    role: 'client',
  }, result.user.uid);
}

export async function logoutUser() { await signOut(auth); }

export async function updateUserProfile(userId, updates) {
  if (!userId) throw new Error('Utente non valido');
  const clean = {};
  if (typeof updates.username === 'string') {
    const username = updates.username.trim();
    if (username.length < 3 || username.length > 24) throw new Error('Lo username deve avere tra 3 e 24 caratteri.');
    clean.username = username;
  }
  if (typeof updates.theme === 'string') clean.theme = updates.theme;
  if (typeof updates.weeklyGoal === 'number') clean.weekly_goal = Math.min(7, Math.max(1, updates.weeklyGoal));
  if (typeof updates.workoutReminders === 'boolean') clean.workout_reminders = updates.workoutReminders;
  if (updates.age !== undefined) clean.age = Math.min(120, Math.max(13, Number(updates.age) || 0));
  if (updates.height !== undefined) clean.height = Math.min(250, Math.max(100, Number(updates.height) || 0));
  if (updates.weight !== undefined) clean.weight = Math.min(400, Math.max(20, Number(updates.weight) || 0));
  if (typeof updates.sex === 'string') clean.sex = updates.sex;
  await setDoc(doc(db, 'users', userId), clean, { merge: true });
  return clean;
}

export async function fetchGyms() {
  const gyms = await getCollection('gyms', { sortField: 'name', max: 50 });
  return gyms.sort((a, b) => String(a.name || '').localeCompare(String(b.name || '')));
}

export async function fetchScheda({ gymId = null } = {}) {
  // New model: schede -> scheda_days -> scheda_exercises -> exercises.
  // The client shows the active gym-specific sheet first, then an active global sheet.
  try {
    const sheets = await getCollection('schede', { sortField: null, max: 100 });
    const eligible = sheets.filter(s => (!gymId || !s.gym_id || s.gym_id === gymId) && s.active !== false);
    const sheet = eligible.find(s => gymId && s.gym_id === gymId) || eligible.find(s => !s.gym_id) || eligible[0];
    if (sheet) {
      const daySnap = await getDocs(query(collection(db, 'scheda_days'), where('scheda_id', '==', sheet.id), limit(100)));
      const days = daySnap.docs.map(toData).sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
      const linkSnap = await getDocs(query(collection(db, 'scheda_exercises'), where('scheda_id', '==', sheet.id), limit(500)));
      const links = linkSnap.docs.map(toData);
      const exerciseSnap = await getDocs(query(collection(db, 'exercises'), limit(500)));
      const exercises = exerciseSnap.docs.map(toData);
      const byId = new Map(exercises.map(e => [e.id, e]));
      const built = days.map(day => ({
        ...day,
        exercises: links.filter(l => l.day_id === day.id).sort((a,b)=>(a.order||0)-(b.order||0)).map(link => ({
          ...(byId.get(link.exercise_id) || { id: link.exercise_id, name: 'Esercizio non disponibile' }),
          sets: link.sets ?? byId.get(link.exercise_id)?.sets ?? '',
          weight: link.weight ?? byId.get(link.exercise_id)?.weight ?? '',
          rest_seconds: link.rest_seconds ?? '',
          notes: link.notes ?? '',
          scheda_exercise_id: link.id,
        }))
      }));
      if (built.length) return built;
    }
  } catch (error) {
    console.warn('Nuovo modello scheda non disponibile, uso compatibilità legacy.', error);
  }

  // Legacy compatibility: old records still work and global records are combined
  // with gym-specific records instead of being used only as a fallback.
  const dayRows = await getCollection('scheda_days', { sortField: null, max: 100 });
  const days = dayRows.filter(d => !gymId || !d.gym_id || d.gym_id === gymId)
    .sort((a,b)=>(a.sort_order||0)-(b.sort_order||0));
  const exercises = (await getCollection('exercises', { sortField: null, max: 500 }))
    .filter(e => !gymId || !e.gym_id || e.gym_id === gymId)
    .sort((a,b)=>(a.sort_order||0)-(b.sort_order||0));
  return days.map(day => ({ ...day, exercises: exercises.filter(e => e.scheda_day_id === day.id) }));
}

export async function fetchHomeWorkoutExercises({ gymId = null } = {}) {
  const exercises = await getCollection('exercises', { sortField: null, max: 500 });
  return exercises
    .filter(exercise => !gymId || !exercise.gym_id || exercise.gym_id === gymId)
    .sort((a, b) => (a.sort_order ?? Number.MAX_SAFE_INTEGER) - (b.sort_order ?? Number.MAX_SAFE_INTEGER)
      || String(a.name || '').localeCompare(String(b.name || '')));
}

export async function fetchCorsi({ gymId = null } = {}) {
  const courses = await getCollection('courses', { sortField: null, max: 100 });
  return courses.filter(c => !gymId || !c.gym_id || c.gym_id === gymId)
    .sort((a, b) => String(a.name || '').localeCompare(String(b.name || '')))
    .map(course => ({ ...course, created_at: toPlainDate(course.created_at) }));
}

export async function fetchCorsoById(id) {
  const snapshot = await getDoc(doc(db, 'courses', String(id)));
  if (!snapshot.exists()) throw new Error('Corso non trovato');
  return { ...toData(snapshot), created_at: toPlainDate(snapshot.data().created_at) };
}

export async function fetchOccupancy(gymId) {
  if (!gymId) return [];
  const snapshot = await getDocs(query(collection(db, 'occupancy'), limit(100)));
  return snapshot.docs.map(toData).filter(x => !x.gym_id || x.gym_id === gymId).sort((a, b) => a.hour - b.hour);
}

export async function fetchNotifications({ gymId = null, max = 30 } = {}) {
  try {
    const values = await getCollection('notifications', { sortField: null, max: Math.max(max, 100) });
    return values.filter(x => !gymId || !x.gym_id || x.gym_id === gymId)
      .sort((a,b)=>String(b.created_at).localeCompare(String(a.created_at))).slice(0,max);
  } catch (error) { console.error('fetchNotifications', error); return []; }
}

export async function fetchPromos({ gymId = null, max = 30 } = {}) {
  try {
    const values = await getCollection('promos', { sortField: null, max: Math.max(max, 100) });
    return values.filter(p => p.active !== false && (!gymId || !p.gym_id || p.gym_id === gymId)).slice(0,max);
  } catch (error) { console.error('fetchPromos', error); return []; }
}

export async function fetchPromoById(id) {
  const snapshot = await getDoc(doc(db, 'promos', String(id)));
  if (!snapshot.exists()) throw new Error('Promozione non trovata');
  return toData(snapshot);
}

export async function fetchEvents({ gymId = null, max = 30 } = {}) {
  try {
    const values = await getCollection('events', { sortField: null, max: Math.max(max, 100) });
    return values.filter(x => !gymId || !x.gym_id || x.gym_id === gymId)
      .sort((a,b)=>String(a.date).localeCompare(String(b.date))).slice(0,max);
  } catch (error) { console.error('fetchEvents', error); return []; }
}

export async function fetchEventById(id) {
  const snapshot = await getDoc(doc(db, 'events', String(id)));
  if (!snapshot.exists()) throw new Error('Evento non trovato');
  return toData(snapshot);
}

export async function joinEvent(eventId, userId) {
  const participant = { event_id: String(eventId), user_id: String(userId), created_at: new Date().toISOString() };
  const result = await addDoc(collection(db, 'event_participants'), participant);
  return { id: result.id, ...participant };
}


export async function fetchAttendanceStats(userId, gymId, { days = 180 } = {}) {
  if (!userId) return { week: 0, month: 0, total: 0, recent: [] };
  try {
    let snapshot = await getDocs(query(collection(db, 'gym_checkins'), where('user_id', '==', userId), limit(500)));
    // Accept the older/alternative collection name too, so the client can work
    // with an existing turnstile integration without migrating data immediately.
    if (snapshot.empty) snapshot = await getDocs(query(collection(db, 'attendance'), where('user_id', '==', userId), limit(500)));
    const now = new Date();
    const cutoff = new Date(now); cutoff.setDate(cutoff.getDate() - days);
    const rows = snapshot.docs.map(toData).filter(row => {
      if (gymId && row.gym_id && row.gym_id !== gymId) return false;
      const raw = row.scanned_at || row.created_at || row.timestamp;
      const date = raw?.toDate ? raw.toDate() : new Date(raw);
      return !Number.isNaN(date.getTime()) && date >= cutoff;
    }).sort((a,b) => new Date(b.scanned_at || b.created_at || b.timestamp) - new Date(a.scanned_at || a.created_at || a.timestamp));
    const startOfWeek = new Date(now); const day = (startOfWeek.getDay() + 6) % 7; startOfWeek.setHours(0,0,0,0); startOfWeek.setDate(startOfWeek.getDate() - day);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const toDate = row => { const raw=row.scanned_at||row.created_at||row.timestamp; return raw?.toDate ? raw.toDate() : new Date(raw); };
    return {
      week: rows.filter(r => toDate(r) >= startOfWeek).length,
      month: rows.filter(r => toDate(r) >= startOfMonth).length,
      total: rows.length,
      recent: rows.slice(0, 10),
    };
  } catch (error) {
    console.error('fetchAttendanceStats', error);
    return { week: 0, month: 0, total: 0, recent: [] };
  }
}

export async function fetchPayments(userId, max = 50) {
  if (!userId) return [];
  try {
    const snapshot = await getDocs(query(collection(db, 'payments'), where('user_id', '==', userId), limit(max)));
    return snapshot.docs.map(toData).sort((a,b) => String(b.paid_at || b.created_at || '').localeCompare(String(a.paid_at || a.created_at || '')));
  } catch (error) {
    console.error('fetchPayments', error);
    return [];
  }
}

export async function requestMembershipRenewal(userId, gymId, membership) {
  if (!userId) throw new Error('Utente non valido');
  const payload = {
    user_id: userId, gym_id: gymId || null, membership_plan: membership?.plan || '',
    current_expiry: membership?.expires_at || null, status: 'pending', created_at: new Date().toISOString(),
  };
  const result = await addDoc(collection(db, 'membership_renewal_requests'), payload);
  return { id: result.id, ...payload };
}
