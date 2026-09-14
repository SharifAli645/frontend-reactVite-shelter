import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Animal } from '../types';
import { animalsApi } from '../services/api';
import AnimalCard from './AnimalCard';
import AnimalForm from './AnimalForm';
import './Dashboard.css';

const PAGE_SIZE = 12;

const AnimalsPage: React.FC = () => {
  const navigate = useNavigate();
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSpecies, setFilterSpecies] = useState('Todos');
  const [filterStatus, setFilterStatus] = useState('Todos');
  const [showAddForm, setShowAddForm] = useState(false);

  const fetchAnimals = async (p: number) => {
    try {
      const data = await animalsApi.getAll(p, PAGE_SIZE);
      if (data && typeof data === 'object' && 'data' in data) {
        setAnimals(data.data);
        setTotal(data.total);
      } else {
        setAnimals(data);
        setTotal(data.length);
      }
    } catch (error) {
      console.error('Error fetching animals:', error);
    }
  };

  useEffect(() => {
    fetchAnimals(page);
  }, [page]);

  const filteredAnimals = useMemo(() => {
    return animals.filter(animal => {
      const matchesSearch =
        animal.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        animal.breed.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSpecies = filterSpecies === 'Todos' || animal.species === filterSpecies;
      const matchesStatus = filterStatus === 'Todos' || animal.status === filterStatus;
      return matchesSearch && matchesSpecies && matchesStatus;
    });
  }, [animals, searchTerm, filterSpecies, filterStatus]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="dashboard">
      <div className="controls-row">
        <div className="search-box glass-card">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Buscar por nombre o raza..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filters-group">
          <select
            className="filter-select glass-card"
            value={filterSpecies}
            onChange={(e) => setFilterSpecies(e.target.value)}
          >
            <option value="Todos">Todas las especies</option>
            <option value="Perro">Perros</option>
            <option value="Gato">Gatos</option>
          </select>

          <select
            className="filter-select glass-card"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="Todos">Todos los estados</option>
            <option value="Disponible">Disponibles</option>
            <option value="En Cuarentena">En Cuarentena</option>
            <option value="Médico">Médicos</option>
            <option value="Adoptado">Adoptados</option>
          </select>
        </div>
      </div>

      <div className="section-header">
        <h2>{total} Residentes Encontrados</h2>
      </div>

      <div className="animals-grid">
        {filteredAnimals.map(animal => (
          <div key={animal.id} onClick={() => navigate(`/animals/${animal.id}`)} style={{ cursor: 'pointer' }}>
            <AnimalCard animal={animal} />
          </div>
        ))}
      </div>

      {filteredAnimals.length === 0 && (
        <div className="no-results glass-card">
          <p>No se encontraron animales que coincidan con tu búsqueda.</p>
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

      {showAddForm && (
        <AnimalForm
          onClose={() => setShowAddForm(false)}
          onSubmit={async (data) => {
            await animalsApi.create(data);
            await fetchAnimals(page);
            setShowAddForm(false);
          }}
        />
      )}

      <button className="fab-button" onClick={() => setShowAddForm(true)}>
        <span>+</span>
      </button>
    </div>
  );
};

export default AnimalsPage;
