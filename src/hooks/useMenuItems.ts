import { useState, useEffect } from 'react';
import { MenuItem } from '../types';

interface AddMenuItemData {
  name: string;
  category: string;
  fullPlatePrice: number;
  halfPlatePrice: number;
  isAvailable: boolean;
}

export function useMenuItems() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);

  useEffect(() => {
    const savedItems = localStorage.getItem('hotel-menu-items');
    if (savedItems) {
      setMenuItems(JSON.parse(savedItems));
    } else {
      // Initialize with demo menu items
      const demoItems: MenuItem[] = [
        {
          id: '1',
          name: 'Chicken Biryani',
          category: 'biryani',
          fullPlatePrice: 280,
          halfPlatePrice: 150,
          isAvailable: true
        },
        {
          id: '2',
          name: 'Mutton Biryani',
          category: 'biryani',
          fullPlatePrice: 350,
          halfPlatePrice: 200,
          isAvailable: true
        },
        {
          id: '3',
          name: 'Veg Biryani',
          category: 'biryani',
          fullPlatePrice: 220,
          halfPlatePrice: 120,
          isAvailable: true
        },
        {
          id: '4',
          name: 'Chicken Curry',
          category: 'curry',
          fullPlatePrice: 240,
          halfPlatePrice: 130,
          isAvailable: true
        },
        {
          id: '5',
          name: 'Dal Tadka',
          category: 'dal',
          fullPlatePrice: 180,
          halfPlatePrice: 100,
          isAvailable: true
        },
        {
          id: '6',
          name: 'Paneer Butter Masala',
          category: 'curry',
          fullPlatePrice: 260,
          halfPlatePrice: 140,
          isAvailable: true
        },
        {
          id: '7',
          name: 'Chicken 65',
          category: 'starters',
          fullPlatePrice: 320,
          halfPlatePrice: 180,
          isAvailable: true
        },
        {
          id: '8',
          name: 'Fish Fry',
          category: 'starters',
          fullPlatePrice: 280,
          halfPlatePrice: 160,
          isAvailable: true
        }
      ];
      setMenuItems(demoItems);
      localStorage.setItem('hotel-menu-items', JSON.stringify(demoItems));
    }
  }, []);

  const addMenuItem = (data: AddMenuItemData) => {
    const newItem: MenuItem = {
      id: Date.now().toString(),
      ...data
    };
    
    const updatedItems = [...menuItems, newItem];
    setMenuItems(updatedItems);
    localStorage.setItem('hotel-menu-items', JSON.stringify(updatedItems));
  };

  const updateMenuItem = (id: string, data: AddMenuItemData) => {
    const updatedItems = menuItems.map(item => 
      item.id === id ? { ...item, ...data } : item
    );
    setMenuItems(updatedItems);
    localStorage.setItem('hotel-menu-items', JSON.stringify(updatedItems));
  };

  const deleteMenuItem = (id: string) => {
    const updatedItems = menuItems.filter(item => item.id !== id);
    setMenuItems(updatedItems);
    localStorage.setItem('hotel-menu-items', JSON.stringify(updatedItems));
  };

  return { menuItems, addMenuItem, updateMenuItem, deleteMenuItem };
}