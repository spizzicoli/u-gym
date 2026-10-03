import { createContext, useContext, useEffect, useState } from 'react';
import { logoutUser, updateUserProfile } from '../lib/api';
import { auth, db } from '../lib/firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { setupPushNotifications } from '../lib/native';

const AppContext = createContext(null);
export const THEMES = {
  green: { label: 'U-Gym', accent: '#3ddc84' },
  ocean: { label: 'Ocean', accent: '#38bdf8' },
  violet: { label: 'Violet', accent: '#a78bfa' },
  sunset: { label: 'Sunset', accent: '#fb7185' },
};

function applyTheme(theme) {
  const selected = THEMES[theme] ? theme : 'green';
  document.documentElement.dataset.theme = selected;
  document.documentElement.style.setProperty('--accent', THEMES[selected].accent);
}

export function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [theme, setThemeState] = useState(() => localStorage.getItem('u_gym_theme') || 'green');

  const setTheme = (nextTheme) => {
    const selected = THEMES[nextTheme] ? nextTheme : 'green';
    setThemeState(selected);
    applyTheme(selected);
    localStorage.setItem('u_gym_theme', selected);
    setUser(current => current ? { ...current, theme: selected } : current);
    const saved = localStorage.getItem('u_gym_user');
    if (saved) { try { localStorage.setItem('u_gym_user', JSON.stringify({ ...JSON.parse(saved), theme: selected })); } catch {} }
  };

  useEffect(() => { applyTheme(theme); localStorage.setItem('u_gym_theme', theme); }, [theme]);

  useEffect(() => {
    let active = true;
    const unsubscribe = auth.onAuthStateChanged((firebaseUser) => {
      if (!active) return;
      if (!firebaseUser) {
        setUser(null);
        localStorage.removeItem('u_gym_user');
        setAuthReady(true);
        return;
      }

      let savedUser = null;
      const saved = localStorage.getItem('u_gym_user');
      try {
        savedUser = saved ? JSON.parse(saved) : null;
      } catch (error) {
        console.error('Lettura del profilo locale U-GYM fallita:', error);
      }
      const fallback = {
        id: firebaseUser.uid,
        email: firebaseUser.email,
        role: savedUser?.role || 'client',
        username: savedUser?.username || firebaseUser.email?.split('@')[0] || 'Atleta',
        trainer_id: savedUser?.trainer_id || null,
        theme: savedUser?.theme || 'green',
        weekly_goal: savedUser?.weekly_goal || 3,
        workout_reminders: savedUser?.workout_reminders ?? true,
        age: savedUser?.age ?? '',
        height: savedUser?.height ?? '',
        weight: savedUser?.weight ?? '',
        sex: savedUser?.sex ?? '',
        membership: savedUser?.membership || null,
        membership_plan: savedUser?.membership_plan || '',
        membership_expires_at: savedUser?.membership_expires_at || '',
        membership_status: savedUser?.membership_status || 'active',
      };
      setUser(fallback);
      setThemeState(fallback.theme);
      applyTheme(fallback.theme);
      setAuthReady(true);
      localStorage.setItem('u_gym_theme', fallback.theme);
      localStorage.setItem('u_gym_user', JSON.stringify(fallback));

      const loadProfile = async () => {
        try {
          const snapshot = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (!active) return;
          const profile = snapshot.exists() ? snapshot.data() : {};
          const nextUser = {
            id: firebaseUser.uid,
            email: firebaseUser.email,
            role: profile.role || savedUser?.role || 'client',
            username: profile.username || savedUser?.username || firebaseUser.email?.split('@')[0] || 'Atleta',
            trainer_id: profile.trainer_id || savedUser?.trainer_id || null,
            theme: profile.theme || savedUser?.theme || 'green',
            weekly_goal: profile.weekly_goal || savedUser?.weekly_goal || 3,
            workout_reminders: profile.workout_reminders ?? savedUser?.workout_reminders ?? true,
            age: profile.age ?? savedUser?.age ?? '',
            height: profile.height ?? savedUser?.height ?? '',
            weight: profile.weight ?? savedUser?.weight ?? '',
            sex: profile.sex ?? savedUser?.sex ?? '',
            membership: profile.membership || savedUser?.membership || null,
            membership_plan: profile.membership_plan || savedUser?.membership_plan || '',
            membership_expires_at: profile.membership_expires_at || savedUser?.membership_expires_at || '',
            membership_status: profile.membership_status || savedUser?.membership_status || 'active',
          };
          setUser(nextUser);
          setThemeState(nextUser.theme);
          applyTheme(nextUser.theme);
          localStorage.setItem('u_gym_theme', nextUser.theme);
          localStorage.setItem('u_gym_user', JSON.stringify(nextUser));

          // Keep the portal registry in sync without blocking the app from opening.
          const savedGym = localStorage.getItem('u_gym_gym');
          let selectedGym = null;
          try {
            selectedGym = savedGym ? JSON.parse(savedGym) : null;
          } catch (error) {
            console.error('Lettura della palestra locale U-GYM fallita:', error);
          }
          setDoc(doc(db, 'clients', firebaseUser.uid), {
            uid: firebaseUser.uid,
            name: nextUser.username || firebaseUser.email?.split('@')[0] || 'Cliente',
            email: firebaseUser.email || '',
            ...(selectedGym?.id || profile.gym_id ? { gym_id: selectedGym?.id || profile.gym_id } : {}),
            membership_status: ({ active: 'attivo', 'in scadenza': 'in scadenza', scaduto: 'scaduto', attivo: 'attivo' }[nextUser.membership_status] || 'attivo'),
            membership_expires: nextUser.membership_expires_at || profile.membership_expires_at || '',
            updated_at: serverTimestamp(),
            created_at: profile.created_at || serverTimestamp(),
          }, { merge: true }).catch(error => {
            console.error('Sincronizzazione cliente U-GYM fallita:', error);
          });
          setupPushNotifications(nextUser.id).catch(console.error);
        } catch (error) {
          if (active) console.error('Caricamento profilo:', error);
        }
      };
      loadProfile();
    });
    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  const [selectedGym, setSelectedGym] = useState(() => {
    const saved = localStorage.getItem('u_gym_gym');
    return saved ? JSON.parse(saved) : null;
  });
  const [gymSelected, setGymSelected] = useState(() => localStorage.getItem('u_gym_gym_selected') === 'true');

  const login = (userData) => {
    const next = { weekly_goal: 3, workout_reminders: true, theme: 'green', age: '', height: '', weight: '', sex: '', membership: null, ...userData };
    setUser(next); setThemeState(next.theme || 'green'); applyTheme(next.theme || 'green');
    localStorage.setItem('u_gym_user', JSON.stringify(next));
  };

  const saveProfile = async (updates) => {
    const clean = await updateUserProfile(user.id, updates);
    const next = { ...user, ...clean };
    try { await setDoc(doc(db, 'clients', user.id), { uid: user.id, name: next.username || user.email?.split('@')[0] || 'Cliente', email: user.email || '', ...(clean.membership_status ? { membership_status: clean.membership_status } : {}), ...(clean.membership_expires_at ? { membership_expires: clean.membership_expires_at } : {}), updated_at: serverTimestamp() }, { merge: true }); } catch (e) { console.warn('Aggiornamento registro cliente:', e); }
    setUser(next);
    localStorage.setItem('u_gym_user', JSON.stringify(next));
    if (clean.theme) { setThemeState(clean.theme); applyTheme(clean.theme); localStorage.setItem('u_gym_theme', clean.theme); }
    return next;
  };

  const logout = async () => {
    await logoutUser();
    setUser(null); setGymSelected(false);
    localStorage.removeItem('u_gym_user'); localStorage.removeItem('u_gym_gym_selected');
  };

  const selectGym = async (gym) => {
    setSelectedGym(gym); setGymSelected(true);
    localStorage.setItem('u_gym_gym', JSON.stringify(gym));
    localStorage.setItem('u_gym_gym_selected', 'true');
    if (user?.id) {
      try {
        await setDoc(doc(db, 'clients', user.id), { uid: user.id, gym_id: gym?.id || null, updated_at: serverTimestamp() }, { merge: true });
      } catch (e) {
        console.error('Salvataggio palestra del cliente fallito:', e);
      }
    }
  };

  return <AppContext.Provider value={{ user, login, logout, saveProfile, selectedGym, selectGym, gymSelected, authReady, theme, setTheme }}>
    {children}
  </AppContext.Provider>;
}
export const useApp = () => useContext(AppContext);
