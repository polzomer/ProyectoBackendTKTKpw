import { useState } from 'react';
import { getActiveUser, updateUser } from '../utils/storage';
import { purchaseCoins } from '../utils/api';
import type { User } from '../utils/storage';
import './DepositModal.css';

const coinPackages = [
  { coins: 100, price: 5.00 },
  { coins: 550, price: 25.00 },
  { coins: 1200, price: 50.00 },
  { coins: 2500, price: 100.00 },
];

interface DepositModalProps {
  onClose: () => void;
}

export default function DepositModal({ onClose }: DepositModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [purchasedAmount, setPurchasedAmount] = useState(0);
  const [customCoins, setCustomCoins] = useState<number>(0);

  const handlePurchase = async (coins: number) => {
    setIsLoading(true);
    try {
      const currentUser = getActiveUser();
      if (currentUser) {
        const { usuario } = await purchaseCoins(currentUser.id, coins);
        const updatedUser: User = {
          ...currentUser,
          coins: usuario.monedas,
          points: usuario.puntos,
        };
        updateUser(updatedUser);
        window.dispatchEvent(new CustomEvent("userChanged"));
      }
      setPurchasedAmount(coins);
      setIsCompleted(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (isLoading) return;
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{isCompleted ? "Compra Exitosa" : "Recargar Monedas"}</h3>
          <button onClick={handleClose} className="close-button">&times;</button>
        </div>
        
        {isLoading ? (
          <div className="feedback-state">
            <div className="spinner"></div>
            <p>Procesando pago seguro...</p>
          </div>
        ) : isCompleted ? (
          <div className="feedback-state">
            <p className="success-message">¡Felicidades!</p>
            {}
            <p>Has recargado <strong>{purchasedAmount.toLocaleString()}</strong> monedas a tu cuenta.</p>
            <button onClick={handleClose} className="buy-button">Entendido</button>
          </div>
        ) : (
          <>
            <div className="packages-grid">
              {coinPackages.map((pkg) => (
                <div key={pkg.coins} className="package-card">
                  {}
                  <div className="package-coins">{pkg.coins.toLocaleString()}</div>
                  <div className="package-price">S/ {pkg.price.toFixed(2)}</div>
                  <button 
                    onClick={() => handlePurchase(pkg.coins)} 
                    className="buy-button"
                  >
                    Comprar
                  </button>
                </div>
              ))}
            </div>

            <div className="custom-purchase">
              <h4>Compra personalizada</h4>
              <p className="muted">Precio: S/ 0.05 por moneda</p>
              <div className="custom-controls">
                <input
                  type="number"
                  min={1}
                  step={1}
                  value={customCoins}
                  onChange={(e) => setCustomCoins(Math.max(0, Number(e.target.value || 0)))}
                  placeholder="Ingresa cantidad de monedas"
                  className="custom-input"
                />
                <div className="custom-price">Total: S/ {(customCoins * 0.05).toFixed(2)}</div>
                <button
                  disabled={!customCoins || customCoins <= 0}
                  onClick={() => handlePurchase(customCoins)}
                  className="buy-button"
                >
                  Comprar
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

