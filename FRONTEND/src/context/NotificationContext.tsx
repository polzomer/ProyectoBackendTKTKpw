import { createContext, useState, useContext } from 'react';
import type { ReactNode } from 'react';
import Notification from '../components/Notification';

interface NotificationContextType {
  showNotification: (message: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [notification, setNotification] = useState<string | null>(null);

  const showNotification = (message: string) => {
    setNotification(message);
  };

  const handleClose = () => {
    setNotification(null);
  };

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      {notification && <Notification message={notification} onClose={handleClose} />}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification debe ser usado dentro de un NotificationProvider');
  }
  return context;
};