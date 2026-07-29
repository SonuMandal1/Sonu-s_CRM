export type Role = 'admin' | 'sales' | 'warehouse' | 'accounts';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface Customer {
  id: string;
  name: string;
  mobile: string;
  email?: string;
  businessName?: string;
  gstNumber?: string;
  customerType: 'retail' | 'wholesale' | 'distributor';
  address?: string;
  status: 'lead' | 'active' | 'inactive';
  followUpDate?: string;
  notes?: string;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  categoryId?: string;
  categoryName?: string | null;
  unitPrice: string;
  currentStock: number;
  minStockAlert: number;
  warehouseId?: string;
  warehouseName?: string | null;
}

export interface ChallanItem {
  productId: string;
  productNameSnapshot: string;
  skuSnapshot: string;
  unitPriceSnapshot: string;
  quantity: number;
}

export interface Challan {
  id: string;
  challanNumber: string;
  customerId: string;
  totalQuantity: number;
  status: 'draft' | 'confirmed' | 'cancelled';
  createdAt: string;
  items: ChallanItem[];
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}