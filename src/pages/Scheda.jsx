import { useState } from 'react';
import { Checkbox, CircularProgress } from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import CloseIcon from '@mui/icons-material/CloseRounded';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenterRounded';
import { useData } from '../hooks/useData';
import { fetchScheda } from '../lib/api';
import './Scheda.scss';

function ExerciseSidebar({ exercise, onClose }) {
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
          <div className="ex-sidebar-gif">
            <PlayCircleOutlineIcon className="ex-sidebar-gif__icon" />
            <p className="ex-sidebar-gif__hint">Esecuzione esercizio</p>
            {exercise.gif_url && (
              <img
                src={exercise.gif_url}
                alt={exercise.name}
                className="ex-sidebar-gif__img"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            )}
          </div>
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
  const [open, setOpen] = useState({ 0: true });
  const [checked, setChecked] = useState({});
  const [exSidebar, setExSidebar] = useState(null);
  const [noteSidebar, setNoteSidebar] = useState(null);

  const { data: scheda, loading, error } = useData(fetchScheda);

  const toggleDay = (i) => setOpen(o => ({ ...o, [i]: !o[i] }));
  const toggleCheck = (id) => setChecked(c => ({ ...c, [id]: !c[id] }));

  return (
    <div className="scheda-page page-container">
      <h1 className="page-title">La mia <span>Scheda</span></h1>
      <p className="scheda-coach">📋 Scheda preparata dal tuo coach — Settimana A</p>

      {loading && (
        <div className="scheda-loading">
          <CircularProgress sx={{ color: '#3ddc84' }} />
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
                  {block.exercises.map(ex => (
                    <div key={ex.id} className={`scheda-ex ${checked[ex.id] ? 'done' : ''}`}>
                      <Checkbox
                        checked={!!checked[ex.id]}
                        onChange={() => toggleCheck(ex.id)}
                        size="small"
                      />
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
                  ))}

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