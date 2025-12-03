import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getActiveUser, toggleFollowStreamer } from '../utils/storage';
import { MOCK_STREAMERS } from '../utils/mockData';
import { useNotification } from '../context/NotificationContext';
import './ClipPage.css';

const MOCK_CLIP_DATA = {
  c1: {
    title: 'Batalla de baile: Final en vivo',
    streamer: '@dance_master',
    views: 1489,
    date: 'hace 7 días',
    streamerProfilePic: 'https://i.pravatar.cc/50?u=dance_master',
  }
};

export default function ClipPage() {
  const { clipId: _clipId } = useParams<{ clipId: string }>(); 
  const clipId = _clipId;

  const { showNotification } = useNotification();
  const [user, setUser] = useState(getActiveUser());
  
  const clipData = clipId ? MOCK_CLIP_DATA[clipId as keyof typeof MOCK_CLIP_DATA] : null;
  
  if (!clipId || !clipData) {
    return <p>Clip no encontrado.</p>;
  }

  const streamerId = 'dance_master';
  const streamer = MOCK_STREAMERS[streamerId as keyof typeof MOCK_STREAMERS];

  const [isFollowing, setIsFollowing] = useState(user?.following?.includes(streamer.id) || false);

  useEffect(() => {
    const handleUserChange = () => {
      const updatedUser = getActiveUser();
      setUser(updatedUser);
      setIsFollowing(updatedUser?.following?.includes(streamer.id) || false);
    };
    window.addEventListener("userChanged", handleUserChange);
    return () => window.removeEventListener("userChanged", handleUserChange);
  }, [streamer.id]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    showNotification('¡Enlace del clip copiado al portapapeles!');
  };

  const handleFollow = () => {
    if (!user) {
      showNotification('Debes iniciar sesión para seguir a un streamer.');
      return;
    }
    toggleFollowStreamer(streamer.id);
  };

  return (
    <div className="clip-page-layout">
      <div className="clip-main-content">
        <div className="clip-video-player">
          <img src="https://picsum.photos/seed/clip/1280/720" alt="Reproductor de video" />
          <div className="video-controls">
            <span>▶</span><div className="progress-bar"></div><span>🔊</span>
          </div>
        </div>
        <div className="clip-info-section">
          <div className="clip-title-bar">
            <h4>{clipData.title}</h4>
            <button onClick={handleShare} className="share-button">🔗 Compartir</button>
          </div>
          <p className="clip-meta">{clipData.views.toLocaleString()} visualizaciones • {clipData.date}</p>
          <div className="streamer-info-bar">
            <img src={streamer.profilePic} alt="Avatar del streamer" />
            <div className="streamer-details">
              <strong>{streamer.name}</strong>
              <small>{streamer.followers.toLocaleString()} seguidores</small>
            </div>
            <button onClick={handleFollow} className={isFollowing ? 'following-button' : 'follow-button-clip'}>
              {isFollowing ? '✅ Seguido' : 'Seguir'}
            </button>
          </div>
        </div>
      </div>
      <aside className="clip-chat-panel">
        <div className="chat-header"><h5>Chat del video</h5></div>
        <div className="chat-body"><p>La repetición de chat de este clip ya no está disponible.</p></div>
      </aside>
    </div>
  );
}