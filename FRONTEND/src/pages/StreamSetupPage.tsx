import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { createStream, getUser } from '../utils/api';
import { getActiveUser } from '../utils/storage';
import './StreamSetupPage.css';

export default function StreamSetupPage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  

  const handleStartStreaming = async () => {
    const user = getActiveUser();
    if (!user) { navigate('/login'); return; }
    try {
      await getUser(user.id);
    } catch {
      navigate('/login');
      return;
    }
    const stream = await createStream({ usuario_id: user.id, titulo: title || 'Stream en vivo', descripcion: description || '' });
    sessionStorage.setItem('current_stream_id', String(stream.id));
    navigate('/stream/live');
  };

  return (
    <div className="stream-setup-page">
      <div className="setup-panel">
        <h2>Configura tu Stream</h2>
        
        <label htmlFor="title">Título</label>
        <input id="title" type="text" placeholder="Ej: Jugando y charlando un rato" value={title} onChange={e => setTitle(e.target.value)} />

        <label htmlFor="description">Descripción</label>
        <textarea id="description" rows={4} placeholder="Habla un poco sobre lo que harás hoy..." value={description} onChange={e => setDescription(e.target.value)}></textarea>

        

        <fieldset>
          <legend>Opciones del Chat</legend>
          <div>
            <input type="radio" id="chat-all" name="chat-mode" value="all" defaultChecked />
            <label htmlFor="chat-all">Chat para todos</label>
          </div>
          <div>
            <input type="radio" id="chat-followers" name="chat-mode" value="followers" />
            <label htmlFor="chat-followers">Modo solo seguidores</label>
          </div>
        </fieldset>

        <div className="setup-actions">
          <button onClick={() => navigate(-1)} className="cancel-button">Cancelar</button>
          <button onClick={handleStartStreaming} className="start-button">Iniciar Transmisión</button>
        </div>
      </div>

      <div className="live-preview">
        <div className="video-placeholder">Tu video aparecerá aquí</div>
        <div className="chat-placeholder">
          <p>El chat aparecerá aquí</p>
        </div>
      </div>
    </div>
  );
}
