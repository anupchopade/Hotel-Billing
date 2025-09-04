export interface MenuItem {
  id: string;
  name: string;
  category: string;
  fullPrice: number;
  halfPrice: number;
  isAvailable: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface BillItem {
  id: string;
  menuItemId: string;
  name: string;
  type: 'full' | 'half';
  price: number;
  quantity: number;
  total: number;
}

// API types that match backend structure
export interface ApiBillItem {
  id: string;
  billId: string;
  menuItemId: string;
  nameSnapshot: string;
  type: 'full' | 'half';
  qty: number;
  price: number;
  total: number;
}

export interface ApiBill {
  id: string;
  billNo: string;
  customer: string;
  tableNumber: string;
  subtotal: number;
  cgst: number;
  sgst: number;
  discount: number;
  total: number;
  createdAt: string;
  createdById: string;
  createdBy: {
    id: string;
    name: string;
    email: string;
  };
  items: ApiBillItem[];
}

export interface Bill {
  id: string;
  billNumber: string;
  customerName: string;
  tableNumber: string;
  items: BillItem[];
  subtotal: number;
  gstAmount: number;
  discount: number;
  total: number;
  createdAt: string;
  createdBy: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'cashier';
}