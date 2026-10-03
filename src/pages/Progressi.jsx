import { useEffect, useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import { fetchOccupancy, fetchScheda } from '../lib/api';
import LocalDrinkIcon from '@mui/icons-material/LocalDrinkRounded';
import BoltIcon from '@mui/icons-material/BoltRounded';
import MonitorWeightIcon from '@mui/icons-material/MonitorWeightRounded';
import FavoriteIcon from '@mui/icons-material/FavoriteRounded';
import ScheduleIcon from '@mui/icons-material/ScheduleRounded';
import CheckCircleIcon from '@mui/icons-material/CheckCircleRounded';
import './Progressi.scss';

const todayKey = () => new Date().toISOString().slice(0, 10);
const weekKey = () => {
  const d = new Date(); const day = (d.getDay() + 6) % 7; d.setDate(d.getDate() - day);
  return d.toISOString().slice(0, 10);
};

export default function Progressi() {
  const { user, selectedGym } = useApp();
  const [water, setWater] = useState(() => Number(localStorage.getItem(`ugym_water_${todayKey()}`) || 0));
  const [readiness, setReadiness] = useState(() => Number(localStorage.getItem(`ugym_readiness_${todayKey()}`) || 0));
  const [weightLog, setWeightLog] = useState(() => JSON.parse(localStorage.getItem(`ugym_weight_log_${user?.id || 'guest'}`) || '[]'));
  const [weight, setWeight] = useState('');
  const [favorites, setFavorites] = useState(() => JSON.parse(localStorage.getItem(`ugym_favorites_${user?.id || 'guest'}`) || '[]'));
  const [exercises, setExercises] = useState([]);
  const [occupancy, setOccupancy] = useState([]);

  useEffect(() => {
    localStorage.setItem(`ugym_water_${todayKey()}`, String(water));
  }, [water]);
  useEffect(() => {
    localStorage.setItem(`ugym_readiness_${todayKey()}`, String(readiness));
  }, [readiness]);
  useEffect(() => {
    localStorage.setItem(`ugym_weight_log_${user?.id || 'guest'}`, JSON.stringify(weightLog));
  }, [weightLog, user?.id]);
  useEffect(() => {
    localStorage.setItem(`ugym_favorites_${user?.id || 'guest'}`, JSON.stringify(favorites));
  }, [favorites, user?.id]);
  useEffect(() => {
    fetchScheda({ gymId: selectedGym?.id }).then(days => {
      const list = days.flatMap(d => (d.exercises || []).map(e => ({ ...e, day_name: d.name || d.title || 'Scheda' })));
      setExercises(list);
    }).catch(() => setExercises([]));
    if (selectedGym?.id) fetchOccupancy(selectedGym.id).then(setOccupancy).catch(() => setOccupancy([]));
  }, [selectedGym?.id]);

  const waterGoal = 2000;
  const waterPct = Math.min(100, Math.round((water / waterGoal) * 100));
  const latestWeight = weightLog[0]?.value || user?.weight || '';
  const weightDelta = weightLog.length > 1 ? Number(weightLog[0].value) - Number(weightLog[weightLog.length - 1].value) : 0;
  const favoriteExercises = useMemo(() => exercises.filter(e => favorites.includes(e.id)), [exercises, favorites]);
  const bestTime = useMemo(() => {
    if (!occupancy.length) return null;
    return [...occupancy].sort((a,b) => Number(a.percentage ?? a.v ?? 100) - Number(b.percentage ?? b.v ?? 100))[0];
  }, [occupancy]);

  const addWeight = () => {
    const value = Number(String(weight).replace(',', '.'));
    if (!value || value < 20 || value > 400) return;
    setWeightLog([{ value, date: new Date().toISOString() }, ...weightLog].slice(0, 30));
    setWeight('');
  };

  const toggleFavorite = (id) => setFavorites(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  return (
    <div className="progress-page page-container">
      <div className="progress-header"><span className="progress-eyebrow">IL TUO BENESSERE</span><h1>Progressi</h1><p>Piccoli dati, utili per allenarti meglio.</p></div>

      <section className="progress-card">
        <div className="progress-card__title"><LocalDrinkIcon /><div><h2>Idratazione</h2><small>Obiettivo giornaliero 2 L</small></div><strong>{water} ml</strong></div>
        <div className="progress-meter"><span style={{ width: `${waterPct}%` }} /></div>
        <div className="progress-actions">
          {[250, 500, 750].map(v => <button key={v} onClick={() => setWater(x => Math.min(4000, x + v))}>+{v} ml</button>)}
          <button className="muted" onClick={() => setWater(0)}>Azzera</button>
        </div>
      </section>

      <section className="progress-card">
        <div className="progress-card__title"><BoltIcon /><div><h2>Come ti senti oggi?</h2><small>Segna il tuo livello prima di allenarti</small></div></div>
        <div className="readiness-grid">{[['1','Scarico'],['2','Basso'],['3','Ok'],['4','Bene'],['5','Al top']].map(([v,label]) => <button key={v} className={readiness === Number(v) ? 'selected' : ''} onClick={() => setReadiness(Number(v))}><strong>{v}</strong><span>{label}</span></button>)}</div>
        {readiness > 0 && <p className="progress-hint">{readiness <= 2 ? 'Oggi punta su un allenamento leggero e cura il recupero.' : readiness === 3 ? 'Giornata equilibrata: ascolta il corpo durante l’allenamento.' : 'Ottima giornata per lavorare sulla progressione. 💪'}</p>}
      </section>

      <section className="progress-card">
        <div className="progress-card__title"><MonitorWeightIcon /><div><h2>Peso</h2><small>Storico personale sul dispositivo</small></div><strong>{latestWeight ? `${latestWeight} kg` : '—'}</strong></div>
        <div className="weight-entry"><input inputMode="decimal" placeholder="es. 72,5" value={weight} onChange={e => setWeight(e.target.value)} /><button onClick={addWeight}>Registra</button></div>
        {weightLog.length > 0 && <div className="weight-list">{weightLog.slice(0, 5).map((item, i) => <div key={`${item.date}-${i}`}><span>{new Date(item.date).toLocaleDateString('it-IT')}</span><strong>{item.value} kg</strong></div>)}</div>}
        {weightLog.length > 1 && <p className="progress-hint">Variazione nel periodo registrato: <strong>{weightDelta > 0 ? '+' : ''}{weightDelta.toFixed(1)} kg</strong>.</p>}
      </section>

      <section className="progress-card">
        <div className="progress-card__title"><FavoriteIcon /><div><h2>I tuoi esercizi</h2><small>Preferiti per ritrovarli velocemente</small></div><strong>{favoriteExercises.length}</strong></div>
        <div className="exercise-favorites-list">
          {exercises.slice(0, 12).map(ex => <button key={ex.id} className={favorites.includes(ex.id) ? 'favorite selected' : 'favorite'} onClick={() => toggleFavorite(ex.id)}><span>{ex.name || ex.exercise_name || 'Esercizio'}</span><FavoriteIcon /></button>)}
          {!exercises.length && <p className="empty-state">Gli esercizi della tua scheda appariranno qui.</p>}
        </div>
      </section>

      <section className="progress-card">
        <div className="progress-card__title"><ScheduleIcon /><div><h2>Quando andare?</h2><small>Basato sull’affluenza della tua palestra</small></div></div>
        {bestTime ? <div className="best-time"><CheckCircleIcon /><div><strong>{String(bestTime.hour).padStart(2, '0')}:00</strong><span>fascia con minore affluenza stimata ({Math.round(Number(bestTime.percentage ?? bestTime.v ?? 0))}%)</span></div></div> : <p className="empty-state">Non ci sono ancora dati di affluenza sufficienti.</p>}
      </section>

      <p className="progress-footer">I dati personali di questa sezione, salvo quelli provenienti dalla palestra, restano sul dispositivo.</p>
    </div>
  );
}
