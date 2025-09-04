import { useState, useEffect, useRef } from 'react';
import { MenuItem } from '../types';
import { api } from '../lib/api';

// Global cache and request deduplication
let menuItemsCache: MenuItem[] | null = null;
let menuItemsPromise: Promise<MenuItem[]> | null = null;
let lastFetchTime = 0;
const CACHE_DURATION = 30000; // 30 seconds cache

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
  const hasInitialized = useRef(false);

  const fetchMenuItems = async (forceRefresh = false) => {
    const now = Date.now();
    
    // Return cached data if available and not expired
    if (!forceRefresh && menuItemsCache && (now - lastFetchTime) < CACHE_DURATION) {
      setMenuItems(menuItemsCache);
      setIsLoading(false);
      return;
    }

    // If there's already a request in progress, wait for it
    if (menuItemsPromise) {
      try {
        const cachedMenuItems = await menuItemsPromise;
        setMenuItems(cachedMenuItems);
        setIsLoading(false);
        return;
      } catch (error) {
        // If the ongoing request fails, we'll make a new one
        menuItemsPromise = null;
      }
    }

    // Make new request
    try {
      setIsLoading(true);
      menuItemsPromise = api.get('/menu').then(res => {
        menuItemsCache = res.data;
        lastFetchTime = now;
        menuItemsPromise = null;
        return res.data;
      });
      
      const fetchedMenuItems = await menuItemsPromise;
      setMenuItems(fetchedMenuItems);
    } catch (error) {
      console.error('Failed to fetch menu items:', error);
      menuItemsPromise = null;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!hasInitialized.current) {
      hasInitialized.current = true;
      fetchMenuItems();
    }
  }, []);

  const refreshMenuItems = async () => {
    await fetchMenuItems(true); // Force refresh
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