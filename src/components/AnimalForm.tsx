import React, { useState } from 'react';
import type { Animal } from '../types';
import './AnimalForm.css';

interface AnimalFormProps {
  onClose: () => void;
  onSubmit: (data: FormData) => Promise<void>;
  initialData?: Animal;
}

const TOTAL_STEPS = 3;

const AnimalForm: React.FC<AnimalFormProps> = ({ onClose, onSubmit, initialData }) => {
  const editMode = !!initialData;
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<{
    name: string;
    species: Animal['species'];
    breed: string;
    age: string;
    status: Animal['status'];
    description: string;
    hasChip: boolean;
    isSterilized: boolean;
    origin: string;
    veterinaryNotes: string;
  }>({
    name: initialData?.name ?? '',
    species: initialData?.species ?? 'Perro',
    breed: initialData?.breed ?? '',
    age: initialData?.age ?? '',
    status: initialData?.status ?? 'Disponible',
    description: initialData?.description ?? '',
    hasChip: initialData?.hasChip ?? false,
    isSterilized: initialData?.isSterilized ?? false,
    origin: initialData?.origin ?? '',
    veterinaryNotes: initialData?.veterinaryNotes ?? '',
  });
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(initialData?.image ?? null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setPhotoPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleNext = () => setStep(prev => prev + 1);
  const handlePrev = () => setStep(prev => prev - 1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => data.append(key, String(value)));
      if (photoFile) data.append('photo', photoFile);
      await onSubmit(data);
    } catch (error) {
      console.error('Error saving animal:', error);
      alert('Error al guardar el residente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const stepTitles = [
    editMode ? 'Editar datos del residente' : 'Cuéntanos sobre el nuevo residente',
    'Estado y ficha sanitaria',
    'Foto del animal',
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content glass-card animal-form-modal" onClick={e => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>✕</button>

        <div className="form-header">
          <div className="badge">Paso {step} de {TOTAL_STEPS}</div>
          <h2>{stepTitles[step - 1]}</h2>
          <div className="step-bar">
            <div
              className="step-progress"
              style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
            ></div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {step === 1 && (
            <div className="form-step animate-in">
              <div className="input-group">
                <label>¿Cómo se llama?</label>
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Ej. Max, Luna, Bobby..."
                  required
                  autoFocus
                />
              </div>

              <div className="input-row">
                <div className="input-group">
                  <label>Especie</label>
                  <div className="select-wrapper">
                    <select name="species" value={formData.species} onChange={handleChange}>
                      <option value="Perro">🐶 Perro</option>
                      <option value="Gato">🐱 Gato</option>
                      <option value="Otro">🐰 Otro</option>
                    </select>
                  </div>
                </div>
                <div className="input-group">
                  <label>Raza</label>
                  <input
                    name="breed"
                    value={formData.breed}
                    onChange={handleChange}
                    placeholder="Ej. Mestizo, Pastor..."
                    required
                  />
                </div>
              </div>

              <div className="input-group">
                <label>Edad aproximada</label>
                <input
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  placeholder="Ej. 6 meses, 3 años..."
                  required
                />
              </div>

              <button type="button" className="btn-primary" onClick={handleNext}>
                Continuar <span>→</span>
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="form-step animate-in">
              <div className="input-group">
                <label>Estado en el refugio</label>
                <div className="status-chips">
                  {(['Disponible', 'En Cuarentena', 'Médico', 'Adoptado'] as const).map(status => (
                    <button
                      key={status}
                      type="button"
                      className={`status-chip ${formData.status === status ? 'active' : ''}`}
                      onClick={() => setFormData(prev => ({ ...prev, status }))}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>

              <div className="input-group">
                <label>Ficha Sanitaria</label>
                <div className="status-chips">
                  <button
                    type="button"
                    className={`toggle-btn ${formData.hasChip ? 'active' : ''}`}
                    onClick={() => setFormData(prev => ({ ...prev, hasChip: !prev.hasChip }))}
                  >
                    🔖 Microchip
                  </button>
                  <button
                    type="button"
                    className={`toggle-btn ${formData.isSterilized ? 'active' : ''}`}
                    onClick={() => setFormData(prev => ({ ...prev, isSterilized: !prev.isSterilized }))}
                  >
                    ✂️ Esterilizado/a
                  </button>
                </div>
              </div>

              <div className="input-group">
                <label>Procedencia <span className="optional-label">(opcional)</span></label>
                <input
                  name="origin"
                  value={formData.origin}
                  onChange={handleChange}
                  placeholder="Ej. Rescate calle, Entregado por familia..."
                />
              </div>

              <div className="input-group">
                <label>Notas e Historia <span className="optional-label">(opcional)</span></label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  placeholder="¿De dónde viene? ¿Tiene algún rasgo especial?"
                />
              </div>

              <div className="input-group">
                <label>Notas Veterinarias <span className="optional-label">(opcional)</span></label>
                <textarea
                  name="veterinaryNotes"
                  value={formData.veterinaryNotes}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Observaciones clínicas, tratamientos en curso..."
                />
              </div>

              <div className="btn-row">
                <button type="button" className="btn-outline" onClick={handlePrev}>
                  Atrás
                </button>
                <button type="button" className="btn-primary" onClick={handleNext}>
                  Continuar <span>→</span>
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="form-step animate-in">
              <div className="input-group">
                <label>
                  Foto del animal
                  <span className="optional-label">(opcional)</span>
                </label>
                <div
                  className="photo-upload-area"
                  onClick={() => document.getElementById('photo-input')?.click()}
                >
                  {photoPreview ? (
                    <img src={photoPreview} alt="Preview" className="photo-preview" />
                  ) : (
                    <div className="upload-placeholder">
                      <span className="upload-icon">📷</span>
                      <p>Haz clic para seleccionar una foto</p>
                      <p className="upload-hint">JPG, PNG o WEBP</p>
                    </div>
                  )}
                  <input
                    id="photo-input"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                  />
                </div>
                {photoFile && (
                  <button
                    type="button"
                    className="btn-remove-photo"
                    onClick={() => {
                      setPhotoFile(null);
                      setPhotoPreview(initialData?.image ?? null);
                    }}
                  >
                    Quitar nueva foto
                  </button>
                )}
              </div>

              <div className="btn-row">
                <button type="button" className="btn-outline" onClick={handlePrev} disabled={isSubmitting}>
                  Atrás
                </button>
                <button type="submit" className="btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? 'Guardando...' : editMode ? 'Guardar Cambios' : 'Finalizar Registro'}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default AnimalForm;
