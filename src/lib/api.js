import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  setDoc,
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

const toPlainDate = (value) => {
  if (value?.toDate) return value.toDate().toISOString();
  return value || null;
};

const getCollection = async (name, sortField = null) => {
  const reference = collection(db, name);
  const queryRef = sortField ? query(reference, orderBy(sortField)) : reference;
  const snapshot = await getDocs(queryRef);
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
    username: username.trim(),
    email: email.trim(),
    role: role === 'cliente' ? 'client' : role,
    trainer_id: null,
    created_at: new Date().toISOString(),
  };

  await setDoc(doc(db, 'users', credential.user.uid), profile);
  return userData(profile, credential.user.uid);
}

export async function loginUser(credential, password) {
  let email = credential.trim();

  if (!email.includes('@')) {
    const snapshot = await getDocs(query(
      collection(db, 'users'),
      where('username', '==', email),
      limit(1),
    ));
    if (snapshot.empty) throw new Error('Credenziali non valide');
    email = snapshot.docs[0].data().email;
  }

  const result = await signInWithEmailAndPassword(auth, email, password);
  const profileSnapshot = await getDoc(doc(db, 'users', result.user.uid));
  const profile = profileSnapshot.exists()
    ? profileSnapshot.data()
    : { email: result.user.email, role: 'client' };

  return userData(profile, result.user.uid);
}

export async function logoutUser() {
  await signOut(auth);
}

export async function fetchGyms() {
  const gyms = await getCollection('gyms');
  return gyms.sort((a, b) => String(a.name || '').localeCompare(String(b.name || '')));
}

export async function fetchScheda() {
  const days = await getCollection('scheda_days', 'sort_order');
  const exercises = await getCollection('exercises', 'sort_order');

  return days.map((day) => ({
    ...day,
    exercises: exercises.filter((exercise) => exercise.scheda_day_id === day.id),
  }));
}

export async function fetchCorsi() {
  const courses = await getCollection('courses', 'name');
  return courses.map((course) => ({ ...course, created_at: toPlainDate(course.created_at) }));
}

export async function fetchCorsoById(id) {
  const snapshot = await getDoc(doc(db, 'courses', String(id)));
  if (!snapshot.exists()) throw new Error('Corso non trovato');
  return { ...toData(snapshot), created_at: toPlainDate(snapshot.data().created_at) };
}

export async function fetchOccupancy(gymId) {
  const snapshot = await getDocs(query(collection(db, 'occupancy'), where('gym_id', '==', gymId)));
  return snapshot.docs.map(toData).sort((a, b) => a.hour - b.hour);
}

export async function fetchNotifications() {
  const values = await getCollection('notifications');
  return values.sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)));
}

export async function fetchPromos() {
  const values = await getCollection('promos');
  return values
    .filter((promo) => promo.active)
    .sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)));
}

export async function fetchPromoById(id) {
  const snapshot = await getDoc(doc(db, 'promos', String(id)));
  if (!snapshot.exists()) throw new Error('Promozione non trovata');
  return toData(snapshot);
}

export async function fetchEvents() {
  const values = await getCollection('events');
  return values.sort((a, b) => String(a.date).localeCompare(String(b.date)));
}

export async function fetchEventById(id) {
  const snapshot = await getDoc(doc(db, 'events', String(id)));
  if (!snapshot.exists()) throw new Error('Evento non trovato');
  return toData(snapshot);
}

export async function joinEvent(eventId, userId) {
  const participant = {
    event_id: String(eventId),
    user_id: String(userId),
    created_at: new Date().toISOString(),
  };
  const result = await addDoc(collection(db, 'event_participants'), participant);
  return { id: result.id, ...participant };
}

