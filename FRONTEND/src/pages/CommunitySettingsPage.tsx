import { useState, useEffect } from 'react';
import { getActiveUser, updateUser } from '../utils/storage';
import type { LevelConfig } from '../utils/types';
import { DEFAULT_VIEWER_LEVELS } from '../utils/leveling';
import './CommunitySettingsPage.css';

export default function CommunitySettingsPage() {
  const [user, setUser] = useState(getActiveUser());
  const [levels, setLevels] = useState<LevelConfig[]>([]);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    if (user) {
      setLevels(user.viewerLevelConfig && user.viewerLevelConfig.length > 0 ? user.viewerLevelConfig : DEFAULT_VIEWER_LEVELS);
    }
  }, [user]);

  const handlePointsChange = (index: number, points: number) => {
    const updatedLevels = [...levels];
    const minPoints = index > 0 ? updatedLevels[index - 1].points + 1 : 0;
    updatedLevels[index].points = Math.max(minPoints, points);
    setLevels(updatedLevels);
  };

  const handleSaveChanges = () => {
    if (!user) return;
    const updatedUser = { ...user, viewerLevelConfig: levels };
    updateUser(updatedUser);
    setUser(updatedUser);
    setFeedback('¡Cambios guardados con éxito!');
    setTimeout(() => setFeedback(''), 2000);
  };

  if (!user) return <p>Inicia sesión para acceder a esta página.</p>;

  return (
    <div className="community-settings-page">
      <div className="page-header">
        <h2>Configurar Niveles de Espectador</h2>
        <button onClick={handleSaveChanges} className="save-button">Guardar Cambios</button>
      </div>
      <p className="page-subtitle">
        Define los puntos que tus espectadores necesitan para alcanzar cada nivel en tu comunidad.
      </p>

      <div className="levels-config-list">
        {levels.map((level, index) => (
          <div key={index} className="level-config-item">
            <span className="level-name">{level.name}</span>
            <input 
              type="number"
              value={level.points}
              onChange={(e) => handlePointsChange(index, parseInt(e.target.value) || 0)}
              className="points-input"
              disabled={index === 0}
              min={index > 0 ? (levels[index-1]?.points ?? 0) + 1 : 0}
            />
            <span>puntos</span>
          </div>
        ))}
      </div>
      
      {feedback && <div className="feedback-message">{feedback}</div>}
    </div>
  );
}