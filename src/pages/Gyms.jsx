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

function haversineDistanceKm(latitude, longitude, targetLatitude, targetLongitude) {
  const earthRadiusKm = 6371;
  const toRadians = value => value * Math.PI / 180;
  const latitudeDifference = toRadians(targetLatitude - latitude);
  const longitudeDifference = toRadians(targetLongitude - longitude);
  const calculation = Math.sin(latitudeDifference / 2) ** 2
    + Math.cos(toRadians(latitude))
    * Math.cos(toRadians(targetLatitude))
    * Math.sin(longitudeDifference / 2) ** 2;
  return 2 * earthRadiusKm * Math.atan2(Math.sqrt(calculation), Math.sqrt(1 - calculation));
}

function hasValidCoordinates(gym) {
  return typeof gym.latitude === 'number'
    && Number.isFinite(gym.latitude)
    && gym.latitude >= -90
    && gym.latitude <= 90
    && typeof gym.longitude === 'number'
    && Number.isFinite(gym.longitude)
    && gym.longitude >= -180
    && gym.longitude <= 180;
}

function normalizeSearchText(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLocaleLowerCase('it');
}

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

  const search = normalizeSearchText(query);
  const filtered = (gyms || []).filter(g =>
    normalizeSearchText(g.name).includes(search)
    || normalizeSearchText(g.address).includes(search)
  );

  const sortedGyms = [...filtered].map(g => {
    if (!position || !hasValidCoordinates(g)) return g;
    const distance = haversineDistanceKm(position.latitude, position.longitude, g.latitude, g.longitude);
    return { ...g, distance_km: distance };
  }).sort((a, b) => {
    if (position && Number.isFinite(a.distance_km) && Number.isFinite(b.distance_km)) {
      return a.distance_km - b.distance_km;
    }
    if (position && Number.isFinite(a.distance_km)) return -1;
    if (position && Number.isFinite(b.distance_km)) return 1;
    return String(a.name || '').localeCompare(String(b.name || ''));
  });

  const confirmGym = () => {
    if (!chosen) return;
    const { distance_km, ...gym } = chosen;
    selectGym(gym);
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
        <div className="gyms-loading" role="status">
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

      {locationMessage && (
        <div className="gyms-location-message">
          📍 {locationMessage} Le distanze sono stime in linea d&apos;aria basate sulle coordinate della città.
        </div>
      )}

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
                <span className="gym-card__distance">
                  {Number.isFinite(gym.distance_km)
                    ? `${gym.distance_km.toFixed(1)} km`
                    : position ? 'Coordinate non disponibili' : 'Attiva posizione'}
                </span>
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
        {!loading && !error && sortedGyms.length === 0 && (
          <p className="gyms-empty">
            {search ? 'Nessuna palestra trovata. Prova con un altro nome o città.' : 'Nessuna palestra disponibile.'}
          </p>
        )}
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