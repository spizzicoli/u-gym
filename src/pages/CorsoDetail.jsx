import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { TextField } from '@mui/material';

import ArrowBackIcon from '@mui/icons-material/ArrowBackRounded';
import PersonIcon from '@mui/icons-material/PersonRounded';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonthRounded';
import AccessTimeIcon from '@mui/icons-material/AccessTimeRounded';
import EuroIcon from '@mui/icons-material/Euro';
import LockIcon from '@mui/icons-material/LockRounded';

import { fetchCorsoById } from '../lib/api';
import './CorsoDetail.scss';

export default function CorsoDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [corso, setCorso] = useState(null);
  const [loading, setLoading] = useState(true);

  const [step, setStep] = useState('detail'); // detail | payment | confirm
  const [card, setCard] = useState({ number: '', expiry: '', cvv: '', name: '' });

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchCorsoById(id);
        setCorso(data);
      } catch (err) {
        console.error('Errore nel recupero corso:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="page-container">
        <p>Caricamento corso...</p>
      </div>
    );
  }

  if (!corso) {
    return (
      <div className="page-container">
        <p>Corso non trovato</p>
      </div>
    );
  }

  const handleCard = (e) =>
    setCard((c) => ({ ...c, [e.target.name]: e.target.value }));

  const formatCard = (val) =>
    val.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();

  const formatExpiry = (val) => {
    const v = val.replace(/\D/g, '').slice(0, 4);
    return v.length >= 3 ? `${v.slice(0, 2)}/${v.slice(2)}` : v;
  };

  const pay = async () => {
    await new Promise((r) => setTimeout(r, 1200));
    setStep('confirm');
  };

  // ============================
  //   STEP: CONFERMA PAGAMENTO
  // ============================
  if (step === 'confirm') {
    return (
      <div className="detail-confirm page-container">
        <div className="confirm-icon">✓</div>
        <h2 className="confirm-title">Iscrizione Confermata!</h2>

        <p className="confirm-sub">
          Sei iscritto a <strong>{corso.name}</strong>.<br />
          Riceverai una email di conferma con tutti i dettagli.
        </p>

        <div className="confirm-summary card">
          <div className="confirm-row"><span>Corso</span><span>{corso.name}</span></div>
          <div className="confirm-row"><span>Coach</span><span>{corso.coach}</span></div>
          <div className="confirm-row"><span>Orario</span><span>{corso.schedule}</span></div>
          <div className="confirm-row"><span>Pagamento</span><span>€{corso.price}/mese</span></div>
        </div>

        <button className="btn-primary" onClick={() => navigate('/corsi')}>
          TORNA AI CORSI
        </button>
      </div>
    );
  }

  // ============================
  //   STEP: DETTAGLIO CORSO
  // ============================
  return (
    <div className="corso-detail page-container">
      <button
        className="detail-back"
        onClick={() => (step === 'payment' ? setStep('detail') : navigate(-1))}
      >
        <ArrowBackIcon fontSize="small" />
        {step === 'payment' ? 'Dettagli corso' : 'Corsi'}
      </button>

      {step === 'detail' && (
        <>
          <div className="detail-header">
            <span
              className="detail-tag"
              style={{ '--tag-color': corso.tag_color }}
            >
              {corso.tag}
            </span>

            <h1 className="detail-title">{corso.name}</h1>
            <p className="detail-desc">{corso.description}</p>
          </div>

          <div className="detail-meta card">
            <div className="detail-meta-row">
              <PersonIcon sx={{ color: '#3ddc84', fontSize: '1.1rem' }} />
              <div>
                <p className="detail-meta-label">Coach</p>
                <p className="detail-meta-val">{corso.coach}</p>
              </div>
            </div>

            <div className="detail-meta-row">
              <CalendarMonthIcon sx={{ color: '#3ddc84', fontSize: '1.1rem' }} />
              <div>
                <p className="detail-meta-label">Orario</p>
                <p className="detail-meta-val">{corso.schedule}</p>
              </div>
            </div>

            <div className="detail-meta-row">
              <AccessTimeIcon sx={{ color: '#3ddc84', fontSize: '1.1rem' }} />
              <div>
                <p className="detail-meta-label">Durata</p>
                <p className="detail-meta-val">{corso.duration}</p>
              </div>
            </div>

            <div className="detail-meta-row">
              <EuroIcon sx={{ color: '#3ddc84', fontSize: '1.1rem' }} />
              <div>
                <p className="detail-meta-label">Costo</p>
                <p className="detail-meta-val">€{corso.price}/mese</p>
              </div>
            </div>
          </div>

          <div className="detail-spots">
            <p>
              Posti disponibili:{' '}
              <strong
                style={{
                  color:
                    corso.spots > 2
                      ? '#3ddc84'
                      : corso.spots > 0
                      ? '#faad14'
                      : '#ff4d4f',
                }}
              >
                {corso.spots}/{corso.max_spots}
              </strong>
            </p>

            <div className="corso-spots-bar">
              <div
                className="corso-spots-bar__fill"
                style={{
                  width: `${((corso.max_spots - corso.spots) / corso.max_spots) * 100}%`,
                }}
              />
            </div>
          </div>

          {corso.enrolled ? (
            <div className="detail-enrolled">✓ Sei già iscritto a questo corso</div>
          ) : corso.spots === 0 ? (
            <div className="detail-full">
              Lista d'attesa disponibile — contatta la reception
            </div>
          ) : (
            <button className="btn-primary" onClick={() => setStep('payment')}>
              ISCRIVITI — €{corso.price}/MESE
            </button>
          )}
        </>
      )}

      {/* ============================
          STEP: PAGAMENTO
      ============================ */}
      {step === 'payment' && (
        <div className="payment-section">
          <h2 className="payment-title">Pagamento Sicuro</h2>

          <div className="payment-secure">
            <LockIcon sx={{ fontSize: '0.9rem', color: '#3ddc84' }} />
            <span>Connessione sicura SSL — i tuoi dati sono protetti</span>
          </div>

          <div className="payment-summary card">
            <div className="confirm-row">
              <span>Corso</span>
              <span>{corso.name}</span>
            </div>
            <div className="confirm-row total">
              <span>Totale mensile</span>
              <span>€{corso.price}</span>
            </div>
          </div>

          <div className="payment-form">
            <TextField
              label="Nome sul titolo"
              name="name"
              value={card.name}
              onChange={handleCard}
              placeholder="Mario Rossi"
            />

            <TextField
              label="Numero carta"
              name="number"
              value={card.number}
              onChange={(e) =>
                setCard((c) => ({ ...c, number: formatCard(e.target.value) }))
              }
              placeholder="1234 5678 9012 3456"
              inputProps={{ inputMode: 'numeric' }}
            />

            <div className="payment-row">
              <TextField
                label="Scadenza"
                name="expiry"
                value={card.expiry}
                onChange={(e) =>
                  setCard((c) => ({ ...c, expiry: formatExpiry(e.target.value) }))
                }
                placeholder="MM/AA"
                inputProps={{ inputMode: 'numeric' }}
              />

              <TextField
                label="CVV"
                name="cvv"
                value={card.cvv}
                onChange={(e) =>
                  setCard((c) => ({ ...c, cvv: e.target.value.slice(0, 3) }))
                }
                placeholder="123"
                inputProps={{ inputMode: 'numeric' }}
                type="password"
              />
            </div>
          </div>

          <p className="payment-disclaimer">
            Accettando autorizzi un addebito mensile di €{corso.price}. Puoi disdire in qualsiasi momento dalla sezione abbonamenti.
            Consulta la nostra <a href="/privacy">Privacy Policy</a> per informazioni sul trattamento dei dati di pagamento.
          </p>

          <button
            className="btn-primary"
            onClick={pay}
            disabled={
              !card.name ||
              card.number.length < 19 ||
              !card.expiry ||
              !card.cvv
            }
          >
            CONFERMA PAGAMENTO — €{corso.price}
          </button>
        </div>
      )}
    </div>
  );
}
