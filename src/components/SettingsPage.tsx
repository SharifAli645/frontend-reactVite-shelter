import React, { useState, useEffect } from 'react';
import type { ShelterProfile, StaffUser, StaffRole } from '../types';
import { settingsApi, animalsApi, adoptionsApi } from '../services/api';
import './SettingsPage.css';

type Tab = 'perfil' | 'usuarios' | 'apariencia' | 'exportar';

interface Theme {
  name: string;
  primary: string;
  primaryLight: string;
  secondary: string;
  bg: string;
  text: string;
  muted: string;
}

const THEMES: Theme[] = [
  { name: 'Bosque',   primary: '#4a6741', primaryLight: '#6b8e5e', secondary: '#d4a373', bg: '#fefae0', text: '#283618', muted: '#606c38' },
  { name: 'Océano',   primary: '#1e3a5f', primaryLight: '#2e5987', secondary: '#7fb3d3', bg: '#f0f7ff', text: '#0d1f33', muted: '#3a6186' },
  { name: 'Burdeos',  primary: '#6b1d2e', primaryLight: '#9b3547', secondary: '#d4956a', bg: '#fff5f0', text: '#2d0a12', muted: '#8b3a4a' },
  { name: 'Mostaza',  primary: '#7a5c00', primaryLight: '#a07a0a', secondary: '#c4956a', bg: '#fffbf0', text: '#2d2000', muted: '#806030' },
  { name: 'Pizarra',  primary: '#2c3e50', primaryLight: '#3d5166', secondary: '#95a5a6', bg: '#f8f9fa', text: '#1a252f', muted: '#5d6d7e' },
];

const ROLES: StaffRole[] = ['Admin', 'Veterinario', 'Voluntario', 'Cuidador'];

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.style.setProperty('--primary', theme.primary);
  root.style.setProperty('--primary-light', theme.primaryLight);
  root.style.setProperty('--secondary', theme.secondary);
  root.style.setProperty('--background', theme.bg);
  root.style.setProperty('--text', theme.text);
  root.style.setProperty('--text-muted', theme.muted);
}

