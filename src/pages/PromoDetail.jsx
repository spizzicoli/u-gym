import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchPromoById } from '../lib/api';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import './PromoDetail.scss';

export default function PromoDetail() {
  const { id } = useParams();
  const [promo, setPromo] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPromoById(id).then(setPromo).catch(console.error);
  }, [id]);

  if (!promo) {
    return <div className="page-container promo-detail">Caricamento...</div>;
  }

  return (
    <div className="page-container promo-detail">
      <button className="detail-back" onClick={() => navigate(-1)}>
        <ArrowBackIcon fontSize="small" />
        Promo
      </button>

      <p className="promo-detail__tag">Promo</p>
      <h1 className="promo-detail__title">{promo.title}</h1>

      {promo.image_url && (
        <div className="promo-detail__image-wrap">
          <img src={promo.image_url} alt={promo.title} />
        </div>
      )}

      {promo.short_description && (
        <p className="promo-detail__subtitle">{promo.short_description}</p>
      )}

      {promo.description && (
        <p className="promo-detail__body">{promo.description}</p>
      )}

      {promo.expires_at && (
        <p className="promo-detail__expires">
          Valida fino al:{' '}
          <strong>
            {new Date(promo.expires_at).toLocaleDateString('it-IT')}
          </strong>
        </p>
      )}

      <button
        className="promo-detail__button"
        onClick={() => {
          // qui puoi aggiungere logica "usa promo" (es. mostrare QR, ecc.)
          alert('Promo applicata (placeholder)');
        }}
      >
        Usa promo
      </button>
    </div>
  );
}
