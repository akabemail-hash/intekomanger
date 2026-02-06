export type Language = 'az' | 'ru' | 'tr' | 'en';

export interface Role {
  name: string;
  permissions: string[];
}

export interface Package {
  id: string;
  name: string;
  max_users: number;
  features: string[]; // List of permissions allowed for this package
  price: number;
  created_at?: string;
}

export interface Tenant {
  id: string;
  voen: string;
  name: string;
  package_id: string;
  status: 'active' | 'inactive';
  customer_type?: 'normal' | 'clinic';
  created_at?: string;
  package?: Package;
}

export interface User {
  id: string;
  username: string;
  voen: string;
  password?: string;
  role: string; // Links to Role.name
  tenant_id?: string;
  permissions?: string[]; 
  customer_type?: 'normal' | 'clinic';
}

export interface Notification {
  id: string;
  message: string;
  date: string;
  isRead: boolean;
  targetType: 'all' | 'role' | 'users';
  targetValue?: string | string[]; // role name or array of user IDs
}

export interface Product {
  id: string;
  name: string;
  group: string;
  stock: number;
  price: number;
}

export interface Sale {
  id: string;
  date: string; // ISO date
  productId: string;
  quantity: number;
  total: number;
  paymentMethod: 'cash' | 'card';
}

export interface Purchase {
  id: string;
  date: string;
  productId: string;
  quantity: number;
  total: number;
}

export interface Translation {
  [key: string]: {
    az: string;
    ru: string;
    tr: string;
    en: string;
  };
}