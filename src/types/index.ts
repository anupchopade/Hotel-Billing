export interface MenuItem {
  id: string;
  name: string;
  category: string;
  fullPlatePrice: number;
  halfPlatePrice: number;
  isAvailable: boolean;
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

export interface ApiUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'cashier';
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