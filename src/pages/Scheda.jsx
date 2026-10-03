import { useEffect, useMemo, useState } from 'react';
import { Checkbox, CircularProgress } from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import CloseIcon from '@mui/icons-material/CloseRounded';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenterRounded';
import { useData } from '../hooks/useData';
import { useApp } from '../context/AppContext';
import { fetchScheda } from '../lib/api';
import { resolveExerciseGif } from '../lib/exerciseGifs';
import './Scheda.scss';

function ExerciseSidebar({ exercise, onClose }) {
  const media = useMemo(() => resolveExerciseGif(exercise), [exercise.gif_url, exercise.name]);
  return (
    <>
      <div className="sidebar-overlay" onClick={onClose} />
      <div className="sidebar-panel">
        <div className="sidebar-panel__header">
          <h3 className="sidebar-panel__title">{exercise.name}</h3>
          <button className="sidebar-panel__close" onClick={onClose}>
            <CloseIcon fontSize="small" />
          </button>
        </div>
        <div className="sidebar-panel__content">
          <div className="ex-sidebar-muscle">
            <span>{exercise.muscle}</span>
            <div className="ex-sidebar-meta">
              <span className="ex-sidebar-sets">{exercise.sets}</span>
              {exercise.weight && (
                <span className="ex-sidebar-weight">
                  <FitnessCenterIcon sx={{ fontSize: '0.85rem' }} />
                  {exercise.weight}
                </span>
              )}
            </div>
          </div>
          {media.photo ? (
            <figure className="ex-sidebar-photo">
              <img src={media.photo} alt={`Esecuzione: ${exercise.name}`} onError={(e) => { e.currentTarget.closest('.ex-sidebar-photo').style.display = 'none'; }} />
              {media.photoAttribution && (
                <figcaption>
                  Foto: {media.photoAttribution.sourceUrl ? <a href={media.photoAttribution.sourceUrl} target="_blank" rel="noreferrer">wger.de</a> : 'wger.de'}
                  {' '}· {media.photoAttribution.author} ·{' '}
                  {media.photoAttribution.licenseUrl ? <a href={media.photoAttribution.licenseUrl} target="_blank" rel="noreferrer">{media.photoAttribution.license}</a> : media.photoAttribution.license}
                </figcaption>
              )}
            </figure>
          ) : (
            <div className="ex-sidebar-gif">
              <PlayCircleOutlineIcon className="ex-sidebar-gif__icon" />
              <p className="ex-sidebar-gif__hint">Esecuzione esercizio</p>
              {media.gif && (
                <img
                  src={media.gif}
                  alt={exercise.name}
                  className="ex-sidebar-gif__img"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              )}
            </div>
          )}
          <div className="ex-sidebar-tips">
            <h4>Consigli di esecuzione</h4>
            <ul>
              <li>Mantieni la schiena dritta durante tutto il movimento</li>
              <li>Respira correttamente: espira durante la fase concentrica</li>
              <li>Controlla il peso sia in salita che in discesa</li>
              <li>Non bloccare le articolazioni a fine movimento</li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}

function NotesSidebar({ exercise, onClose }) {
  const media = useMemo(() => resolveExerciseGif(exercise), [exercise.gif_url, exercise.name]);
  const [note, setNote] = useState(() =>
    localStorage.getItem(`u_gym_note_${exercise.id}`) || ''
  );

  const save = () => {
    localStorage.setItem(`u_gym_note_${exercise.id}`, note);
    onClose();
  };

  return (
    <>
      <div className="sidebar-overlay" onClick={onClose} />
      <div className="sidebar-panel">
        <div className="sidebar-panel__header">
          <h3 className="sidebar-panel__title">Note — {exercise.name}</h3>
          <button className="sidebar-panel__close" onClick={onClose}>
            <CloseIcon fontSize="small" />
          </button>
        </div>
        <div className="sidebar-panel__content">
          {media.photo ? (
            <div className="notes-gif">
              <img src={media.photo} alt={`Esecuzione ${exercise.name}`} onError={(e) => { e.currentTarget.closest('.notes-gif').style.display = 'none'; }} />
              <span>Guarda l'esecuzione</span>
            </div>
          ) : media.gif && (
            <div className="notes-gif">
              <img src={media.gif} alt={`Esecuzione ${exercise.name}`} onError={(e) => { e.currentTarget.style.display = 'none'; }} />
              <span>Guarda l'esecuzione</span>
            </div>
          )}
          <p className="notes-hint">Tieni traccia dei tuoi progressi: pesi, ripetizioni, sensazioni.</p>
          <textarea
            className="notes-textarea"
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder={`Es: 80kg × 8 rip — buona sessione\nAumentato di 2.5kg rispetto a settimana scorsa...`}
            rows={10}
          />
          <div className="notes-presets">
            {['↑ Peso aumentato', '✓ Completato', '⚡ PR!', '😴 Stanco'].map(p => (
              <button key={p} className="notes-preset"
                onClick={() => setNote(n => n + (n ? '\n' : '') + p)}>
                {p}
              </button>
            ))}
          </div>
          <button className="btn-primary" onClick={save} style={{ marginTop: 16 }}>
            SALVA NOTE
          </button>
        </div>
      </div>
    </>
  );
}

export default function Scheda() {
  const { selectedGym } = useApp();
  const [open, setOpen] = useState({ 0: true });
  const [checked, setChecked] = useState(() => JSON.parse(localStorage.getItem('u_gym_workout_checked') || '{}'));
  const [sessionStartedAt, setSessionStartedAt] = useState(() => Number(localStorage.getItem('u_gym_session_started_at') || 0));
  const [elapsed, setElapsed] = useState(0);
  const [exSidebar, setExSidebar] = useState(null);
  const [noteSidebar, setNoteSidebar] = useState(null);

  const { data: scheda, loading, error } = useData(() => fetchScheda({ gymId: selectedGym?.id }), [selectedGym?.id]);

  useEffect(() => {
    localStorage.setItem('u_gym_workout_checked', JSON.stringify(checked));
  }, [checked]);

  useEffect(() => {
    if (!sessionStartedAt) return undefined;
    const tick = () => setElapsed(Math.max(0, Date.now() - sessionStartedAt));
    tick(); const id = setInterval(tick, 1000); return () => clearInterval(id);
  }, [sessionStartedAt]);

  const startSession = () => { const now = Date.now(); setSessionStartedAt(now); setElapsed(0); localStorage.setItem('u_gym_session_started_at', String(now)); };
  const stopSession = () => { setSessionStartedAt(0); setElapsed(0); localStorage.removeItem('u_gym_session_started_at'); };
  const elapsedLabel = `${String(Math.floor(elapsed / 60000)).padStart(2,'0')}:${String(Math.floor(elapsed / 1000) % 60).padStart(2,'0')}`;
  const totalExercises = useMemo(() => (scheda || []).reduce((sum, day) => sum + day.exercises.length, 0), [scheda]);
  const completedExercises = useMemo(() => Object.values(checked).filter(Boolean).length, [checked]);

  const toggleDay = (i) => setOpen(o => ({ ...o, [i]: !o[i] }));
  const toggleCheck = (id) => { if (!sessionStartedAt) startSession(); setChecked(c => ({ ...c, [id]: !c[id] })); };

  return (
    <div className="scheda-page page-container">
      <h1 className="page-title">La mia <span>Scheda</span></h1>
      <div className="scheda-toolbar">
        <div><p className="scheda-coach">📋 Scheda preparata dal tuo coach</p><span className="scheda-progress-text">{completedExercises}/{totalExercises || 0} esercizi completati</span></div>
        <div className="scheda-timer">⏱ {elapsedLabel}</div>
        {!sessionStartedAt ? <button className="scheda-start" onClick={startSession}>INIZIA</button> : <button className="scheda-start secondary" onClick={stopSession}>TERMINA</button>}
      </div>

      {loading && (
        <div className="scheda-loading">
          <CircularProgress sx={{ color: 'var(--color-green)' }} />
          <p>Caricamento scheda...</p>
        </div>
      )}

      {error && <div className="scheda-error">⚠️ {error}</div>}

      <div className="scheda-days">
        {(scheda || []).map((block, i) => {
          const done = block.exercises.filter(e => checked[e.id]).length;
          return (
            <div key={block.id} className={`scheda-day ${open[i] ? 'open' : ''}`}>
              <button className="scheda-day__header" onClick={() => toggleDay(i)}>
                <div className="scheda-day__left">
                  <span className="scheda-day__name">{block.day}</span>
                  <span className="scheda-day__progress">
                    {done}/{block.exercises.length}
                  </span>
                </div>
                <div className="scheda-day__arrow">{open[i] ? '▲' : '▼'}</div>
              </button>

              {open[i] && (
                <div className="scheda-exercises">
                  {block.exercises.map(ex => {
                    const media = resolveExerciseGif(ex);
                    return (
                    <div key={ex.id} className={`scheda-ex ${checked[ex.id] ? 'done' : ''}`}>
                      <Checkbox
                        checked={!!checked[ex.id]}
                        onChange={() => toggleCheck(ex.id)}
                        size="small"
                      />
                      {(media.photo || media.poster) && (
                        <button className="scheda-ex__thumb" onClick={() => setExSidebar(ex)} aria-label={`Come si esegue ${ex.name}`}>
                          <img src={media.photo || media.poster} alt="" loading="lazy" onError={(e) => { e.currentTarget.closest('.scheda-ex__thumb').style.display = 'none'; }} />
                        </button>
                      )}
                      <div className="scheda-ex__body">
                        <button
                          className="scheda-ex__name"
                          onClick={() => setExSidebar(ex)}
                        >
                          {ex.name}
                        </button>
                        <div className="scheda-ex__tags">
                          <span className="scheda-ex__sets">{ex.sets}</span>
                          {ex.weight && (
                            <span className="scheda-ex__weight">
                              <FitnessCenterIcon sx={{ fontSize: '0.75rem' }} />
                              {ex.weight}
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        className="scheda-ex__info"
                        onClick={() => setNoteSidebar(ex)}
                        title="Aggiungi note"
                      >
                        <InfoOutlinedIcon fontSize="small" />
                      </button>
                    </div>
                  );})}

                  {done === block.exercises.length && done > 0 && (
                    <div className="scheda-complete">🎉 Allenamento completato!</div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {exSidebar && <ExerciseSidebar exercise={exSidebar} onClose={() => setExSidebar(null)} />}
      {noteSidebar && <NotesSidebar exercise={noteSidebar} onClose={() => setNoteSidebar(null)} />}
    </div>
  );
}