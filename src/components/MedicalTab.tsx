import React, { useState } from 'react';
import type { MedicalRecord } from '../types';
import { medicalRecordsApi } from '../services/api';

interface MedicalTabProps {
  animalId: string;
  records: MedicalRecord[];
  onUpdate: () => void;
}

const RECORD_TYPES = ['Vacuna', 'Consulta', 'Tratamiento'] as const;

const MedicalTab: React.FC<MedicalTabProps> = ({ animalId, records, onUpdate }) => {
  const [type, setType] = useState<'Vacuna' | 'Consulta' | 'Tratamiento'>('Consulta');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [saving, setSaving] = useState(false);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;
    setSaving(true);
    try {
      await medicalRecordsApi.create(animalId, {
        type,
        description: description.trim(),
        date: date || undefined,
      });
      setDescription('');
      setDate('');
      onUpdate();
    } catch (err) {
      console.error(err);
      alert('Error al guardar el registro.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (recordId: string) => {
    if (!confirm('¿Eliminar este registro?')) return;
    try {
      await medicalRecordsApi.delete(animalId, recordId);
      onUpdate();
    } catch (err) {
      console.error(err);
    }
  };

  const badgeClass = (t: string) =>
    t === 'Vacuna' ? 'vacuna' : t === 'Consulta' ? 'consulta' : 'tratamiento';

  return (
    <div className="medical-tab">
      <div className="record-list">
        {records.length === 0 && (
          <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Sin registros médicos.</p>
        )}
        {records.map(record => (
          <div key={record.id} className="record-item">
            <span className={`record-type-badge ${badgeClass(record.type)}`}>{record.type}</span>
            <div className="record-body">
              <p className="record-description">{record.description}</p>
              <span className="record-date">
                {new Date(record.date).toLocaleDateString('es-ES', {
                  year: 'numeric', month: 'long', day: 'numeric',
                })}
              </span>
            </div>
            <button
              className="record-delete-btn"
              onClick={() => handleDelete(record.id)}
              title="Eliminar"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      <form className="medical-form" onSubmit={handleAdd}>
        <h3>Nuevo Registro</h3>
        <div className="medical-form-row">
          <select value={type} onChange={e => setType(e.target.value as typeof type)}>
            {RECORD_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
          />
        </div>
        <textarea
          placeholder="Descripción del registro..."
          value={description}
          onChange={e => setDescription(e.target.value)}
          rows={3}
          required
        />
        <button type="submit" className="btn-edit" disabled={saving} style={{ alignSelf: 'flex-start' }}>
          {saving ? 'Guardando...' : 'Agregar Registro'}
        </button>
      </form>
    </div>
  );
};

export default MedicalTab;
