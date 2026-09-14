import React, { useState, useMemo, useEffect } from 'react';
import type { Animal } from '../types';
import { animalsApi } from '../services/api';
import AnimalCard from './AnimalCard';
import AnimalDetail from './AnimalDetail';
import AnimalForm from './AnimalForm';
import './Dashboard.css';

const Dashboard: React.FC = () => {
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSpecies, setFilterSpecies] = useState('Todos');
  const [filterStatus, setFilterStatus] = useState('Todos');
  const [selectedAnimal, setSelectedAnimal] = useState<Animal | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAnimal, setEditingAnimal] = useState<Animal | null>(null);

  const fetchAnimals = async () => {
    try {
      const data = await animalsApi.getAll();
      setAnimals(data);
    } catch (error) {
      console.error('Error fetching animals:', error);
    }
  };

  useEffect(() => {
    fetchAnimals();
  }, []);

  const stats = useMemo(() => ({
    total: animals.length,
    available: animals.filter(a => a.status === 'Disponible').length,
    quarantine: animals.filter(a => a.status === 'En Cuarentena').length,
    medical: animals.filter(a => a.status === 'Médico').length,
  }), [animals]);

  const filteredAnimals = useMemo(() => {
    return animals.filter(animal => {
      const matchesSearch = animal.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           animal.breed.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSpecies = filterSpecies === 'Todos' || animal.species === filterSpecies;
      const matchesStatus = filterStatus === 'Todos' || animal.status === filterStatus;
      return matchesSearch && matchesSpecies && matchesStatus;
    });
  }, [animals, searchTerm, filterSpecies, filterStatus]);

  return (
    <div className="dashboard">
      <div className="stats-grid">
        <div className="stat-item glass-card">
          <span className="stat-label">Total Animales</span>
          <span className="stat-value">{stats.total}</span>
        </div>
        <div className="stat-item glass-card">
          <span className="stat-label">Disponibles</span>
          <span className="stat-value text-primary">{stats.available}</span>
        </div>
        <div className="stat-item glass-card">
          <span className="stat-label">En Cuarentena</span>
          <span className="stat-value text-secondary">{stats.quarantine}</span>
        </div>
        <div className="stat-item glass-card">
          <span className="stat-label">Médico</span>
          <span className="stat-value text-accent">{stats.medical}</span>
        </div>
      </div>

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
        <h2>{filteredAnimals.length} Residentes Encontrados</h2>
      </div>

      <div className="animals-grid">
        {filteredAnimals.map(animal => (
          <div key={animal.id} onClick={() => setSelectedAnimal(animal)}>
            <AnimalCard animal={animal} />
          </div>
        ))}
      </div>

      {selectedAnimal && (
        <AnimalDetail
          animal={selectedAnimal}
          onClose={() => setSelectedAnimal(null)}
          onEdit={(animal) => {
            setSelectedAnimal(null);
            setEditingAnimal(animal);
          }}
          onDelete={async (id) => {
            await animalsApi.delete(id);
            await fetchAnimals();
            setSelectedAnimal(null);
          }}
        />
      )}

      {showAddForm && (
        <AnimalForm
          onClose={() => setShowAddForm(false)}
          onSubmit={async (data) => {
            await animalsApi.create(data);
            await fetchAnimals();
            setShowAddForm(false);
          }}
        />
      )}

      {editingAnimal && (
        <AnimalForm
          initialData={editingAnimal}
          onClose={() => setEditingAnimal(null)}
          onSubmit={async (data) => {
            await animalsApi.update(editingAnimal.id, data);
            await fetchAnimals();
            setEditingAnimal(null);
          }}
        />
      )}

      <button className="fab-button" onClick={() => setShowAddForm(true)}>
        <span>+</span>
      </button>

      {filteredAnimals.length === 0 && (
        <div className="no-results glass-card">
          <p>No se encontraron animales que coincidan con tu búsqueda.</p>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
