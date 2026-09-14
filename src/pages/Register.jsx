import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { TextField, InputAdornment, IconButton } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenterRounded';
import { useApp } from '../context/AppContext';
import { registerUser } from '../lib/api';
import './Auth.scss';

export default function Register() {
  const navigate = useNavigate();
  const { login } = useApp();
  const [form, setForm] = useState({ username: '', email: '', password: '', confirm: '', role: '' });
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handle = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.username || !form.email || !form.password || !form.confirm) {
      setError('Compila tutti i campi');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(form.email)) {
      setError('Email non valida');
      return;
    }
    if (form.password.length < 6) {
      setError('La password deve essere di almeno 6 caratteri');
      return;
    }
    if (form.password !== form.confirm) {
      setError('Le password non coincidono');
      return;
    }
    if (!form.role) {
      setError('Seleziona un ruolo');
      return;
    }

    try {
      setLoading(true);

      const user = await registerUser(
        form.username,
        form.email,
        form.password,
        form.role
      );

      // Salva utente nel context
      login({
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        trainer_id: user.trainer_id
      });

      navigate('/');
    } catch (err) {
      setError(err.message || 'Errore durante la registrazione');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg">
        <div className="auth-bg__blob auth-bg__blob--1" />
        <div className="auth-bg__blob auth-bg__blob--2" />
      </div>

      <div className="auth-container">
        <div className="auth-logo">
          <div className="auth-logo__icon"><FitnessCenterIcon /></div>
          <span className="auth-logo__name">U-<span>GYM</span></span>
        </div>

        <div className="auth-card">
          <h1 className="auth-card__title">Crea Account</h1>
          <p className="auth-card__sub">Inizia il tuo percorso</p>

          <form onSubmit={submit} className="auth-form">
            <TextField
              name="username"
              label="Username"
              value={form.username}
              onChange={handle}
              autoComplete="username"
            />
            <TextField
              name="email"
              label="Email"
              type="email"
              value={form.email}
              onChange={handle}
              autoComplete="email"
            />
            <TextField
              name="password"
              label="Password"
              type={showPass ? 'text' : 'password'}
              value={form.password}
              onChange={handle}
              autoComplete="new-password"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPass(v => !v)} edge="end" sx={{ color: '#8a8f99' }}>
                      {showPass ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
            <TextField
              name="confirm"
              label="Conferma Password"
              type={showPass ? 'text' : 'password'}
              value={form.confirm}
              onChange={handle}
              autoComplete="new-password"
            />

            {error && <p className="auth-error">{error}</p>}

            <select
              name="role"
              value={form.role}
              onChange={handle}
              className="auth-select"
            >
              <option value="">Seleziona ruolo</option>
              <option value="cliente">Cliente</option>
              <option value="trainer">Personal Trainer</option>
            </select>

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'REGISTRAZIONE...' : 'REGISTRATI'}
            </button>
          </form>

          <p className="auth-footer">
            Hai già un account?{' '}
            <Link to="/login">Accedi</Link>
          </p>
          <p className="auth-footer" style={{ marginTop: 8, fontSize: '0.75rem', color: '#8a8f99' }}>
            Registrandoti accetti la nostra{' '}
            <Link to="/privacy" className="auth-footer__privacy">Privacy Policy</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
