import { Link } from 'react-router-dom';
import './ExplorarPage.css';

const CATEGORIES = [
  { name: 'Gaming', viewers: '1.2M', img: 'https://picsum.photos/seed/cat1/400/500' },
  { name: 'IRL', viewers: '890k', img: 'https://picsum.photos/seed/cat2/400/500' },
  { name: 'Música', viewers: '450k', img: 'https://picsum.photos/seed/cat3/400/500' },
  { name: 'Arte', viewers: '120k', img: 'https://picsum.photos/seed/cat4/400/500' },
  { name: 'Deportes', viewers: '300k', img: 'https://picsum.photos/seed/cat5/400/500' },
  { name: 'Charlando', viewers: '950k', img: 'https://picsum.photos/seed/cat6/400/500' },
  { name: 'Comida', viewers: '85k', img: 'https://picsum.photos/seed/cat7/400/500' },
];

const LIVE_STREAMS = [
  { id: 's6', title: 'Creando un personaje 3D', streamer: '@arteDigital', category: 'Arte', viewers: 530, profilePic: 'https://i.pravatar.cc/40?u=arte' },
  { id: 's7', title: 'Sesión de DJ en vivo', streamer: '@djBeats', category: 'Música', viewers: 1800, profilePic: 'https://i.pravatar.cc/40?u=dj' },
  { id: 's8', title: 'Explorando la ciudad', streamer: '@viajeroUrbano', category: 'IRL', viewers: 950, profilePic: 'https://i.pravatar.cc/40?u=viajero' },
  { id: 's9', title: 'Torneo de eSports', streamer: '@proGamer', category: 'Gaming', viewers: 12500, profilePic: 'https://i.pravatar.cc/40?u=gamer' },
  { id: 's10', title: 'Final de la Champions', streamer: '@fanFutbol', category: 'Deportes', viewers: 25000, profilePic: 'https://i.pravatar.cc/40?u=futbol' },
  { id: 's11', title: 'Podcast de misterio', streamer: '@narrador', category: 'Charlando', viewers: 1200, profilePic: 'https://i.pravatar.cc/40?u=podcast' },
];

export default function ExplorarPage() {
  return (
    <div className="explorar-page">
      <h2 className="section-title">Explorar Canales y Categorías</h2>
      <p className="section-subtitle">Descubre nuevas comunidades y streams que te podrían gustar.</p>

      <section className="categories-section">
        <h3 className="sub-section-title">Categorías Populares</h3>
        <div className="carousel-container">
          <div className="carousel-track">
            {CATEGORIES.map((category, index) => (
              <Link to={`/category/${category.name}`} key={`${category.name}-${index}`} className="category-card">
                <img src={category.img} alt={category.name} />
                <div className="category-info">
                  <strong>{category.name}</strong>
                  <span>{category.viewers} esp.</span>
                </div>
              </Link>
            ))}
            {CATEGORIES.map((category, index) => (
              <Link to={`/category/${category.name}`} key={`${category.name}-${index}-clone`} className="category-card">
                <img src={category.img} alt={category.name} />
                <div className="category-info">
                  <strong>{category.name}</strong>
                  <span>{category.viewers} esp.</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="live-streams-section">
        <h3 className="sub-section-title">Canales en Vivo Recomendados</h3>
        <div className="carousel-container">
          <div className="carousel-track">
            {LIVE_STREAMS.map((stream, index) => (
              <Link to={`/stream/${stream.id}`} key={`${stream.id}-${index}`} className="live-stream-card">
                <div className="live-stream-thumbnail">
                  <img src={`https://picsum.photos/seed/${stream.id}/400/225`} alt={stream.title} />
                  <span className="live-badge">EN VIVO</span>
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
            ))}
            {LIVE_STREAMS.map((stream, index) => (
              <Link to={`/stream/${stream.id}`} key={`${stream.id}-${index}-clone`} className="live-stream-card">
                <div className="live-stream-thumbnail">
                  <img src={`https://picsum.photos/seed/${stream.id}/400/225`} alt={stream.title} />
                  <span className="live-badge">EN VIVO</span>
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
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}