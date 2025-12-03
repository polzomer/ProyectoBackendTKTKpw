import { useParams, Link } from 'react-router-dom';
import './CategoryPage.css';

const MOCK_DATA = {
  categories: {
    'Gaming': { img: 'https://picsum.photos/seed/cat1/300/400', viewers: '1.2M', followers: '69.8M', tags: ['Shooter', 'Aventura', 'Acción'] },
    'IRL': { img: 'https://picsum.photos/seed/cat2/300/400', viewers: '890k', followers: '12.1M', tags: ['Charlando', 'Viajes', 'Eventos'] },
    'Música': { img: 'https://picsum.photos/seed/cat3/300/400', viewers: '450k', followers: '25.3M', tags: ['DJ', 'Producción', 'Concierto'] },
  },
  live_streams: [
    { id: 's6', title: 'Creando un personaje 3D', streamer: '@arteDigital', category: 'Arte', viewers: 530, profilePic: 'https://i.pravatar.cc/40?u=arte' },
    { id: 's7', title: 'Sesión de DJ en vivo', streamer: '@djBeats', category: 'Música', viewers: 1800, profilePic: 'https://i.pravatar.cc/40?u=dj' },
    { id: 's8', title: 'Explorando la ciudad', streamer: '@viajeroUrbano', category: 'IRL', viewers: 950, profilePic: 'https://i.pravatar.cc/40?u=viajero' },
    { id: 's9', title: 'Torneo de eSports', streamer: '@proGamer', category: 'Gaming', viewers: 12500, profilePic: 'https://i.pravatar.cc/40?u=gamer' },
    { id: 's12', title: 'Rankeds hasta el amanecer', streamer: '@nocheGamer', category: 'Gaming', viewers: 8200, profilePic: 'https://i.pravatar.cc/40?u=noche' },
  ]
};

export default function CategoryPage() {
  const { categoryName } = useParams<{ categoryName: string }>();

  if (!categoryName) {
    return <p>Categoría no especificada.</p>;
  }

  const categoryInfo = MOCK_DATA.categories[categoryName as keyof typeof MOCK_DATA.categories];
  
  const filteredStreams = MOCK_DATA.live_streams.filter(
    stream => stream.category.toLowerCase() === categoryName.toLowerCase()
  );

  if (!categoryInfo) {
    return <p>Categoría no encontrada: {categoryName}</p>;
  }

  return (
    <div className="category-page">
      <header className="category-page-header">
        <img src={categoryInfo.img} alt={categoryName} className="category-logo" />
        <div className="category-header-info">
          <h1>{categoryName}</h1>
          <div className="category-stats">
            <span>{categoryInfo.viewers} espectadores</span>•
            <span>{categoryInfo.followers} seguidores</span>
          </div>
          <div className="category-tags">
            {categoryInfo.tags.map(tag => <span key={tag} className="tag">{tag}</span>)}
          </div>
          <button className="follow-button">Seguir</button>
        </div>
      </header>

      <nav className="category-tabs">
        <span className="tab-item active">Canales en directo</span>
        <span className="tab-item">Videos</span>
        <span className="tab-item">Clips</span>
      </nav>

      <div className="stream-grid">
        {filteredStreams.length > 0 ? (
          filteredStreams.map(stream => (
            <Link to={`/stream/${stream.id}`} key={stream.id} className="live-stream-card">
              <div className="live-stream-thumbnail">
                <img src={`https://picsum.photos/seed/${stream.id}/400/225`} alt={stream.title} />
                <span className="live-badge">EN DIRECTO</span>
              </div>
              <div className="live-stream-info">
                <img src={stream.profilePic} alt={stream.streamer} className="streamer-avatar" />
                <div className="stream-text">
                  <div className="stream-title">{stream.title}</div>
                  <div className="streamer-name">{stream.streamer}</div>
                  <div className="stream-category">{stream.category}</div>
                </div>
              </div>
            </Link>
          ))
        ) : (
          <p>No hay canales en directo para esta categoría en este momento.</p>
        )}
      </div>
    </div>
  );
}