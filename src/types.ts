export interface Transaction {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
  type: 'income' | 'expense';
}

export interface Category {
  id: string;
  name: string;
  color: string;
}

export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  endDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  cpf: string;
  phone: string;
}

export interface User {
  uid: string;
  username: string;
  isAdmin: boolean;
  isApproved: boolean;
  accessDuration?: number; // Duration in seconds
  createdAt?: string;
  profile?: UserProfile;
}