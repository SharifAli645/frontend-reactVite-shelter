import React from 'react';
import type { Animal } from '../types';

interface InfoTabProps {
  animal: Animal;
}

const InfoTab: React.FC<InfoTabProps> = ({ animal }) => {
  return (
    <div>
      <div className="info-grid">
        <div className="info-item">
          <span className="info-label">Especie</span>
          <span className="info-value">{animal.species}</span>
        </div>
        <div className="info-item">
          <span className="info-label">Raza</span>
          <span className="info-value">{animal.breed}</span>
        </div>
        <div className="info-item">
          <span className="info-label">Edad</span>
          <span className="info-value">{animal.age}</span>
        </div>
        <div className="info-item">
          <span className="info-label">Fecha de Ingreso</span>
          <span className="info-value">{animal.entryDate}</span>
        </div>
        <div className="info-item">
          <span className="info-label">Microchip</span>
          <span className="info-value">{animal.hasChip ? 'Sí' : 'No'}</span>
        </div>
        <div className="info-item">
          <span className="info-label">Esterilizado/a</span>
          <span className="info-value">{animal.isSterilized ? 'Sí' : 'No'}</span>
        </div>
        {animal.origin && (
          <div className="info-item">
            <span className="info-label">Procedencia</span>
            <span className="info-value">{animal.origin}</span>
          </div>
        )}
      </div>

      {animal.description && (
        <>
          <p className="info-section-title">Historia</p>
          <p className="info-description">{animal.description}</p>
        </>
      )}

      {animal.veterinaryNotes && (
        <>
          <p className="info-section-title">Notas Veterinarias</p>
          <p className="info-description">{animal.veterinaryNotes}</p>
        </>
      )}
    </div>
  );
};

export default InfoTab;
