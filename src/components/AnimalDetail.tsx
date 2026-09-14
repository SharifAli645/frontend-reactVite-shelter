import React from 'react';
import type { Animal } from '../types';
import './AnimalDetail.css';

interface AnimalDetailProps {
  animal: Animal;
  onClose: () => void;
  onEdit: (animal: Animal) => void;
  onDelete: (id: string) => Promise<void>;
}

const AnimalDetail: React.FC<AnimalDetailProps> = ({ animal, onClose, onEdit, onDelete }) => {
  const handleDelete = async () => {
    if (!window.confirm(`¿Eliminar a ${animal.name}? Esta acción no se puede deshacer.`)) return;
    await onDelete(animal.id);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content glass-card" onClick={e => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>✕</button>

        <div className="detail-grid">
          <div className="detail-image">
            <img src={animal.image} alt={animal.name} />
          </div>

          <div className="detail-info">
            <div className="detail-header">
              <span className="detail-species">{animal.species}</span>
              <h1>{animal.name}</h1>
              <p className="detail-breed">{animal.breed}</p>
            </div>

            <div className="detail-stats">
              <div className="detail-stat">
                <span className="label">Edad</span>
                <span className="value">{animal.age}</span>
              </div>
              <div className="detail-stat">
                <span className="label">Estado</span>
                <span className="value status-text">{animal.status}</span>
              </div>
              <div className="detail-stat">
                <span className="label">Ingreso</span>
                <span className="value">{animal.entryDate}</span>
              </div>
            </div>

            <div className="detail-description">
              <h3>Historia y Notas</h3>
              <p>
                {animal.description || `${animal.name} no tiene notas registradas todavía.`}
              </p>
            </div>

            <div className="detail-actions">
              <button className="btn-primary" onClick={() => onEdit(animal)}>Editar Ficha</button>
              <button className="btn-danger" onClick={handleDelete}>Eliminar</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnimalDetail;
