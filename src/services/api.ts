const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const getAuthHeaders = (): Record<string, string> => {
  const token = localStorage.getItem('shelter-access-token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const animalsApi = {
  getAll: async (page?: number, limit?: number) => {
    const params = page !== undefined && limit !== undefined ? `?page=${page}&limit=${limit}` : '';
    const response = await fetch(`${API_URL}/animals${params}`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch animals');
    return response.json();
  },

  getOne: async (id: string) => {
    const response = await fetch(`${API_URL}/animals/${id}`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch animal');
    return response.json();
  },

  create: async (formData: FormData) => {
    const response = await fetch(`${API_URL}/animals`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: formData,
    });
    if (!response.ok) throw new Error('Failed to create animal');
    return response.json();
  },

  update: async (id: string, formData: FormData) => {
    const response = await fetch(`${API_URL}/animals/${id}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: formData,
    });
    if (!response.ok) throw new Error('Failed to update animal');
    return response.json();
  },

  delete: async (id: string) => {
    const response = await fetch(`${API_URL}/animals/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to delete animal');
  },
};

export const medicalRecordsApi = {
  create: async (animalId: string, body: { type: string; description: string; date?: string }) => {
    const response = await fetch(`${API_URL}/animals/${animalId}/medical-records`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(body),
    });
    if (!response.ok) throw new Error('Failed to create medical record');
    return response.json();
  },

  delete: async (animalId: string, recordId: string) => {
    const response = await fetch(`${API_URL}/animals/${animalId}/medical-records/${recordId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to delete medical record');
  },
};

export const adoptionsApi = {
  getAll: async (page?: number, limit?: number) => {
    const params = page !== undefined && limit !== undefined ? `?page=${page}&limit=${limit}` : '';
    const response = await fetch(`${API_URL}/adoptions${params}`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch adoptions');
    return response.json();
  },

  getOne: async (id: string) => {
    const response = await fetch(`${API_URL}/adoptions/${id}`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch adoption');
    return response.json();
  },

  create: async (body: object) => {
    const response = await fetch(`${API_URL}/adoptions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(body),
    });
    if (!response.ok) throw new Error('Failed to create adoption');
    return response.json();
  },

  update: async (id: string, body: object) => {
    const response = await fetch(`${API_URL}/adoptions/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(body),
    });
    if (!response.ok) throw new Error('Failed to update adoption');
    return response.json();
  },

  delete: async (id: string) => {
    const response = await fetch(`${API_URL}/adoptions/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to delete adoption');
  },
};

export const settingsApi = {
  getShelter: async () => {
    const response = await fetch(`${API_URL}/settings/shelter`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch shelter profile');
    return response.json();
  },

  updateShelter: async (body: object) => {
    const response = await fetch(`${API_URL}/settings/shelter`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(body),
    });
    if (!response.ok) throw new Error('Failed to update shelter profile');
    return response.json();
  },

  getUsers: async () => {
    const response = await fetch(`${API_URL}/settings/users`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch users');
    return response.json();
  },

  createUser: async (body: object) => {
    const response = await fetch(`${API_URL}/settings/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(body),
    });
    if (!response.ok) throw new Error('Failed to create user');
    return response.json();
  },

  updateUser: async (id: string, body: object) => {
    const response = await fetch(`${API_URL}/settings/users/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(body),
    });
    if (!response.ok) throw new Error('Failed to update user');
    return response.json();
  },

  deleteUser: async (id: string) => {
    const response = await fetch(`${API_URL}/settings/users/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to delete user');
  },
};

export const photosApi = {
  upload: async (animalId: string, file: File) => {
    const formData = new FormData();
    formData.append('photo', file);
    const response = await fetch(`${API_URL}/animals/${animalId}/photos`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: formData,
    });
    if (!response.ok) throw new Error('Failed to upload photo');
    return response.json();
  },

  setPrimary: async (animalId: string, photoId: string) => {
    const response = await fetch(`${API_URL}/animals/${animalId}/photos/${photoId}/primary`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to set primary photo');
  },

  delete: async (animalId: string, photoId: string) => {
    const response = await fetch(`${API_URL}/animals/${animalId}/photos/${photoId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to delete photo');
  },
};
