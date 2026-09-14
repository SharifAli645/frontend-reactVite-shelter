import React, { useRef, useState } from 'react';
import type { Photo } from '../types';
import { photosApi } from '../services/api';

interface PhotosTabProps {
  animalId: string;
  photos: Photo[];
  onUpdate: () => void;
}

const PhotosTab: React.FC<PhotosTabProps> = ({ animalId, photos, onUpdate }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      await photosApi.upload(animalId, file);
      onUpdate();
    } catch (err) {
      console.error(err);
      alert('Error al subir la foto.');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const handleSetPrimary = async (photoId: string) => {
    try {
      await photosApi.setPrimary(animalId, photoId);
      onUpdate();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (photoId: string) => {
    if (!confirm('¿Eliminar esta foto?')) return;
    try {
      await photosApi.delete(animalId, photoId);
      onUpdate();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="photos-tab">
      <div className="photo-upload-section">
        <button
          className="photo-upload-btn"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? 'Subiendo...' : '+ Subir Foto'}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleUpload}
        />
        {photos.length > 0 && (
          <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            {photos.length} foto{photos.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {photos.length === 0 && (
        <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Sin fotos todavía.</p>
      )}

      <div className="photos-grid">
        {photos.map(photo => (
          <div key={photo.id} className={`photo-item ${photo.isPrimary ? 'is-primary' : ''}`}>
            <img src={photo.url} alt="Foto del animal" loading="lazy" />
            {photo.isPrimary && <span className="primary-badge">Principal</span>}
            <div className="photo-actions">
              {!photo.isPrimary && (
                <button
                  className="photo-action-btn"
                  onClick={() => handleSetPrimary(photo.id)}
                >
                  Principal
                </button>
              )}
              <button
                className="photo-action-btn"
                onClick={() => handleDelete(photo.id)}
              >
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PhotosTab;
