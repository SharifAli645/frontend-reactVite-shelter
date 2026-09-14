export interface MedicalRecord {
  id: string;
  type: 'Vacuna' | 'Consulta' | 'Tratamiento';
  description: string;
  date: string;
  animalId: string;
}

export interface Photo {
  id: string;
  url: string;
  isPrimary: boolean;
  animalId: string;
}

export interface Animal {
  id: string;
  name: string;
  species: 'Perro' | 'Gato' | 'Otro';
  breed: string;
  age: string;
  status: 'Disponible' | 'En Cuarentena' | 'Adoptado' | 'Médico';
  image: string;
  entryDate: string;
  description?: string;
  hasChip: boolean;
  isSterilized: boolean;
  origin?: string;
  veterinaryNotes?: string;
  photos: Photo[];
  medicalRecords: MedicalRecord[];
}

export interface ShelterStats {
  total: number;
  available: number;
  quarantine: number;
  medical: number;
}

export type AdoptionStatus = 'Pendiente' | 'Aprobada' | 'Completada' | 'Cancelada';

export type StaffRole = 'Admin' | 'Veterinario' | 'Voluntario' | 'Cuidador';

export interface ShelterProfile {
  id?: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  description?: string;
  website?: string;
}

export interface StaffUser {
  id: string;
  name: string;
  email: string;
  role: StaffRole;
  phone?: string;
  createdAt: string;
}

export interface Adoption {
  id: string;
  status: AdoptionStatus;
  adopterName: string;
  adopterEmail: string;
  adopterPhone?: string;
  adopterAddress?: string;
  notes?: string;
  date: string;
  animalId: string;
  animal: Animal;
}
