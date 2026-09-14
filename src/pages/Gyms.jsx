import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TextField, InputAdornment, CircularProgress } from '@mui/material';
import SearchIcon from '@mui/icons-material/SearchRounded';
import LocationOnIcon from '@mui/icons-material/LocationOnRounded';
import MyLocationIcon from '@mui/icons-material/MyLocationRounded';
import CheckCircleIcon from '@mui/icons-material/CheckCircleRounded';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenterRounded';
import { useApp } from '../context/AppContext';
import { useData } from '../hooks/useData';
import { fetchGyms } from '../lib/api';
import './Gyms.scss';

export default function Gyms({ firstTime }) {
  const navigate = useNavigate();
  const { selectGym, selectedGym } = useApp();
  const [query, setQuery] = useState('');
  const [locating, setLocating] = useState(false);
  const [chosen, setChosen] = useState(null);

  const { data: gyms, loading, error } = useData(fetchGyms);

  const useLocation = async () => {
    setLocating(true);
    try {
      await new Promise(r => setTimeout(r, 1000));
      // In prod: usa Capacitor Geolocation per ottenere lat/lng reali
    } catch {}
    setLocating(false);
  };

  const filtered = (gyms || []).filter(g =>
    String(g.name || '').toLowerCase().includes(query.toLowerCase()) ||
    String(g.address || '').toLowerCase().includes(query.toLowerCase())
  );

  const confirmGym = () => {
    if (!chosen) return;
    selectGym(chosen);
    navigate('/');
  };

  return (
    <div className="gyms-page">
      <div className="gyms-header">
        <div className="gyms-header__logo"><FitnessCenterIcon /></div>
        <div>
          <h1 className="gyms-header__title">
            {firstTime ? 'Scegli la tua Palestra' : 'Le tue Palestre'}
          </h1>
          {firstTime && (
            <p className="gyms-header__sub">Seleziona almeno una sede per continuare</p>
          )}
        </div>
      </div>

      <div className="gyms-search">
        <TextField
          placeholder="Cerca per nome o città..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: '#8a8f99' }} />
              </InputAdornment>
            ),
            style: { background: '#1a1c1f' }
          }}
        />
        <button className="gyms-locate-btn" onClick={useLocation} disabled={locating}>
          {locating
            ? <CircularProgress size={18} sx={{ color: '#3ddc84' }} />
            : <MyLocationIcon />
          }
          {locating ? 'Localizzando...' : 'Usa la mia posizione'}
        </button>
      </div>

      {loading && (
        <div className="gyms-loading">
          <CircularProgress sx={{ color: '#3ddc84' }} />
          <p>Caricamento palestre...</p>
        </div>
      )}

      {error && (
        <div className="gyms-error">
          ⚠️ {error.includes('permission') || error.includes('insufficient')
            ? 'Firebase ha negato la lettura. Pubblica le regole Firestore del progetto u-gym-52fce.'
            : error}
        </div>
      )}

      <div className="gyms-list">
        {filtered.map(gym => (
          <button
            key={gym.id}
            className={`gym-card ${chosen?.id === gym.id ? 'gym-card--selected' : ''} ${selectedGym?.id === gym.id ? 'gym-card--current' : ''}`}
            onClick={() => setChosen(gym)}
          >
            <div className="gym-card__top">
              <div className="gym-card__info">
                <h3 className="gym-card__name">{gym.name}</h3>
                <p className="gym-card__address">
                  <LocationOnIcon sx={{ fontSize: '0.9rem' }} />
                  {gym.address}
                </p>
              </div>
              <div className="gym-card__right">
                {gym.distance && <span className="gym-card__distance">{gym.distance}</span>}
                <span className={`gym-card__status ${gym.open ? 'open' : 'closed'}`}>
                  {gym.open ? 'Aperta' : 'Chiusa'}
                </span>
              </div>
            </div>
            <div className="gym-card__bottom">
              <span className="gym-card__hours">{gym.hours}</span>
              <span className="gym-card__members">{gym.members} iscritti</span>
            </div>
            {chosen?.id === gym.id && (
              <div className="gym-card__check">
                <CheckCircleIcon />
              </div>
            )}
          </button>
        ))}
      </div>

      {chosen && (
        <div className="gyms-confirm">
          <button className="btn-primary" onClick={confirmGym}>
            CONFERMA — {chosen.name}
          </button>
        </div>
      )}
    </div>
  );
}