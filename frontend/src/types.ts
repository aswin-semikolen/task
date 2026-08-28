export type Gender = 'male' | 'female' | 'other';
export type UserStatus = 'active' | 'inactive';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  dateOfBirth: string;
  gender: Gender;
  address: string;
  city: string;
  country: string;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Paginated<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ReportSummary {
  total: number;
  active: number;
  inactive: number;
  newLast30Days: number;
  byGender: { gender: Gender; count: number; percentage: number }[];
}

export interface UserFormValues {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phoneNumber: string;
  dateOfBirth: string;
  gender: Gender;
  address: string;
  city: string;
  country: string;
  status: UserStatus;
}

export const GENDERS: Gender[] = ['male', 'female', 'other'];
export const STATUSES: UserStatus[] = ['active', 'inactive'];
