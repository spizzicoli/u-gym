import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchEventById, joinEvent } from '../lib/api';
import { useApp } from '../context/AppContext';
import { addCalendarReminder } from '../lib/native';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import './EventDetail.scss';

export default function EventDetail() {
  const { id } = useParams();
  const { user } = useApp();
  const [event, setEvent] = useState(null);
  const [joining, setJoining] = useState(false);
  const [joined, setJoined] = useState(false);
  const [showReminder, setShowReminder] = useState(false);
  const [calendarSaved, setCalendarSaved] = useState(false);
  const [calendarError, setCalendarError] = useState('');
  const navigate = useNavigate();

  useEffect(() => { fetchEventById(id).then(setEvent).catch(console.error); }, [id]);

  async function handleJoin() {
    if (!user) return;
    try {
      setJoining(true);
      await joinEvent(id, user.id);
      setJoined(true);
      setShowReminder(true);
    } catch (err) {
      console.error(err);
      alert('Errore durante l’iscrizione all’evento');
    } finally { setJoining(false); }
  }

  async function addReminder() {
    setCalendarError('');
    try {
      const start = new Date(event.date);
      await addCalendarReminder({
        title: event.title,
        start,
        end: new Date(start.getTime() + 60 * 60 * 1000),
        location: event.location || '',
        description: event.description || 'Evento U-GYM',
      });
      setCalendarSaved(true);
      setShowReminder(false);
    } catch (e) { setCalendarError(e?.message || 'Non è stato possibile aprire il calendario.'); }
  }

  if (!event) return <div className="page-container event-detail">Caricamento...</div>;

  return (
    <div className="page-container event-detail">
      <button className="detail-back" onClick={() => navigate(-1)}><ArrowBackIcon fontSize="small" /> Eventi</button>
      {event.image_url && (
        <figure className="event-detail__image">
          <img src={event.image_url} alt={`Immagine dell'evento ${event.title}`} />
        </figure>
      )}
      <p className="event-detail__tag">Evento</p>
      <h1 className="event-detail__title">{event.title}</h1>
      {event.date && <p className="event-detail__meta">📅 {new Date(event.date).toLocaleString('it-IT',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'})}</p>}
      {event.location && <p className="event-detail__meta">📍 {event.location}</p>}
      {event.description && <p className="event-detail__body">{event.description}</p>}
      {calendarSaved && <div className="calendar-success">✓ Promemoria aggiunto al calendario</div>}
      <button className="event-detail__button" disabled={joining || joined} onClick={handleJoin}>
        {joined ? 'Sei iscritto ✅' : joining ? 'Iscrizione...' : 'Partecipa'}
      </button>

      {showReminder && <div className="modal-backdrop" role="dialog" aria-modal="true">
        <div className="calendar-modal">
          <div className="calendar-modal__icon"><CalendarMonthRoundedIcon /></div>
          <h2>Vuoi ricordarlo?</h2>
          <p>Posso aprire il calendario del tuo dispositivo con data, ora e luogo dell'evento già compilati.</p>
          {calendarError && <div className="calendar-error">{calendarError}</div>}
          <button onClick={addReminder}>Aggiungi al calendario</button>
          <button className="secondary" onClick={() => setShowReminder(false)}>Non ora</button>
        </div>
      </div>}
    </div>
  );
}
