import { useState, useEffect } from 'react';
import type { Gift } from '../utils/types';
import './GiftFormModal.css';

interface GiftFormModalProps {
  gift: Gift | null;
  onSave: (gift: Gift) => void;
  onClose: () => void;
}

export default function GiftFormModal({ gift, onSave, onClose }: GiftFormModalProps) {
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('');
  const [cost, setCost] = useState(0);
  const [points, setPoints] = useState(0);

  useEffect(() => {
    if (gift) {
      setName(gift.name);
      setIcon(gift.icon);
      setCost(gift.cost);
      setPoints(gift.points);
    } else {
      setName('');
      setIcon('');
      setCost(0);
      setPoints(0);
    }
  }, [gift]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      id: gift ? gift.id : crypto.randomUUID(),
      name,
      icon,
      cost,
      points,
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <form className="gift-form-modal" onClick={(e) => e.stopPropagation()} onSubmit={handleSubmit}>
        <h3>{gift ? 'Editar Regalo' : 'Crear Nuevo Regalo'}</h3>

        <label>Nombre del Regalo</label>
        <input type="text" value={name} onChange={e => setName(e.target.value)} required />
        
        <label>Ícono (Emoji)</label>
        <input type="text" value={icon} onChange={e => setIcon(e.target.value)} required />

        <label>Costo (en monedas)</label>
        <input type="number" value={cost} onChange={e => setCost(Number(e.target.value))} required min="0" />

        <label>Puntos que otorga</label>
        <input type="number" value={points} onChange={e => setPoints(Number(e.target.value))} required min="0" />

        <div className="form-actions">
          <button type="button" onClick={onClose} className="cancel-btn">Cancelar</button>
          <button type="submit" className="save-btn">Guardar</button>
        </div>
      </form>
    </div>
  );
}