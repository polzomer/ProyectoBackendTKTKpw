import { useNavigate } from 'react-router-dom';
import { getActiveUser } from '../utils/storage';
import { getLevelInfo } from '../utils/leveling';
import './LevelsPage.css';

export default function LevelsPage() {
  const navigate = useNavigate();
  const user = getActiveUser();

  if (!user) {
    return (
      <div className="levels-page">
        <h2>Progreso de Nivel</h2>
        <p>Inicia sesión para ver tu progreso.</p>
        <button className="back-button" onClick={() => navigate('/')}>Volver al Inicio</button>
      </div>
    );
  }

  const levelInfo = getLevelInfo(user.points);

  return (
    <div className="levels-page">
      <h2 className="levels-title">Tu Progreso de Nivel</h2>
      
      <div className="progress-card">
        <div className="level-header">
          <h3>Nivel Actual: <span className="current-level">{levelInfo.currentLevelName}</span></h3>
          <p className="user-points">Puntos Totales: {user.points.toLocaleString()}</p>
        </div>

        <div className="progress-bar-container">
          <div 
            className="progress-bar-fill" 
            style={{ width: `${levelInfo.progressPercentage}%` }}
          ></div>
        </div>

        {levelInfo.nextLevelName ? (
          <p className="motivation-text">
            ¡Te faltan <strong>{levelInfo.pointsToNextLevel.toLocaleString()}</strong> puntos para alcanzar el nivel <strong>{levelInfo.nextLevelName}</strong>!
          </p>
        ) : (
          <p className="motivation-text">
            ¡Felicidades! Has alcanzado el nivel máximo.
          </p>
        )}
      </div>

      <button className="back-button" onClick={() => navigate(-1)}>
        ‹ Regresar
      </button>
    </div>
  );
}