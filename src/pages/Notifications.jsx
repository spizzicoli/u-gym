import { useEffect, useState } from 'react';
import { fetchNotifications } from '../lib/api';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import './Notifications.scss';

export default function Notifications() {
  const [items, setItems] = useState([]);
  const { selectedGym } = useApp();
  const navigate = useNavigate();

  useEffect(() => {
    fetchNotifications({ gymId: selectedGym?.id }).then(setItems).catch(console.error);
  }, [selectedGym?.id]);

  function handleClick(n) {
    if (n.type === 'course' && n.ref_id) navigate(`/corsi/${n.ref_id}`);
    if (n.type === 'promo' && n.ref_id) navigate(`/promo/${n.ref_id}`);
    if (n.type === 'event' && n.ref_id) navigate(`/eventi/${n.ref_id}`);
  }

  return (
    <div className="page-container notifications-page">
      <h1 className="notifications-page__title">Notifiche</h1>

      <div className="notifications-page__list">
        {items.map(n => (
          <div
            key={n.id}
            className="notification-item"
            onClick={() => handleClick(n)}
          >
            <div className="notification-item__header">
              <span className="notification-item__type">{n.type}</span>
              <span className="notification-item__time">
                {n.created_at &&
                  new Date(n.created_at).toLocaleString('it-IT', {
                    day: '2-digit',
                    month: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
              </span>
            </div>
            <p className="notification-item__title">{n.title}</p>
            {n.body && (
              <p className="notification-item__body">{n.body}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
