import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import AccessTimeIcon from '@mui/icons-material/AccessTimeRounded';
import PersonIcon from '@mui/icons-material/PersonRounded';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonthRounded';

import { fetchCorsi } from '../lib/api';
import './Corsi.scss';

export default function Corsi() {
  const navigate = useNavigate();
  const [corsi, setCorsi] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchCorsi();
        setCorsi(data);
      } catch (err) {
        console.error('Errore nel recupero corsi:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="corsi-page page-container">
        <h1 className="page-title">I nostri <span>Corsi</span></h1>
        <p>Caricamento...</p>
      </div>
    );
  }

  return (
    <div className="corsi-page page-container">
      <h1 className="page-title">I nostri <span>Corsi</span></h1>

      <div className="corsi-list">
        {corsi.map(corso => (
          <button
            key={corso.id}
            className="corso-card"
            onClick={() => navigate(`/corsi/${corso.id}`)}
          >
            <div className="corso-card__top">
              <h3 className="corso-card__name">{corso.name}</h3>
              <span
                className="corso-card__tag"
                style={{ '--tag-color': corso.tag_color }}
              >
                {corso.tag}
              </span>
            </div>

            <p className="corso-card__desc">
              {corso.description.slice(0, 80)}...
            </p>

            <div className="corso-card__meta">
              <span className="corso-card__meta-item">
                <PersonIcon sx={{ fontSize: '0.9rem' }} />
                {corso.coach}
              </span>
              <span className="corso-card__meta-item">
                <CalendarMonthIcon sx={{ fontSize: '0.9rem' }} />
                {corso.schedule.split('—')[0].trim()}
              </span>
              <span className="corso-card__meta-item">
                <AccessTimeIcon sx={{ fontSize: '0.9rem' }} />
                {corso.duration}
              </span>
            </div>

            <div className="corso-card__footer">
              <div className="corso-card__spots">
                <div className="corso-spots-bar">
                  <div
                    className="corso-spots-bar__fill"
                    style={{
                      width: `${((corso.max_spots - corso.spots) / corso.max_spots) * 100}%`
                    }}
                  />
                </div>
                <span className="corso-spots-text">
                  {corso.spots > 0 ? `${corso.spots} posti liberi` : 'Esaurito'}
                </span>
              </div>

              <span className="corso-card__price">
                €{corso.price}/mese
              </span>
            </div>

            {corso.enrolled && (
              <div className="corso-card__enrolled">✓ Iscritto</div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
