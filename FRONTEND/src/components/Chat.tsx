import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { getActiveUser, updateUser } from '../utils/storage';
import { getLevelInfo, DEFAULT_VIEWER_LEVELS } from '../utils/leveling';
import { useNotification } from '../context/NotificationContext';
import './Chat.css';
import { addChatMessage, getUser } from '../utils/api';

interface Message {
  id: number;
  user: string;
  level: string;
  text: string;
}

const RANDOM_USERS_GENERIC = ['NinjaFan', 'GamerX', 'ArtLover', 'MusicMan', 'StreamFan123', 'RandomUser'];
const RANDOM_MESSAGES = ['¡Qué buena jugada!', 'jajaja, muy bueno', '¡Saludos desde Perú!', 'Me encanta este stream', 'F', 'Pog', 'Nice!', '¿Alguien sabe la canción?'];

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([
    { id: Date.now(), user: 'Admin', level: 'Dios', text: '¡Bienvenidos al stream!' },
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [user, setUser] = useState(getActiveUser());
  const { showNotification } = useNotification();
  const chatMessagesRef = useRef<HTMLDivElement>(null);
  const { streamId } = useParams();

  useEffect(() => {
    const intervalId = setInterval(() => {
      const effectiveLevels = DEFAULT_VIEWER_LEVELS;

      const randomUserName = RANDOM_USERS_GENERIC[Math.floor(Math.random() * RANDOM_USERS_GENERIC.length)];
      const randomLevel = effectiveLevels[Math.floor(Math.random() * effectiveLevels.length)].name;
      const randomMessageText = RANDOM_MESSAGES[Math.floor(Math.random() * RANDOM_MESSAGES.length)];

      const spectatorMessage: Message = {
        id: Date.now(),
        user: randomUserName,
        level: randomLevel,
        text: randomMessageText,
      };
      setMessages(prev => [...prev, spectatorMessage]);
    }, 3000);

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const handler = () => setUser(getActiveUser());
    window.addEventListener('userChanged', handler as any);
    return () => window.removeEventListener('userChanged', handler as any);
  }, []);

  useEffect(() => {
    if (chatMessagesRef.current) {
      chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    const oldLevelName = getLevelInfo(user.points).currentLevelName;
    const sidSession = sessionStorage.getItem('current_stream_id') || '';
    const sidCandidate = sidSession || (streamId || '');
    const sid = /^\d+$/.test(sidCandidate) ? sidCandidate : '';
    if (!sid) {
      showNotification('Debes estar en un stream real para chatear.');
      return;
    }
    await addChatMessage({ stream_id: sid, usuario_id: user.id, alias: user.name, nivel: oldLevelName, texto: newMessage.trim() });
    const refreshed = await getUser(user.id);
    const newLevelName = refreshed.nivel_actual || getLevelInfo(refreshed.puntos).currentLevelName;
    if (oldLevelName !== newLevelName) {
      updateUser({ ...user, points: refreshed.puntos, nivel_actual: newLevelName } as any);
      showNotification(`🎉 ¡Felicidades, ${user.name}! 🎉\n\nHas subido al nivel de espectador: ${newLevelName}`);
    } else {
      updateUser({ ...user, points: refreshed.puntos, nivel_actual: newLevelName } as any);
    }

    const message: Message = {
      id: Date.now(),
      user: user.name,
      level: newLevelName,
      text: newMessage.trim(),
    };
    setMessages(prev => [...prev, message]);
    setNewMessage('');
    window.dispatchEvent(new CustomEvent("userChanged"));
  };

  return (
    <div className="chat-container">
      <div className="chat-messages" ref={chatMessagesRef}>
        {messages.map(msg => (
          <div key={msg.id} className="chat-message">
            <span className="user-level-badge">{msg.level}</span>
            <strong className="user-name">{msg.user}:</strong>
            <span>{msg.text}</span>
          </div>
        ))}
      </div>

      {user ? (
        <form onSubmit={handleSendMessage} className="chat-form">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Enviar un mensaje..."
            className="chat-input"
          />
          <button type="submit" className="send-button">Enviar</button>
        </form>
      ) : (
        <div className="chat-login-prompt">
          <p>Inicia sesión para chatear.</p>
        </div>
      )}
    </div>
  );
}
