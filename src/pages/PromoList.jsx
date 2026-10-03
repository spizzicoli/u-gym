import { useEffect, useState } from 'react';
import { fetchPromos } from '../lib/api';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import './PromoList.scss';

export default function PromoList() {
  const [promos, setPromos] = useState([]);
  const { selectedGym } = useApp();
  const navigate = useNavigate();

  useEffect(() => {
    fetchPromos({ gymId: selectedGym?.id }).then(setPromos);
  }, [selectedGym?.id]);

  return (
    <div className="promo-list page-container">
      <h1 className="promo-title">Promo attive</h1>

      <div className="promo-items">
        {promos.map(p => (
          <div
            key={p.id}
            className="promo-card"
            onClick={() => navigate(`/promo/${p.id}`)}
          >
            <div className="promo-card__header">
              <span className="promo-card__tag">Promo</span>
              <span className="promo-card__date">
                {new Date(p.created_at).toLocaleDateString('it-IT')}
              </span>
            </div>

            <p className="promo-card__title">{p.title}</p>
            <p className="promo-card__desc">{p.short_description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
