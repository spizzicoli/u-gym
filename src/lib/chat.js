import {
  addDoc,
  collection,
  limit,
  onSnapshot,
  query,
  where,
} from 'firebase/firestore';
import { db } from './firebase';

const normalizeMessage = (snapshot) => {
  const data = snapshot.data();
  return {
    id: snapshot.id,
    ...data,
    created_at: data.created_at?.toDate?.()?.toISOString() || data.created_at || new Date().toISOString(),
    username: data.username || 'Utente',
  };
};

export function subscribeToMessages({ type = 'community', userId, trainerId = null, gymId = null, onMessages, onError }) {
  const constraints = [];
  if (type === 'trainer') {
    if (!userId || !trainerId) return () => {};
    constraints.push(where('user_id', '==', userId), where('trainer_id', '==', trainerId));
  } else if (gymId) {
    constraints.push(where('gym_id', '==', gymId));
  }
  constraints.push(limit(60));
  const messagesQuery = query(collection(db, type === 'trainer' ? 'pt_messages' : 'community_messages'), ...constraints);
  return onSnapshot(messagesQuery, (snapshot) => {
    const messages = snapshot.docs
      .map(normalizeMessage)
      .sort((a, b) => String(a.created_at).localeCompare(String(b.created_at)));
    onMessages(messages);
  }, onError);
}

export async function sendChatMessage(collectionName, message) {
  // Firestore stores emoji and Unicode text safely as strings; trim only surrounding whitespace.
  const safeMessage = typeof message.message === 'string'
    ? { ...message, message: message.message.trim() }
    : message;
  const result = await addDoc(collection(db, collectionName), {
    ...safeMessage,
    created_at: new Date().toISOString(),
  });
  return { id: result.id, ...safeMessage };
}
