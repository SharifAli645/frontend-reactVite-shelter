import React from 'react';
import type { Adoption, AdoptionStatus } from '../types';
import './AdoptionsPage.css';

interface AdoptionCardProps {
  adoption: Adoption;
  onUpdate: (id: string, status: AdoptionStatus) => void;
  onDelete: (id: string) => void;
}

const BADGE_CLASS: Record<AdoptionStatus, string> = {
  Pendiente: 'pendiente',
  Aprobada: 'aprobada',
  Completada: 'completada',
  Cancelada: 'cancelada',
};

const AdoptionCard: React.FC<AdoptionCardProps> = ({ adoption, onUpdate, onDelete }) => {
  const { id, status, adopterName, adopterEmail, date, animal } = adoption;

  const formattedDate = new Date(date).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  return (
    <div className="adoption-card glass-card">
      <img
        src={animal.image}
        alt={animal.name}
        className="adoption-animal-img"
      />

      <div className="adoption-info">
        <div className="adoption-animal-name">{animal.name}</div>
        <div className="adoption-adopter-name">{adopterName}</div>
        <div className="adoption-adopter-email">{adopterEmail}</div>
        <div className="adoption-date">{formattedDate}</div>
      </div>

      <span className={`adoption-status-badge ${BADGE_CLASS[status]}`}>
        {status}
      </span>

      <div className="adoption-actions">
        {status === 'Pendiente' && (
          <>
            <button className="adoption-btn approve" onClick={() => onUpdate(id, 'Aprobada')}>
              Aprobar
            </button>
            <button className="adoption-btn cancel" onClick={() => onUpdate(id, 'Cancelada')}>
              Cancelar
            </button>
          </>
        )}
        {status === 'Aprobada' && (
          <>
            <button className="adoption-btn complete" onClick={() => onUpdate(id, 'Completada')}>
              Completar
            </button>
            <button className="adoption-btn cancel" onClick={() => onUpdate(id, 'Cancelada')}>
              Cancelar
            </button>
          </>
        )}
        {(status === 'Completada' || status === 'Cancelada') && (
          <button className="adoption-btn delete" onClick={() => onDelete(id)}>
            Eliminar
          </button>
        )}
      </div>
    </div>
  );
};

export default AdoptionCard;
