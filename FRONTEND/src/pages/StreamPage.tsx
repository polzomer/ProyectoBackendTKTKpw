import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getActiveUser, updateUser } from '../utils/storage';
import Chat from '../components/Chat';
import GiftModal from '../components/GiftModal';
import './StreamPage.css';
import { streamHeartbeat, createStream } from '../utils/api';
import { getLevelInfo } from '../utils/leveling';
import { useNotification } from '../context/NotificationContext';

export default function StreamPage() {
  const navigate = useNavigate();
  const { streamId } = useParams();
  const user = getActiveUser();
  const [isGiftModalOpen, setGiftModalOpen] = useState(false);
  const { showNotification } = useNotification();
  const initialLevel = (user?.nivel_actual as string | undefined) || getLevelInfo(user?.points || 0).currentLevelName;
  const [prevLevelName, setPrevLevelName] = useState<string>(initialLevel);
  const [realSid, setRealSid] = useState<string>('');
  useEffect(() => {
    const sidSession = typeof sessionStorage !== 'undefined' ? (sessionStorage.getItem('current_stream_id') || '') : '';
    const sidParam = streamId || '';
    if (/^\d+$/.test(sidSession)) { setRealSid(sidSession); return; }
    if (/^\d+$/.test(sidParam)) { setRealSid(sidParam); return; }
    const ensureRealStream = async () => {
      if (!user) return;
      try {
        const created = await createStream({ usuario_id: user.id, titulo: 'Stream', descripcion: String(streamId || 'Inicio') });
        const createdId = String((created as any).id);
        setRealSid(createdId);
        if (typeof sessionStorage !== 'undefined') sessionStorage.setItem('current_stream_id', createdId);
      } catch {
        setRealSid('');
      }
    };
    ensureRealStream();
  }, [user, streamId]);

  useEffect(() => {
    let timer: any;
    const sid = realSid;
    if (user && sid) {
      timer = setInterval(async () => {
        try {
          const resp = await streamHeartbeat(sid, 1, user.id);
          const u = resp.usuario;
          const newLevelName = u.nivel_actual || getLevelInfo(u.puntos || 0).currentLevelName;
          if (prevLevelName !== newLevelName) {
            showNotification(`🎉 ¡Has subido de nivel! Ahora eres ${newLevelName}.`);
            setPrevLevelName(newLevelName);
            updateUser({
              ...user,
              streamerHours: u.horas_streamer,
              points: u.puntos,
              nivel_actual: newLevelName,
            } as any);
          } else {
            updateUser({
              ...user,
              streamerHours: u.horas_streamer,
              points: u.puntos,
              nivel_actual: newLevelName,
            } as any);
          }
          window.dispatchEvent(new CustomEvent('userChanged'));
        } catch {}
      }, 1000);
    }
    return () => { if (timer) clearInterval(timer); };
  }, [user, realSid, prevLevelName, showNotification]);

  return (
    <>
      <div className="stream-page-layout">
        <div className="video-and-info-container">
          <div className="video-player-placeholder">
            <p>Video del Stream ID: {streamId}</p>
          </div>
          <div className="stream-details">
            <h3>Título del Stream Actual</h3>
            <p className="stream-description">Descripción del stream...</p>
            <div className="stream-actions">
              <button onClick={() => navigate('/')} className="back-button">
                ‹ Volver a la lista
              </button>
              {user && (
                <button className="gift-button-stream" onClick={() => setGiftModalOpen(true)}>
                  🎁 Enviar Regalo
                </button>
              )}
            </div>
          </div>
        </div>
        <Chat />
      </div>

      {isGiftModalOpen && <GiftModal onClose={() => setGiftModalOpen(false)} />}
    </>
  );
}
