import { useEffect } from 'react';
import './GiftAlert.css';

interface AlertInfo {
  userName: string;
  giftName: string;
  giftIcon: string;
} 

interface GiftAlertProps {
  info: AlertInfo;
  onClose: () => void;
}

const DURATION = 6000;

export default function GiftAlert({ info, onClose }: GiftAlertProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, DURATION);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="gift-alert-overlay">
      <div className="gift-alert-content">
        <span className="gift-icon-alert">{info.giftIcon}</span>
        <p>
          <strong>{info.userName}</strong> ha enviado un/a <strong>{info.giftName}</strong>
        </p>
      </div>
    </div>
  );
}