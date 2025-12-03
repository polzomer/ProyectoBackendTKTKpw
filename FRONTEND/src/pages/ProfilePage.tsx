import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getActiveUser } from '../utils/storage';
import { getLevelInfo } from '../utils/leveling';
import './ProfilePage.css';

export default function ProfilePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(getActiveUser());

  useEffect(() => {
    const onChange = () => setUser(getActiveUser());
    window.addEventListener('userChanged', onChange);
    return () => window.removeEventListener('userChanged', onChange);
  }, []);

  if (!user) {
    return (
      <div className="profile-page">
        <h2>Perfil</h2>
        <p>Inicia sesión para ver tu perfil.</p>
        <button className="back-button" onClick={() => navigate('/')}>Volver al Inicio</button>
      </div>
    );
  }

  const levelInfo = getLevelInfo(user.points || 0);

  return (
    <div className="profile-page">
      <h2 className="title">Tu Perfil</h2>
      <div className="card profile-card">
        <div className="avatar">
          <img src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png" alt="Avatar" />
        </div>
        <div className="info">
          <div className="name">{user.name}</div>
          {user.username && <div className="muted">@{user.username}</div>}
          <div className="grid">
            <div>
              <div className="label">Nivel</div>
              <div className="value">{levelInfo.currentLevelName}</div>
            </div>
            <div>
              <div className="label">Puntos</div>
              <div className="value">{(user.points || 0).toLocaleString()}</div>
            </div>
            <div>
              <div className="label">Monedas</div>
              <div className="value">{(user.coins || 0).toLocaleString()}</div>
            </div>
            <div>
              <div className="label">Horas de streamer</div>
              <div className="value">{(user.streamerHours || 0).toFixed(2)}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="card progress-card">
        <h3>Progreso de Nivel</h3>
        <div className="progress-bar-container">
          <div className="progress-bar-fill" style={{ width: `${levelInfo.progressPercentage}%` }}></div>
        </div>
        {levelInfo.nextLevelName ? (
          <p className="motivation">Faltan {levelInfo.pointsToNextLevel} puntos para {levelInfo.nextLevelName}.</p>
        ) : (
          <p className="motivation">Has alcanzado el nivel máximo.</p>
        )}
      </div>

      <button className="back-button" onClick={() => navigate(-1)}>‹ Regresar</button>
    </div>
  );
}
