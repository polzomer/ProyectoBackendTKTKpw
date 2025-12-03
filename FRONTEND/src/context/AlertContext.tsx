import { createContext, useState, useContext } from 'react';
import type { ReactNode } from 'react';
import GiftAlert from '../components/GiftAlert';

interface AlertInfo {
  userName: string;
  giftName: string;
  giftIcon: string;
}

interface AlertContextType {
  showAlert: (info: AlertInfo) => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export const AlertProvider = ({ children }: { children: ReactNode }) => {
  const [alertInfo, setAlertInfo] = useState<AlertInfo | null>(null);

  const showAlert = (info: AlertInfo) => {
    setAlertInfo(info);
  };

  const handleClose = () => {
    setAlertInfo(null);
  };

  return (
    <AlertContext.Provider value={{ showAlert }}>
      {children}
      {alertInfo && <GiftAlert info={alertInfo} onClose={handleClose} />}
    </AlertContext.Provider>
  );
};

export const useAlert = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert debe ser usado dentro de un AlertProvider');
  }
  return context;
};