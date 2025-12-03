import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getActiveUser, clearActiveUser } from '../utils/storage';
import type { User } from '../utils/storage';
import { MOCK_STREAMERS } from '../utils/mockData';
import { useTheme } from '../context/ThemeContext';
import DepositModal from './DepositModal';
import { getLevelInfo } from '../utils/leveling';
import './RightSidebar.css';

export default function RightSidebar() {
  const [user, setUser] = useState<User | null>(getActiveUser());
  const [guestName, setGuestName] = useState("");
  const [isDepositModalOpen, setDepositModalOpen] = useState(false);
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const handleUserChange = () => { setUser(getActiveUser()); };
    window.addEventListener("userChanged", handleUserChange);
    if (!getActiveUser()) {
      const randomId = Math.floor(Math.random() * 9000) + 1000;
      setGuestName(`guest${randomId}`);
    }
    return () => { window.removeEventListener("userChanged", handleUserChange); };
  }, []);

  const handleLogout = () => {
    clearActiveUser(); 
    window.dispatchEvent(new CustomEvent("userChanged")); 
    navigate("/login"); 
  };

  const levelName = user ? getLevelInfo(user.points).currentLevelName : 'N/A';

  return (
    <>
      <aside className="right-sidebar">
        {user ? (
          <div className="logged-in-view">
            <div className="profile-header">
              <div className="profile-photo-wrapper">
                <img src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png" alt="Foto de perfil" className="profile-photo" />
              </div>
              <div className="profile-info">
                <span className="welcome-message">¡Bienvenido, {user.name}!</span>
                <div className="user-stats">
                  <span>Saldo: <strong>{user.coins} monedas</strong></span>
                  <span className="level-link" onClick={() => navigate('/levels')}>
                    Nivel: <strong>{levelName}</strong>
                  </span>
                </div>
              </div>
            </div>
            <div className="action-buttons">
              <button className="action-btn"><span>💬</span> Mensajes</button>
              <button onClick={() => setDepositModalOpen(true)} className="action-btn deposit-btn"><span>💰</span> Deposita</button>
            </div>
            <button className="vip-button">Club VIP</button>
            
            <div className="preferred-channels">
              <h4>Tus streamers favoritos</h4>
              <div className="followed-list">
                {(user.following && user.following.length > 0) ? (
                  user.following.map(streamerId => {
                    const streamer = MOCK_STREAMERS[streamerId as keyof typeof MOCK_STREAMERS];
                    if (!streamer) return null;
                    return (
                      <div key={streamer.id} className="followed-item">
                        <img src={streamer.profilePic} alt={streamer.name} />
                        <span>{streamer.name}</span>
                      </div>
                    );
                  })
                ) : (
                  <p className="no-followed-message">Sigue a tus streamers favoritos para verlos aquí.</p>
                )}
              </div>
            </div>

            <div className="sidebar-footer">
              <button className="help-button">🆘 Centro de ayuda</button>
              <button onClick={handleLogout} className="logout-button">Cerrar sesión</button>
              <button onClick={toggleTheme} className="theme-button">
                {theme === 'dark' ? '☀️ Modo Claro' : '🌙 Modo Oscuro'}
              </button>
            </div>
          </div>
        ) : (
          <div className="guest-view">
            <div className="user-info">
              <span>{guestName}</span>
              <button onClick={() => navigate("/login")} className="login-button">Iniciar sesión</button>
            </div>
            <div className="login-prompt">
              <p>Porfavor, inicie sesión para utilizar todas las funciones disponibles.</p>
            </div>
            <div className="sidebar-footer">
              <button onClick={toggleTheme} className="theme-button">
                {theme === 'dark' ? '☀️ Modo Claro' : '🌙 Modo Oscuro'}
              </button>
            </div>
          </div>
        )}
      </aside>
      {isDepositModalOpen && <DepositModal onClose={() => setDepositModalOpen(false)} />}
    </>
  );
}