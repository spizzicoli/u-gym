import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import PersonIcon from '@mui/icons-material/PersonRounded';
import AccessTimeIcon from '@mui/icons-material/AccessTimeRounded';
import TrendingUpIcon from '@mui/icons-material/TrendingUpRounded';
import WhatshotIcon from '@mui/icons-material/WhatshotRounded';
import { fetchNotifications } from '../lib/api';
import { useNavigate } from 'react-router-dom';
import './Home.scss';

const OCCUPANCY_HOURS = [
  { h: '6', v: 20 }, { h: '7', v: 55 }, { h: '8', v: 80 }, { h: '9', v: 70 },
  { h: '10', v: 45 }, { h: '11', v: 35 }, { h: '12', v: 25 }, { h: '13', v: 30 },
  { h: '14', v: 50 }, { h: '15', v: 60 }, { h: '16', v: 75 }, { h: '17', v: 90 },
  { h: '18', v: 95 }, { h: '19', v: 85 }, { h: '20', v: 65 }, { h: '21', v: 40 },
];

function getLevel(pct) {
  if (pct < 30) return { label: 'Vuota', color: '#3ddc84', emoji: '🟢' };
  if (pct < 60) return { label: 'Moderata', color: '#faad14', emoji: '🟡' };
  if (pct < 85) return { label: 'Affollata', color: '#ff7c4d', emoji: '🟠' };
  return { label: 'Piena', color: '#ff4d4f', emoji: '🔴' };
}

export default function Home() {
  const { user, selectedGym } = useApp();
  const [now] = useState(new Date());
  const currentHour = now.getHours();
  const navigate = useNavigate();

  const currentEntry = OCCUPANCY_HOURS.find(e => parseInt(e.h) === currentHour)
    || { v: 40 };
  const occupancy = currentEntry.v;
  const level = getLevel(occupancy);
  const present = Math.round((occupancy / 100) * (selectedGym?.members || 300));

  const [news, setNews] = useState([]);

  useEffect(() => {
    fetchNotifications().then(setNews);
  }, []);

  return (
    <div className="home-page page-container">
      <div className="home-greeting">
        <p className="home-greeting__sub">Buongiorno,</p>
        <h1 className="home-greeting__name">{user?.username || 'Atleta'} <span>💪</span></h1>
      </div>

      {/* Occupancy card */}
      <div className="home-gym-card">
        <div className="home-gym-card__header">
          <div>
            <p className="home-gym-card__gym-name">{selectedGym?.name || 'U-GYM'}</p>
            <p className="home-gym-card__hours">
              <AccessTimeIcon sx={{ fontSize: '0.9rem' }} />
              {selectedGym?.hours || '06:00 – 22:00'}
            </p>
          </div>
          <div className="home-gym-card__status" style={{ '--lvl-color': level.color }}>
            <span className="home-gym-card__emoji">{level.emoji}</span>
            <span>{level.label}</span>
          </div>
        </div>

        <div className="home-occupancy">
          <div className="home-occupancy__ring" style={{ '--pct': occupancy, '--color': level.color }}>
            <svg viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="42" className="track" />
              <circle
                cx="50" cy="50" r="42"
                className="fill"
                strokeDasharray={`${occupancy * 2.638} 263.8`}
                style={{ stroke: level.color }}
              />
            </svg>
            <div className="home-occupancy__center">
              <span className="home-occupancy__pct">{occupancy}%</span>
              <span className="home-occupancy__sub">occupazione</span>
            </div>
          </div>

          <div className="home-occupancy__stats">
            <div className="home-stat">
              <PersonIcon sx={{ color: '#8a8f99', fontSize: '1.1rem' }} />
              <div>
                <p className="home-stat__val">{present}</p>
                <p className="home-stat__label">presenti ora</p>
              </div>
            </div>
            <div className="home-stat">
              <TrendingUpIcon sx={{ color: '#8a8f99', fontSize: '1.1rem' }} />
              <div>
                <p className="home-stat__val">{currentHour + 1}:00</p>
                <p className="home-stat__label">prossima ora</p>
              </div>
            </div>
            <div className="home-stat">
              <WhatshotIcon sx={{ color: '#ff7c4d', fontSize: '1.1rem' }} />
              <div>
                <p className="home-stat__val">18:00</p>
                <p className="home-stat__label">picco oggi</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bar chart */}
        <div className="home-chart">
          <p className="home-chart__label">Affluenza giornaliera</p>
          <div className="home-chart__bars">
            {OCCUPANCY_HOURS.map(({ h, v }) => {
              const active = parseInt(h) === currentHour;
              const lvl = getLevel(v);
              return (
                <div key={h} className={`home-chart__bar-wrap ${active ? 'active' : ''}`}>
                  <div
                    className="home-chart__bar"
                    style={{ height: `${v}%`, background: active ? lvl.color : undefined }}
                  />
                  <span className="home-chart__h">{h}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* News */}
      <h2 className="home-section-title">Novità</h2>
      <div className="home-news">
        {news.map(n => (
          <div
            key={n.id}
            className="home-news-item"
            onClick={() => {
              if (n.type === 'course') navigate(`/corsi/${n.ref_id}`);
              if (n.type === 'promo') navigate(`/promo/${n.ref_id}`);
              if (n.type === 'event') navigate(`/eventi/${n.ref_id}`);
            }}
          >
            <span className="home-news-item__tag">{n.type}</span>
            <p className="home-news-item__title">{n.title}</p>
            <span className="home-news-item__time">{n.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
