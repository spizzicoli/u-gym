import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBackRounded';
import './PrivacyPolicy.scss';

export default function PrivacyPolicy() {
  const navigate = useNavigate();

  return (
    <div className="privacy-page page-container">
      <button className="detail-back" onClick={() => navigate(-1)}>
        <ArrowBackIcon fontSize="small" /> Indietro
      </button>

      <h1 className="page-title">Privacy <span>Policy</span></h1>
      <p className="privacy-update">Ultimo aggiornamento: 1 gennaio 2025</p>

      <div className="privacy-content">

        <section className="privacy-section">
          <h2>1. Titolare del Trattamento</h2>
          <p>
            <strong>U-GYM S.r.l.</strong><br />
            Sede legale: Via Aurelia 120, 55049 Viareggio (LU), Italia<br />
            P.IVA: 01234567890<br />
            Email DPO: <a href="mailto:privacy@ugym.it">privacy@ugym.it</a>
          </p>
        </section>

        <section className="privacy-section">
          <h2>2. Dati Raccolti e Finalità</h2>

          <h3>2.1 Dati di Registrazione</h3>
          <p>In fase di registrazione raccogliamo:</p>
          <ul>
            <li><strong>Nome utente</strong> — identificazione nell'app e personalizzazione dell'esperienza</li>
            <li><strong>Indirizzo email</strong> — comunicazioni di servizio, recupero password, notifiche iscrizioni</li>
            <li><strong>Password</strong> — gestita in modo sicuro da Firebase Authentication, non accessibile in chiaro a nessun operatore</li>
          </ul>
          <p>Base giuridica: esecuzione del contratto (art. 6, par. 1, lett. b GDPR).</p>

          <h3>2.2 Dati di Geolocalizzazione</h3>
          <p>
            Con il tuo esplicito consenso, accediamo alla posizione GPS del dispositivo per mostrarti le sedi U-GYM più vicine.
            La posizione <strong>non viene memorizzata sui nostri server</strong>: è usata esclusivamente in tempo reale per il calcolo delle distanze.
            Puoi revocare il permesso in qualsiasi momento dalle impostazioni del dispositivo.
          </p>
          <p>Base giuridica: consenso dell'interessato (art. 6, par. 1, lett. a GDPR).</p>

          <h3>2.3 Dati di Pagamento</h3>
          <p>
            I dati della carta di credito (numero, scadenza, CVV) sono trattati esclusivamente dal nostro provider di pagamento certificato PCI DSS.
            U-GYM <strong>non memorizza</strong> i dati della carta sul proprio sistema; conserviamo solo il token di transazione e la conferma di pagamento.
          </p>
          <p>I dati di fatturazione (importo, data, corso acquistato) sono conservati per 10 anni ai fini fiscali (obblighi di legge).</p>
          <p>Base giuridica: esecuzione del contratto e obbligo legale (art. 6, par. 1, lett. b e c GDPR).</p>

          <h3>2.4 Dati di Utilizzo dell'App</h3>
          <p>
            Raccogliamo dati anonimi sull'utilizzo dell'app (pagine visitate, frequenza di accesso, errori tecnici) per migliorare il servizio.
            Questi dati non sono collegati all'identità dell'utente.
          </p>
        </section>

        <section className="privacy-section">
          <h2>3. Badge QR e Accesso in Palestra</h2>
          <p>
            Il QR code generato nell'app contiene un token temporaneo (validità 60 secondi) con il tuo identificativo utente.
            Ogni accesso tramite tornello viene registrato con orario e sede per motivi di sicurezza e statistici. Questi log sono conservati per 12 mesi.
          </p>
        </section>

        <section className="privacy-section">
          <h2>4. Conservazione dei Dati</h2>
          <ul>
            <li>Dati account: per tutta la durata del rapporto contrattuale + 2 anni</li>
            <li>Log di accesso: 12 mesi</li>
            <li>Dati di fatturazione: 10 anni (obbligo fiscale)</li>
            <li>Dati di geolocalizzazione: non conservati</li>
          </ul>
        </section>

        <section className="privacy-section">
          <h2>5. Condivisione con Terze Parti</h2>
          <p>I tuoi dati non vengono venduti a terzi. Vengono condivisi esclusivamente con:</p>
          <ul>
            <li><strong>Provider di pagamento</strong> (es. Stripe) — per elaborare le transazioni</li>
            <li><strong>Servizi di hosting</strong> — per erogare l'app in sicurezza</li>
            <li><strong>Autorità competenti</strong> — se richiesto per obbligo di legge</li>
          </ul>
        </section>

        <section className="privacy-section">
          <h2>6. I Tuoi Diritti (GDPR)</h2>
          <p>Hai il diritto di:</p>
          <ul>
            <li>Accedere ai tuoi dati personali (art. 15)</li>
            <li>Rettificarli se inesatti (art. 16)</li>
            <li>Chiederne la cancellazione (art. 17)</li>
            <li>Limitare il trattamento (art. 18)</li>
            <li>Portabilità dei dati (art. 20)</li>
            <li>Opporti al trattamento (art. 21)</li>
            <li>Revocare il consenso in qualsiasi momento senza pregiudicare i trattamenti precedenti</li>
          </ul>
          <p>
            Per esercitare i tuoi diritti, scrivi a <a href="mailto:privacy@ugym.it">privacy@ugym.it</a>.
            Hai anche il diritto di proporre reclamo al Garante per la Protezione dei Dati Personali (www.garanteprivacy.it).
          </p>
        </section>

        <section className="privacy-section">
          <h2>7. Sicurezza</h2>
          <p>
            Adottiamo misure tecniche e organizzative adeguate: cifratura TLS in transito, cifratura a riposo, autenticazione sicura,
            accesso ai dati limitato al personale autorizzato e audit periodici di sicurezza.
          </p>
        </section>

        <section className="privacy-section">
          <h2>8. Modifiche alla Privacy Policy</h2>
          <p>
            Eventuali modifiche saranno comunicate via email e/o tramite avviso nell'app con almeno 30 giorni di anticipo.
            L'uso continuato dell'app dopo tale termine costituisce accettazione della nuova versione.
          </p>
        </section>

        <div className="privacy-contact">
          <p>Per qualsiasi domanda: <a href="mailto:privacy@ugym.it">privacy@ugym.it</a></p>
        </div>
      </div>
    </div>
  );
}
