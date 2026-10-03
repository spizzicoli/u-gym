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
import { getCurrentDevicePosition } from '../lib/native';
import './Gyms.scss';

export default function Gyms({ firstTime }) {
  const navigate = useNavigate();
  const { selectGym, selectedGym } = useApp();
  const [query, setQuery] = useState('');
  const [locating, setLocating] = useState(false);
  const [chosen, setChosen] = useState(null);
  const [position, setPosition] = useState(null);
  const [locationMessage, setLocationMessage] = useState('');

  const { data: gyms, loading, error } = useData(fetchGyms);

  const useLocation = async () => {
    setLocating(true);
    setLocationMessage('');
    try {
      const coords = await getCurrentDevicePosition();
      setPosition(coords);
      setLocationMessage('Posizione rilevata: elenco ordinato per distanza.');
    } catch (error) {
      setLocationMessage(error.message || 'Non riesco a rilevare la posizione. Controlla i permessi del dispositivo.');
    } finally { setLocating(false); }
  };

  const haversine = (lat1, lon1, lat2, lon2) => {
    const R = 6371; const toRad = v => v * Math.PI / 180;
    const dLat = toRad(lat2 - lat1); const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat/2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon/2) ** 2;
    return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  };

  const filtered = (gyms || []).filter(g =>
    String(g.name || '').toLowerCase().includes(query.toLowerCase()) ||
    String(g.address || '').toLowerCase().includes(query.toLowerCase())
  );

  const sortedGyms = [...filtered].map(g => {
    const hasCoords = Number.isFinite(Number(g.latitude)) && Number.isFinite(Number(g.longitude)) && position;
    if (!hasCoords) return g;
    const distance = haversine(position.latitude, position.longitude, Number(g.latitude), Number(g.longitude));
    return { ...g, distance_km: distance, distance: `${distance.toFixed(1)} km` };
  }).sort((a, b) => {
    if (position && Number.isFinite(a.distance_km) && Number.isFinite(b.distance_km)) return a.distance_km - b.distance_km;
    return String(a.name || '').localeCompare(String(b.name || ''));
  });

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
            ? <CircularProgress size={18} sx={{ color: 'var(--color-green)' }} />
            : <MyLocationIcon />
          }
          {locating ? 'Localizzando...' : 'Usa la mia posizione'}
        </button>
      </div>

      {loading && (
        <div className="gyms-loading">
          <CircularProgress sx={{ color: 'var(--color-green)' }} />
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

      {locationMessage && <div className="gyms-location-message">📍 {locationMessage}</div>}

      <div className="gyms-list">
        {sortedGyms.map(gym => (
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