import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { Animal } from '../types';
import { animalsApi } from '../services/api';
import AnimalForm from './AnimalForm';
import InfoTab from './InfoTab';
import MedicalTab from './MedicalTab';
import PhotosTab from './PhotosTab';
import './AnimalProfile.css';

type Tab = 'info' | 'medical' | 'photos';

const statusClass = (status: string) => {
  if (status === 'Disponible') return 'disponible';
  if (status === 'En Cuarentena') return 'cuarentena';
  if (status === 'Médico') return 'medico';
  return 'adoptado';
};

const AnimalProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [animal, setAnimal] = useState<Animal | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('info');
  const [editOpen, setEditOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchAnimal = useCallback(async () => {
    if (!id) return;
    try {
      const data = await animalsApi.getOne(id);
      setAnimal(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchAnimal();
  }, [fetchAnimal]);

  const handleDelete = async () => {
    if (!animal) return;
    if (!confirm(`¿Eliminar a ${animal.name}? Esta acción no se puede deshacer.`)) return;
    try {
      await animalsApi.delete(animal.id);
      navigate('/animals');
    } catch (err) {
      console.error(err);
      alert('Error al eliminar el animal.');
    }
  };

  if (loading) {
    return <div style={{ padding: 40, color: 'var(--text-muted)' }}>Cargando...</div>;
  }

  if (!animal) {
    return <div style={{ padding: 40, color: 'var(--text-muted)' }}>Animal no encontrado.</div>;
  }

  return (
    <div className="animal-profile">
      <button className="profile-back-btn" onClick={() => navigate('/animals')}>
        ← Volver a Animales
      </button>

      <div className="profile-header glass-card">
        <img
          src={animal.image}
          alt={animal.name}
          className="profile-hero-image"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
        <div className="profile-meta">
          <span className="profile-species-badge">{animal.species}</span>
          <h1>{animal.name}</h1>
          <span className={`profile-status ${statusClass(animal.status)}`}>{animal.status}</span>
          <div className="profile-actions">
            <button className="btn-edit" onClick={() => setEditOpen(true)}>Editar</button>
            <button className="btn-delete" onClick={handleDelete}>Eliminar</button>
          </div>
        </div>
      </div>

      <div className="glass-card" style={{ overflow: 'hidden' }}>
        <div className="tabs-bar">
          {(['info', 'medical', 'photos'] as Tab[]).map(tab => (
            <button
              key={tab}
              className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab === 'info' ? 'Información' : tab === 'medical' ? 'Historial Médico' : 'Fotos'}
            </button>
          ))}
        </div>

        <div className="tab-content">
          {activeTab === 'info' && <InfoTab animal={animal} />}
          {activeTab === 'medical' && (
            <MedicalTab
              animalId={animal.id}
              records={animal.medicalRecords}
              onUpdate={fetchAnimal}
            />
          )}
          {activeTab === 'photos' && (
            <PhotosTab
              animalId={animal.id}
              photos={animal.photos}
              onUpdate={fetchAnimal}
            />
          )}
        </div>
      </div>

      {editOpen && (
        <AnimalForm
          initialData={animal}
          onClose={() => setEditOpen(false)}
          onSubmit={async (data) => {
            await animalsApi.update(animal.id, data);
            await fetchAnimal();
            setEditOpen(false);
          }}
        />
      )}
    </div>
  );
};

export default AnimalProfile;
