import React, { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../lib/api';

interface User {
	id: string;
	name: string;
	email: string;
	role: 'admin' | 'cashier';
}

interface AuthContextType {
	user: User | null;
	users: User[];
	login: (email: string, password: string) => Promise<boolean>;
	logout: () => void;
	addUser: (params: { name: string; email: string; role: 'admin' | 'cashier'; password: string }) => Promise<{ success: boolean; error?: string }>;
	updateUser: (id: string, changes: Partial<Omit<User, 'id'>>) => Promise<{ success: boolean; error?: string }>;
	deleteUser: (id: string) => Promise<{ success: boolean; error?: string }>;
	changePassword: (id: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
	isLoading: boolean;
	fetchUsers: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
	const [user, setUser] = useState<User | null>(null);
	const [users, setUsers] = useState<User[]>([]);
	const [isLoading, setIsLoading] = useState(true);

	// Fetch users from backend (only for admins)
	const fetchUsers = async () => {
		try {
			const res = await api.get('/users');
			setUsers(res.data);
		} catch (error) {
			console.error('Failed to fetch users:', error);
			// Don't throw error - cashiers don't have access to users endpoint
		}
	};

	useEffect(() => {
		const initializeAuth = async () => {
			// Load current session from localStorage
			const savedUser = localStorage.getItem('user');
			const accessToken = localStorage.getItem('access_token');
			
			if (savedUser && accessToken) {
				try {
					const parsedUser = JSON.parse(savedUser);
					setUser(parsedUser);
					
					// Only fetch users if the user is an admin
					if (parsedUser.role === 'admin') {
						try {
							await fetchUsers();
						} catch (error) {
							console.warn('Failed to fetch users on init, but keeping user logged in:', error);
							// Don't clear tokens here - let the user stay logged in
						}
					}
				} catch (error) {
					console.error('Failed to parse saved user:', error);
					// Only clear data if parsing fails (corrupted data)
					localStorage.removeItem('user');
					localStorage.removeItem('access_token');
					localStorage.removeItem('refresh_token');
				}
			}
			
			setIsLoading(false);
		};

		initializeAuth();
	}, []);

	const login = async (email: string, password: string): Promise<boolean> => {
		try {
			const res = await api.post('/auth/login', { email, password });
			const { accessToken, refreshToken, user: userData } = res.data;
			
			// Store tokens and user data
			localStorage.setItem('access_token', accessToken);
			localStorage.setItem('refresh_token', refreshToken);
			localStorage.setItem('user', JSON.stringify(userData));
			
			setUser(userData);
			
			// Only fetch users if the user is an admin
			if (userData.role === 'admin') {
				await fetchUsers();
			}
			
			return true;
		} catch (error) {
			console.error('Login failed:', error);
			return false;
		}
	};

	const logout = () => {
		setUser(null);
		setUsers([]);
		localStorage.removeItem('user');
		localStorage.removeItem('access_token');
		localStorage.removeItem('refresh_token');
	};

	const addUser = async ({ name, email, role, password }: { name: string; email: string; role: 'admin' | 'cashier'; password: string }): Promise<{ success: boolean; error?: string }> => {
		try {
			await api.post('/users', { name, email, role, password });
			await fetchUsers(); // Refresh the users list
			return { success: true };
		} catch (error: any) {
			const errorMessage = error.response?.data?.error || 'Failed to add user';
			return { success: false, error: errorMessage };
		}
	};

	const updateUser = async (id: string, changes: Partial<Omit<User, 'id'>>): Promise<{ success: boolean; error?: string }> => {
		try {
			await api.patch(`/users/${id}`, changes);
			await fetchUsers(); // Refresh the users list
			return { success: true };
		} catch (error: any) {
			const errorMessage = error.response?.data?.error || 'Failed to update user';
			return { success: false, error: errorMessage };
		}
	};

	const deleteUser = async (id: string): Promise<{ success: boolean; error?: string }> => {
		try {
			await api.delete(`/users/${id}`);
			await fetchUsers(); // Refresh the users list
			
			// If deleting current user, logout
			if (user?.id === id) {
				logout();
			}
			
			return { success: true };
		} catch (error: any) {
			const errorMessage = error.response?.data?.error || 'Failed to delete user';
			return { success: false, error: errorMessage };
		}
	};

	const changePassword = async (id: string, newPassword: string): Promise<{ success: boolean; error?: string }> => {
		try {
			await api.patch(`/users/${id}/password`, { password: newPassword });
			return { success: true };
		} catch (error: any) {
			const errorMessage = error.response?.data?.error || 'Failed to change password';
			return { success: false, error: errorMessage };
		}
	};

	return (
		<AuthContext.Provider value={{ user, users, login, logout, addUser, updateUser, deleteUser, changePassword, isLoading, fetchUsers }}>
			{children}
		</AuthContext.Provider>
	);
}

export function useAuth() {
	const context = useContext(AuthContext);
	if (!context) {
		throw new Error('useAuth must be used within AuthProvider');
	}
	return context;
}