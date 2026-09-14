import React, { useState, useEffect, useCallback } from 'react';
import type { Adoption, AdoptionStatus } from '../types';
import { adoptionsApi } from '../services/api';
import AdoptionCard from './AdoptionCard';
import AdoptionForm from './AdoptionForm';
import './AdoptionsPage.css';
import './Dashboard.css';

const PAGE_SIZE = 10;

const AdoptionsPage: React.FC = () => {
  const [adoptions, setAdoptions] = useState<Adoption[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showForm, setShowForm] = useState(false);

  const loadAdoptions = useCallback(async (p: number) => {
    try {
      const data = await adoptionsApi.getAll(p, PAGE_SIZE);
      if (data && typeof data === 'object' && 'data' in data) {
        setAdoptions(data.data);
        setTotal(data.total);
      } else {
        setAdoptions(data);
        setTotal(data.length);
      }
    } catch (err) {
      console.error('Error loading adoptions:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAdoptions(page);
  }, [loadAdoptions, page]);

  const handleUpdate = async (id: string, status: AdoptionStatus) => {
    try {
      const updated = await adoptionsApi.update(id, { status });
      setAdoptions(prev =>
        prev.map(a => (a.id === id ? updated : a)),
      );
    } catch (err) {
      console.error('Error updating adoption:', err);
      alert('Error al actualizar el estado.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar esta solicitud de adopción?')) return;
    try {
      await adoptionsApi.delete(id);
      setAdoptions(prev => prev.filter(a => a.id !== id));
      setTotal(prev => prev - 1);
    } catch (err) {
      console.error('Error deleting adoption:', err);
      alert('Error al eliminar la adopción.');
    }
  };

  const handleCreate = async (body: object) => {
    const created = await adoptionsApi.create(body);
    setAdoptions(prev => [created, ...prev]);
    setTotal(prev => prev + 1);
    setShowForm(false);
  };

  const filtered = adoptions.filter(a => {
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      a.adopterName.toLowerCase().includes(q) ||
      a.animal.name.toLowerCase().includes(q);
    const matchesStatus = !statusFilter || a.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const stats = {
    total,
    pendiente: adoptions.filter(a => a.status === 'Pendiente').length,
    aprobada: adoptions.filter(a => a.status === 'Aprobada').length,
    completada: adoptions.filter(a => a.status === 'Completada').length,
  };

  return (
    <div className="adoptions-page">
      <div className="stats-grid">
        <div className="stat-item glass-card">
          <span className="stat-label">Total solicitudes</span>
          <span className="stat-value">{stats.total}</span>
        </div>
        <div className="stat-item glass-card">
          <span className="stat-label">Pendientes</span>
          <span className="stat-value" style={{ color: '#c97b00' }}>{stats.pendiente}</span>
        </div>
        <div className="stat-item glass-card">
          <span className="stat-label">Aprobadas</span>
          <span className="stat-value" style={{ color: '#2563eb' }}>{stats.aprobada}</span>
        </div>
        <div className="stat-item glass-card">
          <span className="stat-label">Completadas</span>
          <span className="stat-value text-primary">{stats.completada}</span>
        </div>
      </div>

      <div className="controls-row">
        <div className="search-box glass-card">
          <span className="search-icon">🔍</span>
          <input
            placeholder="Buscar por adoptante o animal..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="filters-group">
          <select
            className="filter-select glass-card"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
          >
            <option value="">Todos los estados</option>
            <option value="Pendiente">Pendiente</option>
            <option value="Aprobada">Aprobada</option>
            <option value="Completada">Completada</option>
            <option value="Cancelada">Cancelada</option>
          </select>
        </div>
      </div>

      {loading ? (
        <p className="no-results">Cargando adopciones...</p>
      ) : filtered.length === 0 ? (
        <p className="no-results">No se encontraron solicitudes.</p>
      ) : (
        <div className="adoption-list">
          {filtered.map(adoption => (
            <AdoptionCard
              key={adoption.id}
              adoption={adoption}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="pagination">
          <button
            className="pagination-btn"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            &laquo;
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
            <button
              key={p}
              className={`pagination-btn${p === page ? ' active' : ''}`}
              onClick={() => setPage(p)}
            >
              {p}
            </button>
          ))}
          <button
            className="pagination-btn"
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            &raquo;
          </button>
        </div>
      )}

      <button className="fab-button" onClick={() => setShowForm(true)} title="Nueva adopción">
        +
      </button>

      {showForm && (
        <AdoptionForm
          onClose={() => setShowForm(false)}
          onSubmit={handleCreate}
        />
      )}
    </div>
  );
};

export default AdoptionsPage;
