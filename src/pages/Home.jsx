import { useEffect, useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import PersonIcon from '@mui/icons-material/PersonRounded';
import AccessTimeIcon from '@mui/icons-material/AccessTimeRounded';
import TrendingUpIcon from '@mui/icons-material/TrendingUpRounded';
import WhatshotIcon from '@mui/icons-material/WhatshotRounded';
import { fetchNotifications, fetchOccupancy, fetchAttendanceStats } from '../lib/api';
import { useNavigate } from 'react-router-dom';
import './Home.scss';

const FALLBACK_OCCUPANCY = [6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21].map((h) => ({ hour: h, percentage: 40 }));

function getLevel(pct) {
  if (pct < 30) return { label: 'Vuota', color: 'var(--color-green)', emoji: '🟢' };
  if (pct < 60) return { label: 'Moderata', color: '#faad14', emoji: '🟡' };
  if (pct < 85) return { label: 'Affollata', color: '#ff7c4d', emoji: '🟠' };
  return { label: 'Piena', color: '#ff4d4f', emoji: '🔴' };
}

export default function Home() {
  const { user, selectedGym } = useApp();
  const [now] = useState(new Date());
  const currentHour = now.getHours();
  const navigate = useNavigate();
  const [occupancyData, setOccupancyData] = useState([]);
  const [news, setNews] = useState([]);
  const [attendance, setAttendance] = useState({ week: 0, month: 0 });

  useEffect(() => {
    if (!selectedGym?.id) return;
    fetchOccupancy(selectedGym.id).then(setOccupancyData).catch(console.error);
    fetchNotifications({ gymId: selectedGym.id }).then(setNews).catch(console.error);
    fetchAttendanceStats(user?.id, selectedGym.id).then(setAttendance).catch(console.error);
  }, [selectedGym?.id]);

  const hours = occupancyData.length ? occupancyData : FALLBACK_OCCUPANCY;
  const currentEntry = hours.find(e => Number(e.hour ?? e.h) === currentHour) || hours[0] || { percentage: 40 };
  const occupancy = Number(currentEntry.percentage ?? currentEntry.v ?? 40);
  const level = getLevel(occupancy);
  const present = Math.round((occupancy / 100) * (selectedGym?.members || 300));
  const peak = useMemo(() => hours.reduce((max, e) => (Number(e.percentage ?? e.v ?? 0) > Number(max.percentage ?? max.v ?? 0) ? e : max), hours[0] || { hour: 18, percentage: 40 }), [hours]);
  const next = hours.find(e => Number(e.hour ?? e.h) > currentHour);

  return (
    <div className="home-page page-container">
      <div className="home-greeting"><p className="home-greeting__sub">Bentornato,</p><h1 className="home-greeting__name">{user?.username || 'Atleta'} <span>💪</span></h1></div>

      <div className="home-gym-card">
        <div className="home-gym-card__header">
          <div><p className="home-gym-card__gym-name">{selectedGym?.name || 'U-GYM'}</p><p className="home-gym-card__hours"><AccessTimeIcon sx={{ fontSize: '0.9rem' }} />{selectedGym?.hours || '06:00 – 22:00'}</p></div>
          <div className="home-gym-card__status" style={{ '--lvl-color': level.color }}><span className="home-gym-card__emoji">{level.emoji}</span><span>{level.label}</span></div>
        </div>

        <div className="home-occupancy">
          <div className="home-occupancy__ring" style={{ '--pct': occupancy, '--color': level.color }}>
            <svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="42" className="track" /><circle cx="50" cy="50" r="42" className="fill" strokeDasharray={`${occupancy * 2.638} 263.8`} style={{ stroke: level.color }} /></svg>
            <div className="home-occupancy__center"><span className="home-occupancy__pct">{occupancy}%</span><span className="home-occupancy__sub">occupazione</span></div>
          </div>
          <div className="home-occupancy__stats">
            <div className="home-stat"><PersonIcon sx={{ color: '#8a8f99', fontSize: '1.1rem' }} /><div><p className="home-stat__val">{present}</p><p className="home-stat__label">presenti ora</p></div></div>
            <div className="home-stat"><TrendingUpIcon sx={{ color: '#8a8f99', fontSize: '1.1rem' }} /><div><p className="home-stat__val">{next ? `${next.hour}:00` : '—'}</p><p className="home-stat__label">prossima ora</p></div></div>
            <div className="home-stat"><WhatshotIcon sx={{ color: '#ff7c4d', fontSize: '1.1rem' }} /><div><p className="home-stat__val">{peak?.hour ? `${peak.hour}:00` : '—'}</p><p className="home-stat__label">picco oggi</p></div></div>
          </div>
        </div>

        <div className="home-chart"><p className="home-chart__label">Affluenza giornaliera</p><div className="home-chart__bars">
          {hours.map((entry) => { const h = Number(entry.hour ?? entry.h); const v = Number(entry.percentage ?? entry.v ?? 0); const active = h === currentHour; const lvl = getLevel(v); return <div key={h} className={`home-chart__bar-wrap ${active ? 'active' : ''}`}><div className="home-chart__bar" style={{ height: `${Math.max(4,v)}%`, background: active ? lvl.color : undefined }} /><span className="home-chart__h">{h}</span></div>; })}
        </div></div>
      </div>

      <button className="home-homework-card" onClick={() => navigate('/progressi')}><div><span className="home-homework-card__eyebrow">NUOVO</span><strong>Progressi & benessere</strong><small>Idratazione · peso · energia · esercizi preferiti</small></div><span className="home-homework-card__arrow">→</span></button>

      <button className="home-homework-card" onClick={() => navigate('/casa')}><div><span className="home-homework-card__eyebrow">ANCHE A CASA</span><strong>Allenamento senza attrezzi</strong><small>~20 min · ideale per iniziare</small></div><span className="home-homework-card__arrow">→</span></button>

      <section className="home-progress-card">
        <div className="home-progress-card__head"><div><span>IL TUO PERCORSO</span><h2>Costanza in palestra</h2></div><button onClick={() => navigate('/badge')}>Dettagli</button></div>
        <div className="home-progress-stats"><div><strong>{attendance.week}</strong><small>accessi questa settimana</small></div><div><strong>{attendance.month}</strong><small>accessi questo mese</small></div><div><strong>{user?.weekly_goal || 3}</strong><small>obiettivo settimanale</small></div></div>
        <div className="home-progress-bar"><span style={{width:`${Math.min(100,((attendance.week/(Number(user?.weekly_goal)||3))*100))}%`}} /></div>
        <p>{attendance.week >= (Number(user?.weekly_goal)||3) ? 'Obiettivo settimanale raggiunto. Grande costanza! 💪' : `Ti mancano ${Math.max(0,(Number(user?.weekly_goal)||3)-attendance.week)} accessi per raggiungere l'obiettivo.`}</p>
      </section>

      <h2 className="home-section-title">Novità</h2>
      <div className="home-news">
        {news.length === 0 && <div className="home-news-item"><p className="home-news-item__title">Nessuna novità al momento</p></div>}
        {news.map(n => <div key={n.id} className="home-news-item" onClick={() => { if (n.type === 'course') navigate(`/corsi/${n.ref_id}`); if (n.type === 'promo') navigate(`/promo/${n.ref_id}`); if (n.type === 'event') navigate(`/eventi/${n.ref_id}`); }}><span className="home-news-item__tag">{n.type}</span><p className="home-news-item__title">{n.title}</p><span className="home-news-item__time">{n.time || ''}</span></div>)}
      </div>
    </div>
  );
}
