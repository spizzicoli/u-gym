import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { AppProvider, useApp } from './context/AppContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Gyms from './pages/Gyms';
import Home from './pages/Home';
import Scheda from './pages/Scheda';
import Badge from './pages/Badge';
import Corsi from './pages/Corsi';
import CorsoDetail from './pages/CorsoDetail';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Notifications from './pages/Notifications';
import PromoList from './pages/PromoList';
import PromoDetail from './pages/PromoDetail';
import EventList from './pages/EventList';
import EventDetail from './pages/EventDetail';
import Profile from './pages/Profile';
import BurgerMenu from './components/BurgerMenu';
import BottomNav from './components/BottomNav';
import CommunityPage from "./pages/CommunityPage";
import HomeWorkout from './pages/HomeWorkout';
import Progressi from './pages/Progressi';
import SeedData from './pages/SeedData';
import './styles/global.scss';

const muiTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#3ddc84' },
    background: { default: '#111214', paper: '#1a1c1f' },
  },
  typography: { fontFamily: 'Inter, sans-serif' },
  components: {
    MuiTextField: {
      defaultProps: { variant: 'outlined', fullWidth: true },
    },
  },
});

function AppRoutes() {
  const { user, gymSelected, authReady } = useApp();

  if (!authReady) return null;

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  if (!gymSelected) {
    return (
      <Routes>
        <Route path="/seed-data" element={<SeedData />} />
        <Route path="/gyms" element={<Gyms firstTime />} />
        <Route path="*" element={<Navigate to="/gyms" replace />} />
      </Routes>
    );
  }

  return (
    <>
      <BurgerMenu />
      <Routes>
        <Route path="/seed-data" element={<SeedData />} />
        <Route path="/" element={<Home />} />
        <Route path="/scheda" element={<Scheda />} />
        <Route path="/badge" element={<Badge />} />
        <Route path="/corsi" element={<Corsi />} />
        <Route path="/corsi/:id" element={<CorsoDetail />} />
        <Route path="/gyms" element={<Gyms />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/promo" element={<PromoList />} />
        <Route path="/promo/:id" element={<PromoDetail />} />
        <Route path="/eventi" element={<EventList />} />
        <Route path="/eventi/:id" element={<EventDetail />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/community" element={<CommunityPage />} />
        <Route path="/casa" element={<HomeWorkout />} />
        <Route path="/progressi" element={<Progressi />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <BottomNav />
    </>
  );

}

export default function App() {
  return (
    <ThemeProvider theme={muiTheme}>
      <AppProvider>
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <AppRoutes />
        </BrowserRouter>
      </AppProvider>
    </ThemeProvider>
  );
}
