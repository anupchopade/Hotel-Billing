import { useState, useEffect } from 'react';
import { Bill, BillItem, ApiBill, ApiBillItem } from '../types';
import { api } from '../lib/api';

interface CreateBillData {
  customerName: string;
  tableNumber: string;
  items: BillItem[];
  discount: number;
}

// Transform API bill data to frontend format
const transformApiBillToFrontend = (apiBill: ApiBill): Bill => {
  // Extract name from email (part before @) or use full name if available
  const createdByName = apiBill.createdBy?.name || 
    (apiBill.createdBy?.email ? apiBill.createdBy.email.split('@')[0] : 'Unknown');

  return {
    id: apiBill.id,
    billNumber: apiBill.billNo,
    customerName: apiBill.customer,
    tableNumber: apiBill.tableNumber,
    items: apiBill.items.map((apiItem: ApiBillItem): BillItem => ({
      id: apiItem.id,
      menuItemId: apiItem.menuItemId,
      name: apiItem.nameSnapshot,
      type: apiItem.type,
      price: Number(apiItem.price),
      quantity: apiItem.qty,
      total: Number(apiItem.total)
    })),
    subtotal: Number(apiBill.subtotal),
    gstAmount: Number(apiBill.cgst) + Number(apiBill.sgst),
    discount: Number(apiBill.discount),
    total: Number(apiBill.total),
    createdAt: apiBill.createdAt,
    createdBy: createdByName
  };
};

export function useBills() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasFetched, setHasFetched] = useState(false);

  const fetchBills = async () => {
    if (hasFetched) return; // Prevent duplicate calls
    
    try {
      setIsLoading(true);
      const res = await api.get('/bills');
      const transformedBills = res.data.map(transformApiBillToFrontend);
      setBills(transformedBills);
      setHasFetched(true);
    } catch (error) {
      console.error('Failed to fetch bills:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBills();
  }, [hasFetched]);

  const addBill = async (data: CreateBillData): Promise<{ success: boolean; bill?: Bill; error?: string }> => {
    try {
      // Transform frontend data to API format
      const apiData = {
        customer: data.customerName,
        tableNumber: data.tableNumber,
        items: data.items.map(item => ({
          menuItemId: item.menuItemId,
          name: item.name,
          type: item.type,
          qty: item.quantity,
          price: item.price,
          total: item.total
        })),
        discount: data.discount
      };

      const res = await api.post('/bills', apiData);
      const newBill = transformApiBillToFrontend(res.data);
      
      // Add to local state
      setBills(prev => [newBill, ...prev]);
      
      return { success: true, bill: newBill };
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to create bill';
      return { success: false, error: errorMessage };
    }
  };

  return { 
    bills, 
    addBill, 
    isLoading,
    fetchBills 
  };
}