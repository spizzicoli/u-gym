import { useEffect, useMemo, useState } from 'react';
import { useApp, THEMES } from '../context/AppContext';
import { scheduleWorkoutReminder, cancelWorkoutReminder } from '../lib/native';
import SaveRoundedIcon from '@mui/icons-material/SaveRounded';
import NotificationsActiveRoundedIcon from '@mui/icons-material/NotificationsActiveRounded';
import PaletteRoundedIcon from '@mui/icons-material/PaletteRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import MonitorWeightRoundedIcon from '@mui/icons-material/MonitorWeightRounded';
import './Profile.scss';

const REMINDER_ID = 7811;

export default function Profile() {
  const { user, selectedGym, logout, saveProfile, setTheme } = useApp();
  const [username, setUsername] = useState(user?.username || '');
  const [theme, setThemeLocal] = useState(user?.theme || 'green');
  const [goal, setGoal] = useState(user?.weekly_goal || 3);
  const [reminders, setReminders] = useState(user?.workout_reminders ?? true);
  const [age, setAge] = useState(user?.age ?? '');
  const [height, setHeight] = useState(user?.height ?? '');
  const [weight, setWeight] = useState(user?.weight ?? '');
  const [sex, setSex] = useState(user?.sex || '');
  const [day, setDay] = useState(() => localStorage.getItem('u_gym_reminder_day') || '2');
  const [time, setTime] = useState(() => localStorage.getItem('u_gym_reminder_time') || '18:00');
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setUsername(user?.username || ''); setThemeLocal(user?.theme || 'green');
    setGoal(user?.weekly_goal || 3); setReminders(user?.workout_reminders ?? true);
    setAge(user?.age ?? ''); setHeight(user?.height ?? ''); setWeight(user?.weight ?? ''); setSex(user?.sex || '');
  }, [user?.id, user?.username, user?.theme, user?.age, user?.height, user?.weight, user?.sex]);

  const bmi = useMemo(() => {
    const h = Number(height) / 100; const w = Number(weight);
    if (!h || !w) return null;
    return (w / (h * h)).toFixed(1);
  }, [height, weight]);

  const nextReminder = () => {
    const [hours, minutes] = time.split(':').map(Number);
    const now = new Date(); const target = new Date(now); target.setHours(hours, minutes, 0, 0);
    const wanted = Number(day); let diff = (wanted - target.getDay() + 7) % 7;
    if (diff === 0 && target <= now) diff = 7; target.setDate(target.getDate() + diff); return target;
  };

  const chooseTheme = (key) => { setThemeLocal(key); setTheme(key); };

  const save = async () => {
    setError(''); setSaved(false);
    try {
      await saveProfile({ username, theme, weeklyGoal: Number(goal), workoutReminders: reminders, age, height, weight, sex });
      localStorage.setItem('u_gym_reminder_day', day); localStorage.setItem('u_gym_reminder_time', time);
      setSaved(true);
      try {
        if (reminders) await scheduleWorkoutReminder({ id: REMINDER_ID, title: 'È ora di allenarti 💪', body: '20 minuti per te. Apri U-GYM e inizia la sessione.', at: nextReminder() });
        else await cancelWorkoutReminder(REMINDER_ID);
      } catch (e) {
        setError(`Profilo salvato, ma il promemoria non è stato aggiornato: ${e?.message || 'controlla i permessi delle notifiche.'}`);
      }
      setTimeout(() => setSaved(false), 2200);
    } catch (e) { setError(e?.message || 'Non è stato possibile salvare le impostazioni.'); }
  };

  return (
    <div className="page-container profile-page">
      <div className="profile-head"><div><span className="profile-kicker">ACCOUNT</span><h1>Profilo</h1></div><div className="profile-avatar">{(user?.username || 'A').charAt(0).toUpperCase()}</div></div>

      <section className="settings-card">
        <div className="settings-title"><PersonRoundedIcon/><div><strong>Il tuo profilo</strong><small>Le informazioni che usi nell'app</small></div></div>
        <label>Username<input value={username} maxLength={24} onChange={e => setUsername(e.target.value)} /></label>
        <label>Email<input value={user?.email || ''} disabled /></label>
        <div className="setting-static"><span>Palestra</span><strong>{selectedGym?.name || 'Nessuna'}</strong></div>
      </section>

      <section className="settings-card">
        <div className="settings-title"><MonitorWeightRoundedIcon/><div><strong>Dati personali</strong><small>Per monitorare i tuoi progressi</small></div></div>
        <div className="profile-fields-grid">
          <label>Peso (kg)<input type="number" min="20" max="400" step="0.1" value={weight} onChange={e => setWeight(e.target.value)} placeholder="es. 75" /></label>
          <label>Altezza (cm)<input type="number" min="100" max="250" value={height} onChange={e => setHeight(e.target.value)} placeholder="es. 178" /></label>
          <label>Età<input type="number" min="13" max="120" value={age} onChange={e => setAge(e.target.value)} placeholder="es. 30" /></label>
          <label>Sesso<select value={sex} onChange={e => setSex(e.target.value)}><option value="">Non specificato</option><option value="female">Donna</option><option value="male">Uomo</option><option value="other">Altro</option></select></label>
        </div>
        {bmi && <div className="bmi-card"><span>BMI indicativo</span><strong>{bmi}</strong><small>Valore informativo, non diagnostico.</small></div>}
      </section>

      <section className="settings-card">
        <div className="settings-title"><PaletteRoundedIcon/><div><strong>Aspetto</strong><small>La scelta si applica subito a tutte le pagine</small></div></div>
        <div className="theme-grid">
          {Object.entries(THEMES).map(([key, item]) => (
            <button key={key} type="button" className={`theme-choice ${theme === key ? 'active' : ''}`} data-theme-key={key} onClick={() => chooseTheme(key)}>
              <span className={`theme-dot theme-dot--${key}`} aria-hidden="true" /><span>{item.label}</span>{theme === key && <b>✓</b>}
            </button>
          ))}
        </div>
      </section>

      <section className="settings-card">
        <div className="settings-title"><NotificationsActiveRoundedIcon/><div><strong>Allenamento</strong><small>Imposta il tuo ritmo settimanale</small></div></div>
        <label>Obiettivo settimanale<select value={goal} onChange={e => setGoal(e.target.value)}>{[1,2,3,4,5,6,7].map(n => <option key={n} value={n}>{n} {n === 1 ? 'allenamento' : 'allenamenti'} / settimana</option>)}</select></label>
        <label className="switch-row"><span><strong>Promemoria allenamento</strong><small>Ricordami una volta a settimana</small></span><input type="checkbox" checked={reminders} onChange={e => setReminders(e.target.checked)} /></label>
        {reminders && <div className="reminder-row"><label>Giorno<select value={day} onChange={e => setDay(e.target.value)}><option value="1">Lunedì</option><option value="2">Martedì</option><option value="3">Mercoledì</option><option value="4">Giovedì</option><option value="5">Venerdì</option><option value="6">Sabato</option><option value="0">Domenica</option></select></label><label>Ora<input type="time" value={time} onChange={e => setTime(e.target.value)} /></label></div>}
      </section>

      {error && <div className="profile-error">{error}</div>}
      {saved && <div className="profile-saved">✓ Impostazioni salvate</div>}
      <button className="profile-save" onClick={save}><SaveRoundedIcon/> Salva modifiche</button>
      <button className="profile-page__logout" onClick={logout}>Esci dall'account</button>
    </div>
  );
}
