import React from 'react';
import type { Animal } from '../types';
import './AnimalCard.css';

interface AnimalCardProps {
  animal: Animal;
}

const AnimalCard: React.FC<AnimalCardProps> = ({ animal }) => {
  const statusColors = {
    'Disponible': 'status-available',
    'En Cuarentena': 'status-quarantine',
    'Adoptado': 'status-adopted',
    'Médico': 'status-medical'
  };

  return (
    <div className="animal-card glass-card">
      <div className="card-image">
        <img src={animal.image} alt={animal.name} />
        <span className={`status-badge ${statusColors[animal.status]}`}>
          {animal.status}
        </span>
      </div>
      <div className="card-content">
        <h3>{animal.name}</h3>
        <p className="breed">{animal.species} • {animal.breed}</p>
        <div className="card-footer">
          <span className="age">{animal.age}</span>
          <span className="date">Ingreso: {animal.entryDate}</span>
        </div>
      </div>
    </div>
  );
};

export default AnimalCard;
