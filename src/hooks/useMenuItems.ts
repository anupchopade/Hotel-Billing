import { useState, useEffect } from 'react';
import { MenuItem } from '../types';
import { api } from '../lib/api';

interface AddMenuItemData {
  name: string;
  category: string;
  fullPrice: number;
  halfPrice: number;
  isAvailable: boolean;
}

export function useMenuItems() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasFetched, setHasFetched] = useState(false);

  const fetchMenuItems = async () => {
    if (hasFetched) return; // Prevent duplicate calls
    
    try {
      setIsLoading(true);
      const res = await api.get('/menu');
      setMenuItems(res.data);
      setHasFetched(true);
    } catch (error) {
      console.error('Failed to fetch menu items:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMenuItems();
  }, [hasFetched]);

  const refreshMenuItems = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/menu');
      setMenuItems(res.data);
    } catch (error) {
      console.error('Failed to refresh menu items:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addMenuItem = async (data: AddMenuItemData): Promise<{ success: boolean; error?: string }> => {
    try {
      await api.post('/menu', data);
      await refreshMenuItems(); // Refresh the menu items
      return { success: true };
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to add menu item';
      return { success: false, error: errorMessage };
    }
  };

  const updateMenuItem = async (id: string, data: AddMenuItemData): Promise<{ success: boolean; error?: string }> => {
    try {
      await api.patch(`/menu/${id}`, data);
      await refreshMenuItems(); // Refresh the menu items
      return { success: true };
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to update menu item';
      return { success: false, error: errorMessage };
    }
  };

  const deleteMenuItem = async (id: string): Promise<{ success: boolean; error?: string }> => {
    try {
      await api.delete(`/menu/${id}`);
      await refreshMenuItems(); // Refresh the menu items
      return { success: true };
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to delete menu item';
      return { success: false, error: errorMessage };
    }
  };

  return { 
    menuItems, 
    addMenuItem, 
    updateMenuItem, 
    deleteMenuItem, 
    isLoading,
    fetchMenuItems 
  };
}