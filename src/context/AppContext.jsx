import { createContext, useContext, useEffect, useState } from 'react';
import { logoutUser } from '../lib/api';
import { auth } from '../lib/firebase';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    return auth.onAuthStateChanged((firebaseUser) => {
      if (!firebaseUser) {
        setUser(null);
        localStorage.removeItem('gt_user');
        setAuthReady(true);
        return;
      }

      const saved = localStorage.getItem('gt_user');
      const savedUser = saved ? JSON.parse(saved) : null;
      const nextUser = savedUser?.id === firebaseUser.uid
        ? savedUser
        : { id: firebaseUser.uid, email: firebaseUser.email, role: 'client', trainer_id: null };

      setUser(nextUser);
      localStorage.setItem('gt_user', JSON.stringify(nextUser));
      setAuthReady(true);
    });
  }, []);

  const [selectedGym, setSelectedGym] = useState(() => {
    const saved = localStorage.getItem('gt_gym');
    return saved ? JSON.parse(saved) : null;
  });

  const [gymSelected, setGymSelected] = useState(() => {
    return localStorage.getItem('gt_gym_selected') === 'true';
  });

  // 🔥 NON sovrascrivere l'id
  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('gt_user', JSON.stringify(userData));
  };

  const logout = async () => {
    await logoutUser();
    setUser(null);
    setGymSelected(false);
    localStorage.removeItem('gt_user');
    localStorage.removeItem('gt_gym_selected');
  };

  const selectGym = (gym) => {
    setSelectedGym(gym);
    setGymSelected(true);
    localStorage.setItem('gt_gym', JSON.stringify(gym));
    localStorage.setItem('gt_gym_selected', 'true');
  };

  return (
    <AppContext.Provider value={{ user, login, logout, selectedGym, selectGym, gymSelected, authReady }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
