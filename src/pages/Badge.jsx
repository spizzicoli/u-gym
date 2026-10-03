import { useEffect, useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import { QRCodeSVG } from 'qrcode.react';
import QrCode2Icon from '@mui/icons-material/QrCode2Rounded';
import LocationOnIcon from '@mui/icons-material/LocationOnRounded';
import CheckCircleIcon from '@mui/icons-material/CheckCircleRounded';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenterRounded';
import EventAvailableRoundedIcon from '@mui/icons-material/EventAvailableRounded';
import PaymentsRoundedIcon from '@mui/icons-material/PaymentsRounded';
import { fetchAttendanceStats, fetchPayments, requestMembershipRenewal } from '../lib/api';
import './Badge.scss';

function parseMembership(user) {
  const m = user?.membership || {};
  const expires = m.expires_at || user?.membership_expires_at || user?.expires_at || '';
  return { plan: m.plan || user?.membership_plan || 'Abbonamento non configurato', expires_at: expires, status: m.status || user?.membership_status || 'active' };
}

export default function Badge() {
  const { user, selectedGym } = useApp();
  const [period, setPeriod] = useState('month');
  const [attendance, setAttendance] = useState({ week: 0, month: 0 });
  const [payments, setPayments] = useState([]);
  const [renewing, setRenewing] = useState(false);
  const [renewed, setRenewed] = useState(false);
  const membership = parseMembership(user);
  const qrData = JSON.stringify({ userId: user?.id || 'u-gym-user', username: user?.username, gym: selectedGym?.id || 1, gym_id: selectedGym?.id || 1, ts: Date.now() });
  const expiry = membership.expires_at ? new Date(membership.expires_at) : null;
  const daysLeft = expiry && !Number.isNaN(expiry.getTime()) ? Math.ceil((expiry - new Date()) / 86400000) : null;
  const accessCount = period === 'week' ? attendance.week : attendance.month;

  useEffect(() => {
    if (!user?.id) return;
    fetchAttendanceStats(user.id, selectedGym?.id).then(setAttendance);
    fetchPayments(user.id).then(setPayments);
  }, [user?.id, selectedGym?.id]);

  const membershipLabel = daysLeft !== null && daysLeft <= 14 ? `Scade tra ${Math.max(0, daysLeft)} giorni` : daysLeft !== null ? 'Valido' : 'Da configurare';
  const membershipClass = daysLeft !== null && daysLeft <= 14 ? 'badge-membership__val--warning' : 'badge-membership__val--green';

  const renew = async () => {
    try { setRenewing(true); await requestMembershipRenewal(user.id, selectedGym?.id, membership); setRenewed(true); }
    catch (e) { alert(e?.message || 'Non è stato possibile inviare la richiesta.'); }
    finally { setRenewing(false); }
  };

  return (
    <div className="badge-page page-container">
      <h1 className="page-title">Il mio <span>Badge</span></h1>
      <div className="badge-card">
        <div className="badge-card__header"><div className="badge-card__logo"><FitnessCenterIcon /></div><div><h2 className="badge-card__name">{user?.username || 'Atleta'}</h2><p className="badge-card__email">{user?.email}</p></div><div className="badge-card__status"><CheckCircleIcon sx={{ color:'var(--color-green)', fontSize:'1.1rem' }}/><span>Attivo</span></div></div>
        <div className="badge-qr-wrap"><div className="badge-qr"><QRCodeSVG value={qrData} size={220} bgColor="transparent" fgColor="var(--color-green)" level="H" /></div><div className="badge-qr__scan-line" /></div>
        <div className="badge-card__footer"><div className="badge-info"><QrCode2Icon sx={{ color:'var(--color-text-muted)', fontSize:'1rem' }}/><span>Mostra al tornello per accedere</span></div><div className="badge-info"><LocationOnIcon sx={{ color:'var(--color-text-muted)', fontSize:'1rem' }}/><span>{selectedGym?.name || 'U-GYM'}</span></div></div>
        <p className="badge-refresh">Il QR si aggiorna automaticamente ogni 60 secondi per la tua sicurezza</p>
      </div>

      <section className="badge-membership">
        <div className="badge-section-head"><h3 className="badge-membership__title">Abbonamento</h3>{daysLeft !== null && daysLeft <= 14 && <span className="expiry-chip">In scadenza</span>}</div>
        <div className="badge-membership__row"><span>Piano</span><span className="badge-membership__val">{membership.plan}</span></div>
        <div className="badge-membership__row"><span>Scadenza</span><span className="badge-membership__val">{expiry ? expiry.toLocaleDateString('it-IT') : 'Non configurata'}</span></div>
        <div className="badge-membership__row"><span>Accessi</span><span className="badge-membership__val">{accessCount} <small>({period === 'week' ? 'questa settimana' : 'questo mese'})</small></span></div>
        <div className="badge-membership__row"><span>Stato</span><span className={`badge-membership__val ${membershipClass}`}>✓ {membershipLabel}</span></div>
        <div className="attendance-toggle"><button className={period==='week'?'active':''} onClick={()=>setPeriod('week')}>Settimana</button><button className={period==='month'?'active':''} onClick={()=>setPeriod('month')}>Mese</button></div>
        {daysLeft !== null && daysLeft <= 30 && <button className="renew-button" disabled={renewing || renewed} onClick={renew}>{renewed ? '✓ Richiesta inviata' : renewing ? 'Invio...' : 'Rinnova abbonamento'}</button>}
        {renewed && <p className="renew-note">La palestra riceverà la tua richiesta di rinnovo.</p>}
        <p className="attendance-note"><EventAvailableRoundedIcon/> Gli accessi sono conteggiati dai passaggi del QR al tornello.</p>
      </section>

      <section className="badge-payments">
        <div className="badge-section-head"><div><h3>Pagamenti e acquisti</h3><p>Abbonamenti, corsi ed extra acquistati</p></div><PaymentsRoundedIcon/></div>
        {payments.length === 0 ? <div className="payments-empty">Nessun pagamento registrato. Quando la palestra inserirà un acquisto nel gestionale, lo vedrai qui.</div> : <div className="payments-list">{payments.map(p => <div className="payment-row" key={p.id}><div><strong>{p.description || p.title || p.type || 'Acquisto'}</strong><small>{p.paid_at ? new Date(p.paid_at).toLocaleDateString('it-IT') : ''}</small></div><b>{p.amount != null ? `${p.amount} ${p.currency || '€'}` : '—'}</b></div>)}</div>}
      </section>
    </div>
  );
}
