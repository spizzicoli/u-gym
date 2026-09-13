import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchEventById, joinEvent } from '../lib/api';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import './EventDetail.scss';

export default function EventDetail() {
  const { id } = useParams();
  const { user } = useApp();
  const [event, setEvent] = useState(null);
  const [joining, setJoining] = useState(false);
  const [joined, setJoined] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchEventById(id).then(setEvent).catch(console.error);
  }, [id]);

  async function handleJoin() {
    if (!user) return;
    try {
      setJoining(true);
      await joinEvent(id, user.id);
      setJoined(true);
    } catch (err) {
      console.error(err);
      alert('Errore durante l’iscrizione all’evento');
    } finally {
      setJoining(false);
    }
  }

  if (!event) {
    return <div className="page-container event-detail">Caricamento...</div>;
  }

  return (
    <div className="page-container event-detail">
      <button className="detail-back" onClick={() => navigate(-1)}>
        <ArrowBackIcon fontSize="small" />
        Eventi
      </button>

      <p className="event-detail__tag">Evento</p>
      <h1 className="event-detail__title">{event.title}</h1>

      {event.date && (
        <p className="event-detail__meta">
          📅{' '}
          {new Date(event.date).toLocaleString('it-IT', {
            day: '2-digit',
            month: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </p>
      )}

      {event.location && (
        <p className="event-detail__meta">📍 {event.location}</p>
      )}

      {event.description && (
        <p className="event-detail__body">{event.description}</p>
      )}

      <button
        className="event-detail__button"
        disabled={joining || joined}
        onClick={handleJoin}
      >
        {joined ? 'Sei iscritto ✅' : joining ? 'Iscrizione...' : 'Partecipa'}
      </button>
    </div>
  );
}
