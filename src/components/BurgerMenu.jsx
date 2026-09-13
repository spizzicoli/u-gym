import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import HomeIcon from '@mui/icons-material/HomeRounded';
import NotificationsIcon from '@mui/icons-material/NotificationsRounded';
import LocalOfferIcon from '@mui/icons-material/LocalOfferRounded';
import EventIcon from '@mui/icons-material/EventRounded';
import PersonIcon from '@mui/icons-material/PersonRounded';
import GroupsIcon from '@mui/icons-material/Groups';
import './BurgerMenu.scss';

const LINKS = [
  { to: '/', label: 'Home', icon: <HomeIcon /> },
  { to: '/notifications', label: 'Notifiche', icon: <NotificationsIcon /> },
  { to: '/promo', label: 'Promo', icon: <LocalOfferIcon /> },
  { to: '/eventi', label: 'Eventi', icon: <EventIcon /> },
  { to: '/community', label: 'Community', icon: <GroupsIcon /> },
  { to: '/profile', label: 'Profilo', icon: <PersonIcon /> },
];

export default function BurgerMenu() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  function handleNav(to) {
    navigate(to);
    setOpen(false);
  }

  return (
    <>
      <button
        className="burger-button"
        onClick={() => setOpen(o => !o)}
        aria-label="Menu"
      >
        {open ? <CloseIcon /> : <MenuIcon />}
      </button>

      <div className={`burger-overlay ${open ? 'open' : ''}`}>
        <div className="burger-panel">
          <h2 className="burger-panel__title">U-GYM</h2>
          <nav className="burger-nav">
            {LINKS.map(link => (
              <button
                key={link.to}
                className={`burger-nav__item ${
                  location.pathname === link.to ? 'active' : ''
                }`}
                onClick={() => handleNav(link.to)}
              >
                <span className="burger-nav__icon">{link.icon}</span>
                <span className="burger-nav__label">{link.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>
    </>
  );
}
