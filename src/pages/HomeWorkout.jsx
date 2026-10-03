import { useEffect, useMemo, useState } from 'react';
import {
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
} from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutlineRounded';
import TimerOutlinedIcon from '@mui/icons-material/TimerOutlined';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import PauseRoundedIcon from '@mui/icons-material/PauseRounded';
import RestartAltRoundedIcon from '@mui/icons-material/RestartAltRounded';
import NotificationsActiveRoundedIcon from '@mui/icons-material/NotificationsActiveRounded';
import { useApp } from '../context/AppContext';
import { fetchHomeWorkoutExercises } from '../lib/api';
import { scheduleWorkoutReminder } from '../lib/native';
import './HomeWorkout.scss';

const RANDOM_WORKOUT_SIZE = 4;
const HISTORY_KEY = 'u_gym_home_history';

function weekKey(date = new Date()) {
  const d = new Date(date);
  const day = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - day);
  return d.toISOString().slice(0, 10);
}

function loadHistory() {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
  } catch {
    return [];
  }
}

function toWorkoutExercise(exercise) {
  return {
    ...exercise,
    target: exercise.muscle || exercise.target || exercise.muscle_group || 'Gruppo muscolare non specificato',
    dose: exercise.sets || exercise.reps || exercise.duration || '',
    rest: exercise.rest_seconds ? `${exercise.rest_seconds} sec` : '',
  };
}

function randomExercises(exercises) {
  const shuffled = [...exercises];
  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, RANDOM_WORKOUT_SIZE);
}

