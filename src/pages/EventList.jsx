import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchEvents } from '../lib/api';
import './EventList.scss';

export default function EventList() {
  const [events, setEvents] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchEvents().then(setEvents).catch(console.error);
  }, []);

  return (
    <div className="page-container event-list">
      <h1 className="event-list__title">Eventi</h1>

      <div className="event-list__items">
        {events.map(ev => (
          <div
            key={ev.id}
            className="event-card"
            onClick={() => navigate(`/eventi/${ev.id}`)}
          >
            <div className="event-card__header">
              <span className="event-card__date">
                {ev.date
                  ? new Date(ev.date).toLocaleDateString('it-IT', {
                      day: '2-digit',
                      month: '2-digit',
                    })
                  : 'Data da definire'}
              </span>
              {ev.location && (
                <span className="event-card__location">{ev.location}</span>
              )}
            </div>
            <p className="event-card__title">{ev.title}</p>
            {ev.short_description && (
              <p className="event-card__desc">{ev.short_description}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
