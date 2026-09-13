import {
  addDoc,
  collection,
  onSnapshot,
  query,
  where,
} from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { db, storage } from './firebase';

const normalizeMessage = (snapshot) => {
  const data = snapshot.data();
  return {
    id: snapshot.id,
    ...data,
    created_at: data.created_at?.toDate?.()?.toISOString() || data.created_at,
    username: data.username || 'Utente',
  };
};

export function subscribeToMessages(collectionName, trainerId, onMessages, onError) {
  const constraints = trainerId ? [where('trainer_id', '==', trainerId)] : [];
  const messagesQuery = query(collection(db, collectionName), ...constraints);

  return onSnapshot(messagesQuery, (snapshot) => {
    const messages = snapshot.docs
      .map(normalizeMessage)
      .sort((a, b) => String(a.created_at).localeCompare(String(b.created_at)));
    onMessages(messages);
  }, onError);
}

export async function sendChatMessage(collectionName, message) {
  const result = await addDoc(collection(db, collectionName), {
    ...message,
    created_at: new Date().toISOString(),
  });
  return { id: result.id, ...message };
}

export async function uploadChatFile(file, userId, conversation) {
  const fileRef = ref(storage, `chat-images/${conversation}/${userId}-${Date.now()}-${file.name}`);
  await uploadBytes(fileRef, file);
  return getDownloadURL(fileRef);
}
