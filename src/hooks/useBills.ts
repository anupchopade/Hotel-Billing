import { useState, useEffect } from 'react';
import { Bill, BillItem } from '../types';

interface CreateBillData {
  customerName: string;
  tableNumber: string;
  items: BillItem[];
  discount: number;
  createdBy: string;
}

export function useBills() {
  const [bills, setBills] = useState<Bill[]>([]);

  useEffect(() => {
    const savedBills = localStorage.getItem('hotel-bills');
    if (savedBills) {
      setBills(JSON.parse(savedBills));
    } else {
      // Initialize with some demo data
      const demoBills: Bill[] = [
        {
          id: '1',
          billNumber: 'B001',
          customerName: 'John Doe',
          tableNumber: '5',
          items: [
            {
              id: '1',
              menuItemId: '1',
              name: 'Chicken Biryani',
              type: 'full',
              price: 280,
              quantity: 1,
              total: 280
            }
          ],
          subtotal: 280,
          gstAmount: 50.4,
          discount: 0,
          total: 330.4,
          createdAt: new Date().toISOString(),
          createdBy: 'Admin'
        }
      ];
      setBills(demoBills);
      localStorage.setItem('hotel-bills', JSON.stringify(demoBills));
    }
  }, []);

  const getNextBillNumber = () => {
    const currentYear = new Date().getFullYear().toString().slice(-2);
    const currentMonth = (new Date().getMonth() + 1).toString().padStart(2, '0');
    const prefix = `B${currentYear}${currentMonth}`;
    
    const existingNumbers = bills
      .filter(bill => bill.billNumber.startsWith(prefix))
      .map(bill => parseInt(bill.billNumber.slice(5)))
      .filter(num => !isNaN(num));
    
    const nextNumber = existingNumbers.length > 0 ? Math.max(...existingNumbers) + 1 : 1;
    return `${prefix}${nextNumber.toString().padStart(3, '0')}`;
  };

  const addBill = (data: CreateBillData): Bill => {
    const subtotal = data.items.reduce((sum, item) => sum + item.total, 0);
    const gstAmount = subtotal * 0.18;
    const total = subtotal + gstAmount - data.discount;

    const newBill: Bill = {
      id: Date.now().toString(),
      billNumber: getNextBillNumber(),
      customerName: data.customerName,
      tableNumber: data.tableNumber,
      items: data.items,
      subtotal,
      gstAmount,
      discount: data.discount,
      total,
      createdAt: new Date().toISOString(),
      createdBy: data.createdBy
    };

    const updatedBills = [newBill, ...bills];
    setBills(updatedBills);
    localStorage.setItem('hotel-bills', JSON.stringify(updatedBills));
    
    return newBill;
  };

  return { bills, addBill };
}