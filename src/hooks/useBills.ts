import { useState, useEffect, useRef } from 'react';
import { Bill, BillItem, ApiBill, ApiBillItem } from '../types';
import { api } from '../lib/api';

// Global cache and request deduplication
let billsCache: Bill[] | null = null;
let billsPromise: Promise<Bill[]> | null = null;
let lastFetchTime = 0;
const CACHE_DURATION = 30000; // 30 seconds cache

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
  const hasInitialized = useRef(false);

  const fetchBills = async (forceRefresh = false) => {
    const now = Date.now();
    
    // Return cached data if available and not expired
    if (!forceRefresh && billsCache && (now - lastFetchTime) < CACHE_DURATION) {
      setBills(billsCache);
      setIsLoading(false);
      return;
    }

    // If there's already a request in progress, wait for it
    if (billsPromise) {
      try {
        const cachedBills = await billsPromise;
        setBills(cachedBills);
        setIsLoading(false);
        return;
      } catch (error) {
        // If the ongoing request fails, we'll make a new one
        billsPromise = null;
      }
    }

    // Make new request
    try {
      setIsLoading(true);
      billsPromise = api.get('/bills').then(res => {
        const transformedBills = res.data.map(transformApiBillToFrontend);
        billsCache = transformedBills;
        lastFetchTime = now;
        billsPromise = null;
        return transformedBills;
      });
      
      const transformedBills = await billsPromise;
      setBills(transformedBills);
    } catch (error) {
      console.error('Failed to fetch bills:', error);
      billsPromise = null;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!hasInitialized.current) {
      hasInitialized.current = true;
      fetchBills();
    }
  }, []);

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
      
      // Add to local state and update cache
      setBills(prev => [newBill, ...prev]);
      if (billsCache) {
        billsCache = [newBill, ...billsCache];
      }
      
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