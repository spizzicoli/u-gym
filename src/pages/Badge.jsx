import { useApp } from '../context/AppContext';
import { QRCodeSVG } from 'qrcode.react';
import QrCode2Icon from '@mui/icons-material/QrCode2Rounded';
import LocationOnIcon from '@mui/icons-material/LocationOnRounded';
import CheckCircleIcon from '@mui/icons-material/CheckCircleRounded';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenterRounded';
import './Badge.scss';

export default function Badge() {
  const { user, selectedGym } = useApp();
  const qrData = JSON.stringify({
    userId: user?.id || 'u-gym-user',
    username: user?.username,
    gym: selectedGym?.id || 1,
    ts: Date.now(),
  });

  return (
    <div className="badge-page page-container">
      <h1 className="page-title">Il mio <span>Badge</span></h1>

      <div className="badge-card">
        <div className="badge-card__header">
          <div className="badge-card__logo"><FitnessCenterIcon /></div>
          <div>
            <h2 className="badge-card__name">{user?.username || 'Atleta'}</h2>
            <p className="badge-card__email">{user?.email}</p>
          </div>
          <div className="badge-card__status">
            <CheckCircleIcon sx={{ color: '#3ddc84', fontSize: '1.1rem' }} />
            <span>Attivo</span>
          </div>
        </div>

        <div className="badge-qr-wrap">
          <div className="badge-qr">
            <QRCodeSVG
              value={qrData}
              size={220}
              bgColor="transparent"
              fgColor="#3ddc84"
              level="H"
            />
          </div>
          <div className="badge-qr__scan-line" />
        </div>

        <div className="badge-card__footer">
          <div className="badge-info">
            <QrCode2Icon sx={{ color: '#8a8f99', fontSize: '1rem' }} />
            <span>Mostra al tornello per accedere</span>
          </div>
          <div className="badge-info">
            <LocationOnIcon sx={{ color: '#8a8f99', fontSize: '1rem' }} />
            <span>{selectedGym?.name || 'U-GYM'}</span>
          </div>
        </div>

        <p className="badge-refresh">
          Il QR si aggiorna automaticamente ogni 60 secondi per la tua sicurezza
        </p>
      </div>

      <div className="badge-membership">
        <h3 className="badge-membership__title">Abbonamento</h3>
        <div className="badge-membership__row">
          <span>Piano</span>
          <span className="badge-membership__val">Premium Annuale</span>
        </div>
        <div className="badge-membership__row">
          <span>Scadenza</span>
          <span className="badge-membership__val">31 Dicembre 2025</span>
        </div>
        <div className="badge-membership__row">
          <span>Accessi questo mese</span>
          <span className="badge-membership__val">14</span>
        </div>
        <div className="badge-membership__row">
          <span>Stato</span>
          <span className="badge-membership__val badge-membership__val--green">✓ Valido</span>
        </div>
      </div>
    </div>
  );
}