function downloadCsv(filename: string, rows: object[]) {
  if (rows.length === 0) return;
  const headers = Object.keys(rows[0]);
  const csv = [
    headers.join(','),
    ...rows.map(row =>
      headers.map(h => {
        const val = String((row as Record<string, unknown>)[h] ?? '');
        return `"${val.replace(/"/g, '""')}"`;
      }).join(',')
    ),
  ].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Perfil del Refugio ───────────────────────────────────────────────────────

const ShelterProfileTab: React.FC = () => {
  const [form, setForm] = useState<ShelterProfile>({ name: '' });
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    settingsApi.getShelter().then(data => {
      if (data) setForm(data);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await settingsApi.updateShelter(form);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error(err);
      alert('Error al guardar el perfil.');
    }
  };

  if (loading) return <div className="settings-loading">Cargando...</div>;

  return (
    <div className="settings-section">
      <h2>Perfil del Refugio</h2>
      <p className="settings-desc">Información general del refugio visible en reportes y comunicaciones.</p>
      <form className="settings-form" onSubmit={handleSubmit}>
        <div>
          <label>Nombre del Refugio *</label>
          <input name="name" value={form.name || ''} onChange={handleChange} required placeholder="Refugio Esperanza" />
        </div>
        <div>
          <label>Email de Contacto</label>
          <input name="email" type="email" value={form.email || ''} onChange={handleChange} placeholder="contacto@refugio.org" />
        </div>
        <div>
          <label>Teléfono</label>
          <input name="phone" value={form.phone || ''} onChange={handleChange} placeholder="+34 600 000 000" />
        </div>
        <div>
          <label>Sitio Web</label>
          <input name="website" value={form.website || ''} onChange={handleChange} placeholder="https://refugio.org" />
        </div>
        <div className="full-width">
          <label>Dirección</label>
          <input name="address" value={form.address || ''} onChange={handleChange} placeholder="Calle Principal 1, Ciudad" />
        </div>
        <div className="full-width">
          <label>Descripción</label>
          <textarea name="description" value={form.description || ''} onChange={handleChange} rows={4} placeholder="Breve descripción del refugio..." />
        </div>
        <div className="full-width settings-form-actions">
          <button type="submit" className="btn-primary">Guardar</button>
          {saved && <span className="save-feedback">Guardado ✓</span>}
        </div>
      </form>
    </div>
  );
};

// ─── Usuarios Staff ───────────────────────────────────────────────────────────

const EMPTY_NEW_USER = { name: '', email: '', role: 'Voluntario' as StaffRole, phone: '' };
const EMPTY_EDIT_USER = { name: '', email: '', role: 'Voluntario' as StaffRole, phone: '', password: '' };

const UsersTab: React.FC = () => {
  const [users, setUsers] = useState<StaffUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [newUser, setNewUser] = useState(EMPTY_NEW_USER);
  const [editingUser, setEditingUser] = useState<StaffUser | null>(null);
  const [editForm, setEditForm] = useState(EMPTY_EDIT_USER);

  const fetchUsers = async () => {
    try {
      const data = await settingsApi.getUsers();
      setUsers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`¿Eliminar a ${name}?`)) return;
    try {
      await settingsApi.deleteUser(id);
      setUsers(prev => prev.filter(u => u.id !== id));
    } catch (err) {
      console.error(err);
      alert('Error al eliminar el usuario.');
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const created = await settingsApi.createUser(newUser);
      setUsers(prev => [created, ...prev]);
      setModalOpen(false);
      setNewUser(EMPTY_NEW_USER);
    } catch (err) {
      console.error(err);
      alert('Error al crear el usuario. Comprueba que el email no esté duplicado.');
    }
  };

  const openEdit = (user: StaffUser) => {
    setEditingUser(user);
    setEditForm({ name: user.name, email: user.email, role: user.role, phone: user.phone || '', password: '' });
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    try {
      const payload: Record<string, string> = {
        name: editForm.name,
        email: editForm.email,
        role: editForm.role,
        phone: editForm.phone,
      };
      if (editForm.password) payload.password = editForm.password;
      const updated = await settingsApi.updateUser(editingUser.id, payload);
      setUsers(prev => prev.map(u => (u.id === editingUser.id ? updated : u)));
      setEditingUser(null);
    } catch (err) {
      console.error(err);
      alert('Error al actualizar el usuario.');
    }
  };

  if (loading) return <div className="settings-loading">Cargando...</div>;

  return (
    <div className="settings-section">
      <div className="section-header">
        <div>
          <h2>Usuarios Staff</h2>
          <p className="settings-desc">Gestión del equipo del refugio.</p>
        </div>
        <button className="btn-primary" onClick={() => setModalOpen(true)}>+ Añadir usuario</button>
      </div>

      {users.length === 0 ? (
        <div className="empty-state">No hay usuarios registrados.</div>
      ) : (
        <table className="users-table">
          <thead>
            <tr>
              <th></th>
              <th>Nombre</th>
              <th>Email</th>
              <th>Rol</th>
              <th>Teléfono</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td>
                  <div className="user-avatar">{user.name.charAt(0).toUpperCase()}</div>
                </td>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>
                  <span className={`user-role-badge ${user.role.toLowerCase()}`}>{user.role}</span>
                </td>
                <td>{user.phone || '—'}</td>
                <td className="user-actions">
                  <button className="btn-edit-sm" onClick={() => openEdit(user)}>Editar</button>
                  <button className="btn-danger-sm" onClick={() => handleDelete(user.id, user.name)}>Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <h3>Nuevo Usuario</h3>
            <form className="settings-form" onSubmit={handleCreate}>
              <div>
                <label>Nombre *</label>
                <input value={newUser.name} onChange={e => setNewUser(p => ({ ...p, name: e.target.value }))} required placeholder="Ana García" />
              </div>
              <div>
                <label>Email *</label>
                <input type="email" value={newUser.email} onChange={e => setNewUser(p => ({ ...p, email: e.target.value }))} required placeholder="ana@refugio.org" />
              </div>
              <div>
                <label>Teléfono</label>
                <input value={newUser.phone} onChange={e => setNewUser(p => ({ ...p, phone: e.target.value }))} placeholder="+34 600 000 000" />
              </div>
              <div className="full-width">
                <label>Rol *</label>
                <div className="role-chips">
                  {ROLES.map(r => (
                    <button
                      key={r}
                      type="button"
                      className={`role-chip ${r.toLowerCase()} ${newUser.role === r ? 'selected' : ''}`}
                      onClick={() => setNewUser(p => ({ ...p, role: r }))}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>
              <div className="full-width modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setModalOpen(false)}>Cancelar</button>
                <button type="submit" className="btn-primary">Crear</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editingUser && (
        <div className="modal-overlay" onClick={() => setEditingUser(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <h3>Editar Usuario</h3>
            <form className="settings-form" onSubmit={handleEdit}>
              <div>
                <label>Nombre *</label>
                <input value={editForm.name} onChange={e => setEditForm(p => ({ ...p, name: e.target.value }))} required />
              </div>
              <div>
                <label>Email *</label>
                <input type="email" value={editForm.email} onChange={e => setEditForm(p => ({ ...p, email: e.target.value }))} required />
              </div>
              <div>
                <label>Teléfono</label>
                <input value={editForm.phone} onChange={e => setEditForm(p => ({ ...p, phone: e.target.value }))} placeholder="+34 600 000 000" />
              </div>
              <div>
                <label>Nueva contraseña</label>
                <input type="password" value={editForm.password} onChange={e => setEditForm(p => ({ ...p, password: e.target.value }))} placeholder="Dejar vacío para no cambiar" minLength={6} />
              </div>
              <div className="full-width">
                <label>Rol *</label>
                <div className="role-chips">
                  {ROLES.map(r => (
                    <button
                      key={r}
                      type="button"
                      className={`role-chip ${r.toLowerCase()} ${editForm.role === r ? 'selected' : ''}`}
                      onClick={() => setEditForm(p => ({ ...p, role: r }))}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>
              <div className="full-width modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setEditingUser(null)}>Cancelar</button>
                <button type="submit" className="btn-primary">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Apariencia ───────────────────────────────────────────────────────────────

const AppearanceTab: React.FC = () => {
  const [activeTheme, setActiveTheme] = useState<string>(() => {
    return localStorage.getItem('shelter-theme') || 'Bosque';
  });

  const handleTheme = (theme: Theme) => {
    applyTheme(theme);
    localStorage.setItem('shelter-theme', theme.name);
    setActiveTheme(theme.name);
  };

  return (
    <div className="settings-section">
      <h2>Apariencia</h2>
      <p className="settings-desc">Selecciona una paleta de color para personalizar la interfaz.</p>
      <div className="theme-swatches">
        {THEMES.map(theme => (
          <button
            key={theme.name}
            className={`theme-swatch ${activeTheme === theme.name ? 'active' : ''}`}
            onClick={() => handleTheme(theme)}
            title={theme.name}
            style={{
              '--swatch-primary': theme.primary,
              '--swatch-light': theme.primaryLight,
              '--swatch-secondary': theme.secondary,
              '--swatch-bg': theme.bg,
            } as React.CSSProperties}
          >
            <div className="swatch-preview">
              <div className="swatch-bar" style={{ background: theme.primary }} />
              <div className="swatch-bar" style={{ background: theme.primaryLight }} />
              <div className="swatch-bar" style={{ background: theme.secondary }} />
              <div className="swatch-bar" style={{ background: theme.bg, border: '1px solid #ccc' }} />
            </div>
            <span className="swatch-name">{theme.name}</span>
            {activeTheme === theme.name && <span className="swatch-check">✓</span>}
          </button>
        ))}
      </div>
    </div>
  );
};

// ─── Exportar ─────────────────────────────────────────────────────────────────

const ExportTab: React.FC = () => {
  const [loadingAnimals, setLoadingAnimals] = useState(false);
  const [loadingAdoptions, setLoadingAdoptions] = useState(false);

  const handleExportAnimals = async () => {
    setLoadingAnimals(true);
    try {
      const data = await animalsApi.getAll();
      const rows = data.map((a: Record<string, unknown>) => ({
        ID: a.id,
        Nombre: a.name,
        Especie: a.species,
        Raza: a.breed,
        Edad: a.age,
        Estado: a.status,
        FechaEntrada: a.entryDate,
        Chip: a.hasChip ? 'Sí' : 'No',
        Esterilizado: a.isSterilized ? 'Sí' : 'No',
        Origen: a.origin ?? '',
        Descripcion: a.description ?? '',
      }));
      downloadCsv('animales.csv', rows);
    } catch (err) {
      console.error(err);
      alert('Error al exportar animales.');
    } finally {
      setLoadingAnimals(false);
    }
  };

  const handleExportAdoptions = async () => {
    setLoadingAdoptions(true);
    try {
      const data = await adoptionsApi.getAll();
      const rows = data.map((a: Record<string, unknown>) => {
        const animal = a.animal as Record<string, unknown> | undefined;
        return {
          ID: a.id,
          Estado: a.status,
          Animal: animal?.name ?? '',
          Adoptante: a.adopterName,
          EmailAdoptante: a.adopterEmail,
          TelefonoAdoptante: a.adopterPhone ?? '',
          DireccionAdoptante: a.adopterAddress ?? '',
          Fecha: a.date,
          Notas: a.notes ?? '',
        };
      });
      downloadCsv('adopciones.csv', rows);
    } catch (err) {
      console.error(err);
      alert('Error al exportar adopciones.');
    } finally {
      setLoadingAdoptions(false);
    }
  };

  return (
    <div className="settings-section">
      <h2>Exportar Datos</h2>
      <p className="settings-desc">Descarga los datos del refugio en formato CSV.</p>
      <div className="export-cards">
        <div className="export-card">
          <div className="export-card-icon">🐾</div>
          <h3>Animales</h3>
          <p>Exporta el listado completo de animales con sus datos.</p>
          <button className="btn-primary" onClick={handleExportAnimals} disabled={loadingAnimals}>
            {loadingAnimals ? 'Generando...' : 'Descargar CSV'}
          </button>
        </div>
        <div className="export-card">
          <div className="export-card-icon">🏠</div>
          <h3>Adopciones</h3>
          <p>Exporta el historial de adopciones con datos del adoptante.</p>
          <button className="btn-primary" onClick={handleExportAdoptions} disabled={loadingAdoptions}>
            {loadingAdoptions ? 'Generando...' : 'Descargar CSV'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── SettingsPage ─────────────────────────────────────────────────────────────

const TABS: { id: Tab; label: string }[] = [
  { id: 'perfil', label: 'Perfil del Refugio' },
  { id: 'usuarios', label: 'Usuarios Staff' },
  { id: 'apariencia', label: 'Apariencia' },
  { id: 'exportar', label: 'Exportar' },
];

const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('perfil');

  return (
    <div className="settings-page">
      <h1 className="settings-title">Configuración</h1>
      <div className="settings-tabs">
        {TABS.map(tab => (
          <button
            key={tab.id}
            className={`settings-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="settings-content">
        {activeTab === 'perfil' && <ShelterProfileTab />}
        {activeTab === 'usuarios' && <UsersTab />}
        {activeTab === 'apariencia' && <AppearanceTab />}
        {activeTab === 'exportar' && <ExportTab />}
      </div>
    </div>
  );
};

export { applyTheme, THEMES };
export default SettingsPage;
