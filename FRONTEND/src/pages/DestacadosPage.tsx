import { Link } from 'react-router-dom';
import './DestacadosPage.css';

const TOP_STREAMERS = [
  { id: 'proGamer', name: '@proGamer', category: 'Gaming', profilePic: 'https://i.pravatar.cc/80?u=gamer' },
  { id: 'djBeats', name: '@djBeats', category: 'Música', profilePic: 'https://i.pravatar.cc/80?u=dj' },
  { id: 'viajeroUrbano', name: '@viajeroUrbano', category: 'IRL', profilePic: 'https://i.pravatar.cc/80?u=viajero' },
  { id: 'fanFutbol', name: '@fanFutbol', category: 'Deportes', profilePic: 'https://i.pravatar.cc/80?u=futbol' },
  { id: 'arteDigital', name: '@arteDigital', category: 'Arte', profilePic: 'https://i.pravatar.cc/80?u=arte' },
];

const POPULAR_CLIPS = [
  { id: 'c1', title: 'Jugada increíble en el torneo', streamer: '@proGamer', views: '2.1M', thumbnail: 'https://picsum.photos/seed/clip1/400/225' },
  { id: 'c2', title: 'Reacción épica a un susto', streamer: '@narrador', views: '1.8M', thumbnail: 'https://picsum.photos/seed/clip2/400/225' },
  { id: 'c3', title: 'El mejor drop de la noche', streamer: '@djBeats', views: '1.5M', thumbnail: 'https://picsum.photos/seed/clip3/400/225' },
  { id: 'c4', title: 'Momento más divertido del viaje', streamer: '@viajeroUrbano', views: '980k', thumbnail: 'https://picsum.photos/seed/clip4/400/225' },
];

export default function DestacadosPage() {
  return (
    <div className="destacados-page">
      <h2 className="section-title">Contenido Destacado</h2>
      <p className="section-subtitle">Descubre a los streamers y los clips más populares de la comunidad.</p>

      <section>
        <h3 className="sub-section-title">Streamers del Momento</h3>
        <div className="top-streamers-carousel">
          {TOP_STREAMERS.map(streamer => (
            <Link to={`/perfil/${streamer.id}`} key={streamer.id} className="streamer-card-link">
              <div className="streamer-card">
                <img src={streamer.profilePic} alt={streamer.name} className="streamer-avatar" />
                <div className="streamer-name">{streamer.name}</div>
                <div className="streamer-category">{streamer.category}</div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <h3 className="sub-section-title">Clips Populares de la Semana</h3>
        <div className="clips-grid">
          {POPULAR_CLIPS.map(clip => (
            <Link to={`/clip/${clip.id}`} key={clip.id} className="clip-card-link">
              <div className="clip-card">
                <div className="clip-thumbnail-wrapper">
                  <img src={clip.thumbnail} alt={clip.title} />
                  <span className="clip-views">{clip.views} vistas</span>
                </div>
                <div className="clip-info">
                  <div className="clip-title">{clip.title}</div>
                  <div className="clip-streamer">{clip.streamer}</div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}