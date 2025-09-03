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
	addUser: (params: { name: string; email: string; role: 'admin' | 'cashier'; password: string }) => { success: boolean; error?: string };
	updateUser: (id: string, changes: Partial<Omit<User, 'id'>>) => { success: boolean; error?: string };
	deleteUser: (id: string) => { success: boolean; error?: string };
	changePassword: (id: string, newPassword: string) => { success: boolean; error?: string };
	isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Demo users for development - replace with real authentication
const DEMO_USERS = [
	{ id: '1', email: 'admin@hotel.com', password: 'admin123', name: 'Hotel Admin', role: 'admin' as const },
	{ id: '2', email: 'cashier@hotel.com', password: 'cashier123', name: 'Cashier', role: 'cashier' as const },
	{ id: '3', email: 'dad@hotel.com', password: 'family123', name: 'Dad', role: 'cashier' as const },
	{ id: '4', email: 'brother@hotel.com', password: 'family123', name: 'Brother', role: 'cashier' as const },
	{ id: '5', email: 'uncle@hotel.com', password: 'family123', name: 'Uncle', role: 'cashier' as const },
];

type StoredUser = User & { password: string };

export function AuthProvider({ children }: { children: React.ReactNode }) {
	const [user, setUser] = useState<User | null>(null);
	const [users, setUsers] = useState<User[]>([]);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		// Load current session
		const savedUser = localStorage.getItem('user');
		if (savedUser) {
			setUser(JSON.parse(savedUser));
		}

		// Initialize users store if empty
		const savedUsersRaw = localStorage.getItem('users');
		if (!savedUsersRaw) {
			localStorage.setItem('users', JSON.stringify(DEMO_USERS));
			setUsers(DEMO_USERS.map(({ password, ...u }) => u));
		} else {
			try {
				const parsed: StoredUser[] = JSON.parse(savedUsersRaw);
				setUsers(parsed.map(({ password, ...u }) => u));
			} catch {
				localStorage.setItem('users', JSON.stringify(DEMO_USERS));
				setUsers(DEMO_USERS.map(({ password, ...u }) => u));
			}
		}

		setIsLoading(false);
	}, []);

	const readStoredUsers = (): StoredUser[] => {
		const savedUsersRaw = localStorage.getItem('users');
		return savedUsersRaw ? JSON.parse(savedUsersRaw) : DEMO_USERS;
	};
	const writeStoredUsers = (stored: StoredUser[]) => {
		localStorage.setItem('users', JSON.stringify(stored));
		setUsers(stored.map(({ password: _pw, ...u }) => u));
	};

	const login = async (email: string, password: string): Promise<boolean> => {
		if (import.meta.env.VITE_API_BASE_URL) {
			try {
				const res = await api.post('/auth/login', { email, password });
				const { accessToken, refreshToken, user } = res.data;
				localStorage.setItem('access_token', accessToken);
				localStorage.setItem('refresh_token', refreshToken);
				setUser(user);
				localStorage.setItem('user', JSON.stringify(user));
				return true;
			} catch {
				return false;
			}
		}
		const storedUsers = readStoredUsers();
		const foundUser = storedUsers.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
		if (foundUser) {
			const safeUser: User = { id: foundUser.id, name: foundUser.name, email: foundUser.email, role: foundUser.role };
			setUser(safeUser);
			localStorage.setItem('user', JSON.stringify(safeUser));
			return true;
		}
		return false;
	};

	const logout = () => {
		setUser(null);
		localStorage.removeItem('user');
		localStorage.removeItem('access_token');
		localStorage.removeItem('refresh_token');
	};

	const addUser: AuthContextType['addUser'] = ({ name, email, role, password }) => {
		const storedUsers = readStoredUsers();
		if (storedUsers.some(u => u.email.toLowerCase() === email.toLowerCase())) {
			return { success: false, error: 'Email already exists' };
		}
		const newUser: StoredUser = {
			id: Date.now().toString(),
			name,
			email,
			role,
			password,
		};
		writeStoredUsers([...storedUsers, newUser]);
		return { success: true };
	};

	const updateUser: AuthContextType['updateUser'] = (id, changes) => {
		const storedUsers = readStoredUsers();
		const idx = storedUsers.findIndex(u => u.id === id);
		if (idx === -1) return { success: false, error: 'User not found' };
		const email = changes.email?.toLowerCase();
		if (email && storedUsers.some((u, i) => i !== idx && u.email.toLowerCase() === email)) {
			return { success: false, error: 'Email already exists' };
		}
		storedUsers[idx] = { ...storedUsers[idx], ...changes } as StoredUser;
		writeStoredUsers(storedUsers);
		return { success: true };
	};

	const deleteUser: AuthContextType['deleteUser'] = (id) => {
		const storedUsers = readStoredUsers();
		if (!storedUsers.some(u => u.id === id)) return { success: false, error: 'User not found' };
		const next = storedUsers.filter(u => u.id !== id);
		writeStoredUsers(next);
		// If deleting current user, logout
		if (user?.id === id) logout();
		return { success: true };
	};

	const changePassword: AuthContextType['changePassword'] = (id, newPassword) => {
		const storedUsers = readStoredUsers();
		const idx = storedUsers.findIndex(u => u.id === id);
		if (idx === -1) return { success: false, error: 'User not found' };
		storedUsers[idx] = { ...storedUsers[idx], password: newPassword };
		writeStoredUsers(storedUsers);
		return { success: true };
	};

	return (
		<AuthContext.Provider value={{ user, users, login, logout, addUser, updateUser, deleteUser, changePassword, isLoading }}>
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