export default function HomeWorkout() {
  const { selectedGym } = useApp();
  const [exercises, setExercises] = useState([]);
  const [routine, setRoutine] = useState([]);
  const [done, setDone] = useState({});
  const [seconds, setSeconds] = useState(20 * 60);
  const [running, setRunning] = useState(false);
  const [history, setHistory] = useState(loadHistory);
  const [reminderAt, setReminderAt] = useState('');
  const [reminderMsg, setReminderMsg] = useState('');
  const [loadingExercises, setLoadingExercises] = useState(true);
  const [exerciseError, setExerciseError] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);

  const completed = useMemo(() => routine.filter(exercise => done[exercise.id]).length, [routine, done]);
  const weekStart = weekKey();
  const weekSessions = history.filter(session => session.week === weekStart).length;
  const mm = String(Math.floor(seconds / 60)).padStart(2, '0');
  const ss = String(seconds % 60).padStart(2, '0');

  useEffect(() => {
    let active = true;
    setLoadingExercises(true);
    setExerciseError('');
    setExercises([]);
    setRoutine([]);
    setDone({});
    fetchHomeWorkoutExercises({ gymId: selectedGym?.id })
      .then(data => {
        if (active) setExercises(data);
      })
      .catch(error => {
        console.error('Errore nel recupero degli esercizi per Allenamento Casa:', error);
        if (active) setExerciseError('Non è stato possibile caricare gli esercizi. Riprova tra poco.');
      })
      .finally(() => {
        if (active) setLoadingExercises(false);
      });
    return () => { active = false; };
  }, [selectedGym?.id]);

  useEffect(() => {
    if (!running) return undefined;
    const id = setInterval(() => {
      setSeconds(value => {
        if (value <= 1) {
          setRunning(false);
          return 0;
        }
        return value - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [running]);

  const toggle = id => setDone(previous => ({ ...previous, [id]: !previous[id] }));

  const openExercisePicker = () => {
    setSelectedIds(routine.map(exercise => exercise.id));
    setDialogOpen(true);
  };

  const applySelectedExercises = () => {
    setRoutine(exercises.filter(exercise => selectedIds.includes(exercise.id)).map(toWorkoutExercise));
    setDone({});
    setDialogOpen(false);
  };

  const chooseRandomWorkout = () => {
    setRoutine(randomExercises(exercises).map(toWorkoutExercise));
    setDone({});
  };

  const completeWorkout = () => {
    const next = [...history, {
      id: Date.now(),
      date: new Date().toISOString(),
      week: weekKey(),
      seconds: 20 * 60,
    }].slice(-120);
    setHistory(next);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
    setDone({});
    setSeconds(20 * 60);
    setRunning(false);
  };

  const schedule = async () => {
    if (!reminderAt) return;
    try {
      const at = new Date(reminderAt);
      await scheduleWorkoutReminder({
        id: 7820,
        title: 'Allenamento Casa 💪',
        body: 'La tua sessione U-GYM ti aspetta. Anche 20 minuti fanno la differenza.',
        at,
      });
      setReminderMsg('Promemoria programmato ✓');
    } catch (error) {
      setReminderMsg(error?.message || 'Non è stato possibile programmare il promemoria.');
    }
  };

  return (
    <div className="home-workout page-container">
      <div className="home-workout__hero">
        <span className="home-workout__eyebrow">ZERO ATTREZZI</span>
        <h1>Allenamento <span>Casa</span></h1>
        <p>Scegli gli esercizi che preferisci oppure lascia che U-GYM ne selezioni quattro a caso.</p>
      </div>

      <div className="home-workout__chooser">
        <button className="home-workout__choose" onClick={openExercisePicker} disabled={loadingExercises || exercises.length === 0}>
          {loadingExercises ? 'Caricamento esercizi...' : 'Scegli allenamento'}
        </button>
        <button className="home-workout__random" onClick={chooseRandomWorkout} disabled={loadingExercises || exercises.length === 0}>
          Allenamento random
        </button>
        {exerciseError && <p className="home-workout__error" role="alert">{exerciseError}</p>}
        {!loadingExercises && !exerciseError && exercises.length === 0 && (
          <p className="home-workout__empty">Non ci sono esercizi disponibili per questa palestra.</p>
        )}
      </div>

      <section className="home-timer">
        <div><span>SESSIONE</span><strong>{mm}:{ss}</strong><small>{running ? 'In corso' : 'In pausa'}</small></div>
        <div className="home-timer__actions">
          <button onClick={() => setRunning(value => !value)} aria-label={running ? 'Pausa' : 'Avvia'}>
            {running ? <PauseRoundedIcon /> : <PlayArrowRoundedIcon />}<span>{running ? 'Pausa' : 'Avvia'}</span>
          </button>
          <button onClick={() => { setRunning(false); setSeconds(20 * 60); }} aria-label="Azzera"><RestartAltRoundedIcon /></button>
        </div>
      </section>

      <div className="home-workout__progress">
        <div><strong>{completed}/{routine.length}</strong><span>esercizi completati</span></div>
        <div><TimerOutlinedIcon /><span>~20 min</span></div>
      </div>

      {routine.length > 0 ? (
        <div className="home-workout__list">
          {routine.map((exercise, index) => (
            <button key={exercise.id} className={`home-ex ${done[exercise.id] ? 'done' : ''}`} onClick={() => toggle(exercise.id)}>
              <div className="home-ex__num">{index + 1}</div>
              <div className="home-ex__body">
                <strong>{exercise.name || 'Esercizio senza nome'}</strong>
                <span>{exercise.target}</span>
                {(exercise.dose || exercise.rest || exercise.weight) && (
                  <small>
                    {[exercise.dose, exercise.weight, exercise.rest && `recupero ${exercise.rest}`].filter(Boolean).join(' · ')}
                  </small>
                )}
              </div>
              <CheckCircleOutlineIcon className="home-ex__check" />
            </button>
          ))}
        </div>
      ) : (
        <p className="home-workout__empty">Scegli gli esercizi per iniziare la sessione.</p>
      )}

      {routine.length > 0 && completed === routine.length && (
        <button className="home-complete-btn" onClick={completeWorkout}>🎉 Registra allenamento completato</button>
      )}

      <section className="home-history">
        <div className="home-history__head"><div><span className="home-workout__eyebrow">COSTANZA</span><h2>Questa settimana</h2></div><strong>{weekSessions}</strong></div>
        <p>{weekSessions === 0 ? 'Ancora nessun allenamento registrato. Inizia oggi.' : `${weekSessions} ${weekSessions === 1 ? 'sessione completata' : 'sessioni completate'} questa settimana.`}</p>
        <div className="week-dots">{[1, 2, 3, 4, 5, 6, 7].map((_, index) => {
          const d = new Date();
          const day = (d.getDay() + 6) % 7;
          const monday = new Date(d);
          monday.setDate(d.getDate() - day + index);
          const key = monday.toISOString().slice(0, 10);
          const active = history.some(session => session.date?.slice(0, 10) === key);
          return <span key={key} className={active ? 'active' : ''}>{['L', 'M', 'M', 'G', 'V', 'S', 'D'][index]}</span>;
        })}</div>
      </section>

      <section className="home-reminder">
        <div className="home-reminder__title"><NotificationsActiveRoundedIcon /><div><strong>Promemoria</strong><small>Ricevi un avviso quando vuoi allenarti</small></div></div>
        <input type="datetime-local" value={reminderAt} min={new Date(Date.now() + 60000).toISOString().slice(0, 16)} onChange={event => setReminderAt(event.target.value)} />
        <button onClick={schedule} disabled={!reminderAt}>Programma notifica</button>
        {reminderMsg && <small className="reminder-msg">{reminderMsg}</small>}
      </section>

      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        fullWidth
        maxWidth="sm"
        aria-labelledby="home-workout-dialog-title"
        PaperProps={{ sx: { backgroundColor: 'var(--color-surface)', color: 'var(--color-text)', border: '1px solid var(--color-border)' } }}
      >
        <DialogTitle id="home-workout-dialog-title">Scegli gli esercizi</DialogTitle>
        <DialogContent dividers>
          {loadingExercises ? <p>Caricamento esercizi...</p> : (
            <div className="home-workout__exercise-options">
              {exercises.map(exercise => (
                <FormControlLabel
                  key={exercise.id}
                  control={(
                    <Checkbox
                      checked={selectedIds.includes(exercise.id)}
                      onChange={() => setSelectedIds(previous => previous.includes(exercise.id)
                        ? previous.filter(id => id !== exercise.id)
                        : [...previous, exercise.id])}
                    />
                  )}
                  label={(
                    <span className="home-workout__exercise-option">
                      <strong>{exercise.name || 'Esercizio senza nome'}</strong>
                      <small>{[exercise.muscle || exercise.target || exercise.muscle_group, exercise.sets || exercise.reps].filter(Boolean).join(' · ')}</small>
                    </span>
                  )}
                />
              ))}
            </div>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} sx={{ color: 'var(--color-text)' }}>Annulla</Button>
          <Button onClick={applySelectedExercises} disabled={selectedIds.length === 0} variant="contained" sx={{ backgroundColor: 'var(--accent, var(--color-green))', color: '#07110b' }}>
            Aggiungi ({selectedIds.length})
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
