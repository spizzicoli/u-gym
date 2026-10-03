import { Capacitor, registerPlugin } from '@capacitor/core';
import { Geolocation } from '@capacitor/geolocation';
import { doc, setDoc } from 'firebase/firestore';
import { db } from './firebase';

const PushNotifications = registerPlugin('PushNotifications');
const Calendar = registerPlugin('Calendar');
const LocalNotifications = registerPlugin('LocalNotifications');
const isNative = () => Capacitor.isNativePlatform();
const LOCATION_REQUEST_TIMEOUT_MS = 25000;

function withLocationTimeout(promise) {
  let timeoutId;
  const timeout = new Promise((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error(
      'Richiesta posizione scaduta. Verifica che i Servizi di localizzazione siano attivi e riprova.'
    )), LOCATION_REQUEST_TIMEOUT_MS);
  });

  return Promise.race([promise, timeout]).finally(() => clearTimeout(timeoutId));
}

async function tokenKey(token) {
  const data = new TextEncoder().encode(token);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest)).map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function setupPushNotifications(userId) {
  if (!userId || !isNative()) return { enabled: false, reason: 'web' };
  try {
    let permission = await PushNotifications.checkPermissions();
    if (permission.receive === 'prompt' || permission.receive === 'prompt-with-rationale') {
      permission = await PushNotifications.requestPermissions();
    }
    if (permission.receive !== 'granted') return { enabled: false, reason: 'denied' };
    await PushNotifications.removeAllListeners();
    await PushNotifications.createChannel?.({
      id: 'ugym', name: 'U-GYM', description: 'Messaggi, allenamenti e comunicazioni U-GYM',
      importance: 4, visibility: 1, vibration: true,
    });
    await PushNotifications.addListener('registration', async ({ value }) => {
      try {
        const id = await tokenKey(value);
        await setDoc(doc(db, 'users', userId, 'devices', id), {
          token: value, platform: Capacitor.getPlatform(), updated_at: new Date().toISOString(),
        }, { merge: true });
      } catch (e) { console.error('Salvataggio token push:', e); }
    });
    await PushNotifications.addListener('registrationError', error => console.error('U-GYM push registration:', error));
    await PushNotifications.addListener('pushNotificationReceived', notification => {
      window.dispatchEvent(new CustomEvent('ugym:push', { detail: notification }));
    });
    await PushNotifications.register();
    return { enabled: true };
  } catch (error) {
    console.error('U-GYM push setup:', error);
    return { enabled: false, reason: error?.message || 'setup-error' };
  }
}

export async function getCurrentDevicePosition() {
  if (isNative()) {
    let permissions = await withLocationTimeout(Geolocation.checkPermissions());
    if (permissions.location !== 'granted') {
      permissions = await withLocationTimeout(Geolocation.requestPermissions());
    }
    if (permissions.location !== 'granted') throw new Error('Permesso di posizione negato.');
    const position = await withLocationTimeout(Geolocation.getCurrentPosition({
      enableHighAccuracy: true,
      maximumAge: 30000,
      timeout: 15000,
    }));
    return { latitude: position.coords.latitude, longitude: position.coords.longitude, accuracy: position.coords.accuracy };
  }
  if (!navigator.geolocation) throw new Error('Geolocalizzazione non supportata dal dispositivo.');
  return withLocationTimeout(new Promise((resolve, reject) => navigator.geolocation.getCurrentPosition(
    ({ coords }) => resolve({ latitude: coords.latitude, longitude: coords.longitude, accuracy: coords.accuracy }),
    error => reject(new Error(error.message || 'Impossibile ottenere la posizione.')),
    { enableHighAccuracy: true, maximumAge: 30000, timeout: 15000 },
  )));
}

export async function addCalendarReminder({ title, start, end, location = '', description = '' }) {
  const startMs = new Date(start).getTime();
  const endMs = new Date(end || (startMs + 60 * 60 * 1000)).getTime();
  if (!Number.isFinite(startMs)) throw new Error('Data evento non valida.');

  if (isNative() && Capacitor.getPlatform() === 'android') {
    return await Calendar.openInsert({ title, start: startMs, end: endMs, location, description });
  }

  // Web/iOS fallback: generate an .ics file the user can open with the device calendar.
  const pad = n => String(n).padStart(2, '0');
  const icsDate = ms => {
    const d = new Date(ms);
    return `${d.getUTCFullYear()}${pad(d.getUTCMonth()+1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`;
  };
  const esc = s => String(s || '').replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');
  const ics = [
    'BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//U-GYM//EN','BEGIN:VEVENT',
    `UID:ugym-${Date.now()}@ugym`,`DTSTAMP:${icsDate(Date.now())}`,`DTSTART:${icsDate(startMs)}`,
    `DTEND:${icsDate(endMs)}`,`SUMMARY:${esc(title)}`,`LOCATION:${esc(location)}`,`DESCRIPTION:${esc(description)}`,
    'END:VEVENT','END:VCALENDAR'
  ].join('\r\n');
  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = 'u-gym-promemoria.ics'; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  return { fallback: true };
}

export async function scheduleWorkoutReminder({ id, title, body, at }) {
  const when = new Date(at).getTime();
  if (!Number.isFinite(when) || when <= Date.now()) throw new Error('Scegli una data e un orario futuri.');
  if (!isNative()) {
    localStorage.setItem('u_gym_web_reminder', JSON.stringify({ id, title, body, at }));
    return { web: true };
  }
  let permission = await LocalNotifications.checkPermissions();
  if (permission.display !== 'granted') permission = await LocalNotifications.requestPermissions();
  if (permission.display !== 'granted') throw new Error('Permesso notifiche locali negato.');
  if (Capacitor.getPlatform() === 'android') {
    await LocalNotifications.createChannel({
      id: 'ugym-workout', name: 'Allenamenti', description: 'Promemoria allenamento', importance: 4,
    });
  }
  await LocalNotifications.schedule({
    notifications: [{
      id: Number(id),
      title,
      body,
      schedule: { at: new Date(when), allowWhileIdle: true },
      channelId: 'ugym-workout',
      sound: 'default',
    }],
  });
  return { native: true };
}

export async function cancelWorkoutReminder(id) {
  if (!isNative()) {
    localStorage.removeItem('u_gym_web_reminder');
    return;
  }
  await LocalNotifications.cancel({ notifications: [{ id: Number(id) }] });
}
