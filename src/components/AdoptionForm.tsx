import React, { useState, useEffect } from 'react';
import type { Animal } from '../types';
import { animalsApi } from '../services/api';
import './AnimalForm.css';
import './AdoptionsPage.css';

interface AdoptionFormProps {
  onClose: () => void;
  onSubmit: (body: object) => Promise<void>;
}

const TOTAL_STEPS = 2;

const AdoptionForm: React.FC<AdoptionFormProps> = ({ onClose, onSubmit }) => {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableAnimals, setAvailableAnimals] = useState<Animal[]>([]);
  const [selectedAnimalId, setSelectedAnimalId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    adopterName: '',
    adopterEmail: '',
    adopterPhone: '',
    adopterAddress: '',
    notes: '',
  });

  useEffect(() => {
    animalsApi.getAll().then((animals: Animal[]) => {
      setAvailableAnimals(animals.filter(a => a.status === 'Disponible'));
    });
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNext = () => {
    if (step === 1 && !selectedAnimalId) return;
    setStep(prev => prev + 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAnimalId) return;
    setIsSubmitting(true);
    try {
      const body: Record<string, string> = {
        animalId: selectedAnimalId,
        adopterName: formData.adopterName,
        adopterEmail: formData.adopterEmail,
      };
      if (formData.adopterPhone) body.adopterPhone = formData.adopterPhone;
      if (formData.adopterAddress) body.adopterAddress = formData.adopterAddress;
      if (formData.notes) body.notes = formData.notes;
      await onSubmit(body);
    } catch (error) {
      console.error('Error creating adoption:', error);
      alert('Error al registrar la adopción.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const stepTitles = [
    'Selecciona el animal',
    'Datos del adoptante',
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content glass-card adoption-form-modal"
        onClick={e => e.stopPropagation()}
      >
        <button className="close-btn" onClick={onClose}>✕</button>

        <div className="form-header">
          <div className="badge">Paso {step} de {TOTAL_STEPS}</div>
          <h2>{stepTitles[step - 1]}</h2>
          <div className="step-bar">
            <div
              className="step-progress"
              style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
            />
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {step === 1 && (
            <div className="form-step animate-in">
              {availableAnimals.length === 0 ? (
                <p className="no-available">No hay animales disponibles para adopción.</p>
              ) : (
                <div className="animal-select-grid">
                  {availableAnimals.map(animal => (
                    <div
                      key={animal.id}
                      className={`animal-select-card ${selectedAnimalId === animal.id ? 'selected' : ''}`}
                      onClick={() => setSelectedAnimalId(animal.id)}
                    >
                      <img
                        src={animal.image}
                        alt={animal.name}
                        className="animal-select-img"
                      />
                      <span className="animal-select-name">{animal.name}</span>
                      <span className="animal-select-breed">{animal.breed}</span>
                    </div>
                  ))}
                </div>
              )}

              <button
                type="button"
                className="btn-primary"
                onClick={handleNext}
                disabled={!selectedAnimalId}
              >
                Continuar <span>→</span>
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="form-step animate-in">
              <div className="input-group">
                <label>Nombre completo</label>
                <input
                  name="adopterName"
                  value={formData.adopterName}
                  onChange={handleChange}
                  placeholder="Ej. Ana García López"
                  required
                  autoFocus
                />
              </div>

              <div className="input-group">
                <label>Correo electrónico</label>
                <input
                  type="email"
                  name="adopterEmail"
                  value={formData.adopterEmail}
                  onChange={handleChange}
                  placeholder="correo@ejemplo.com"
                  required
                />
              </div>

              <div className="input-row">
                <div className="input-group">
                  <label>
                    Teléfono <span className="optional-label">(opcional)</span>
                  </label>
                  <input
                    name="adopterPhone"
                    value={formData.adopterPhone}
                    onChange={handleChange}
                    placeholder="Ej. 612 345 678"
                  />
                </div>
              </div>

              <div className="input-group">
                <label>
                  Dirección <span className="optional-label">(opcional)</span>
                </label>
                <input
                  name="adopterAddress"
                  value={formData.adopterAddress}
                  onChange={handleChange}
                  placeholder="Calle, ciudad..."
                />
              </div>

              <div className="input-group">
                <label>
                  Notas <span className="optional-label">(opcional)</span>
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Observaciones sobre la adopción..."
                />
              </div>

              <div className="btn-row">
                <button
                  type="button"
                  className="btn-outline"
                  onClick={() => setStep(1)}
                  disabled={isSubmitting}
                >
                  Atrás
                </button>
                <button type="submit" className="btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? 'Guardando...' : 'Registrar Adopción'}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default AdoptionForm;
