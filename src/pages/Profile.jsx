import { useApp } from '../context/AppContext';
import './Profile.scss';

export default function Profile() {
  const { user, selectedGym, logout } = useApp?.() || {};

  return (
    <div className="page-container profile-page">
      <h1 className="profile-page__title">Profilo</h1>

      <div className="profile-card">
        <p className="profile-card__label">Username</p>
        <p className="profile-card__value">{user?.username}</p>

        <p className="profile-card__label">Email</p>
        <p className="profile-card__value">{user?.email}</p>

        <p className="profile-card__label">Palestra selezionata</p>
        <p className="profile-card__value">
          {selectedGym?.name || 'Nessuna'}
        </p>
      </div>

      {logout && (
        <button className="profile-page__logout" onClick={logout}>
          Esci
        </button>
      )}
    </div>
  );
}
