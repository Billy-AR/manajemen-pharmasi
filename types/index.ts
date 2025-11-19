export interface Medicine {
  id: string;
  name: string;
  stock: number;
  minStock: number;
  expiredAt?: number;
  price: number;
  buyPrice: number;
  supplierId?: string;
  barcode?: string;
  createdAt: number;
  updatedAt: number;
}

export interface Sale {
  id: string;
  items: SaleItem[];
  total: number;
  tax: number;
  discount: number;
  userId: string;
  createdAt: number;
}

export interface SaleItem {
  medicineId: string;
  name: string;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface Supplier {
  id: string;
  name: string;
  contact: string;
  email?: string;
  address?: string;
  phone?: string;
  createdAt: number;
  updatedAt: number;
}

export interface User {
  id: string;
  email: string;
  role: "admin" | "staff";
  displayName?: string;
  createdAt: number;
}

export interface Alert {
  id: string;
  items: AlertItem[];
  status: "sent" | "failed";
  createdAt: number;
  type: "email";
}

export interface AlertItem {
  id: string;
  name: string;
  stock?: number;
  minStock?: number;
  expiredAt?: number;
  reason: "lowStock" | "expiredSoon";
}
