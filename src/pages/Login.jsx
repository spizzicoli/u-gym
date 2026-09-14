import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { TextField, InputAdornment, IconButton } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenterRounded';
import { useApp } from '../context/AppContext';
import { loginUser } from '../lib/api';
import './Auth.scss';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useApp();
  const [form, setForm] = useState({ credential: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handle = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.credential || !form.password) {
      setError('Compila tutti i campi');
      return;
    }

    try {
      setLoading(true);

      const user = await loginUser(form.credential, form.password);

      login({
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        trainer_id: user.trainer_id
      });

      navigate('/');
    } catch (err) {
      setError(err.message || 'Credenziali non valide');
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
          <h1 className="auth-card__title">Bentornato</h1>
          <p className="auth-card__sub">Accedi al tuo account</p>

          <form onSubmit={submit} className="auth-form">
            <TextField
              name="credential"
              label="Email o Username"
              value={form.credential}
              onChange={handle}
              autoComplete="username"
            />
            <TextField
              name="password"
              label="Password"
              type={showPass ? 'text' : 'password'}
              value={form.password}
              onChange={handle}
              autoComplete="current-password"
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

            {error && <p className="auth-error">{error}</p>}

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'ACCESSO IN CORSO...' : 'ACCEDI'}
            </button>
          </form>

          <p className="auth-footer">
            Non hai un account?{' '}
            <Link to="/register">Registrati</Link>
          </p>
          <p className="auth-footer" style={{ marginTop: 8 }}>
            <Link to="/privacy" className="auth-footer__privacy">Privacy Policy</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
