import { useNavigate, useLocation } from 'react-router-dom';
import HomeIcon from '@mui/icons-material/HomeRounded';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenterRounded';
import QrCodeIcon from '@mui/icons-material/QrCode2Rounded';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonthRounded';
import LocationOnIcon from '@mui/icons-material/LocationOnRounded';
import './BottomNav.scss';

const tabs = [
  { path: '/', label: 'Home', icon: HomeIcon },
  { path: '/scheda', label: 'Scheda', icon: FitnessCenterIcon },
  { path: '/badge', label: 'Badge', icon: QrCodeIcon },
  { path: '/corsi', label: 'Corsi', icon: CalendarMonthIcon },
  { path: '/gyms', label: 'Palestre', icon: LocationOnIcon },
];

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav className="bottom-nav">
      {tabs.map(({ path, label, icon: Icon }) => {
        const active = location.pathname === path;
        return (
          <button
            key={path}
            className={`bottom-nav__item ${active ? 'active' : ''}`}
            onClick={() => navigate(path)}
          >
            <span className="bottom-nav__icon">
              <Icon />
            </span>
            <span className="bottom-nav__label">{label}</span>
            {active && <span className="bottom-nav__dot" />}
          </button>
        );
      })}
    </nav>
  );
}
