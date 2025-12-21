

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Role, Sector } from '../types';
import * as apiService from '../services/apiService';


interface AuthState {
    currentUser: User | null;
    users: User[];
    login: (matricula: string) => Promise<boolean>;
    logout: () => void;
    addUser: (user: Omit<User, 'id'>) => void;
    updateUser: (user: User) => void;
    deleteUser: (userId: string) => void;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [users, setUsers] = useState<User[]>([]);

    useEffect(() => {
        const initializeAuth = async () => {
            const user = await apiService.getCurrentUser();
            if (user) {
                setCurrentUser(user);
            }
            const allUsers = await apiService.getUsers();
            setUsers(allUsers);
        };
        initializeAuth();
    }, []);

    const login = async (matricula: string): Promise<boolean> => {
        const user = await apiService.loginUser(matricula);
        if (user) {
            setCurrentUser(user);
            // Trigger storage event for other tabs to show notification
            localStorage.setItem('ecolog-lastLogin', JSON.stringify({ user: user.name, timestamp: Date.now() }));
            return true;
        }
        return false;
    };

    const logout = async () => {
        await apiService.logoutUser();
        setCurrentUser(null);
        window.location.reload();
    };
    
    const triggerUserActionEvent = (type: string, user: string, actor: string) => {
        localStorage.setItem('ecolog-userAction', JSON.stringify({ type, user, actor, timestamp: Date.now() }));
    };

    const addUser = async (userData: Omit<User, 'id'>) => {
        const updatedUsers = await apiService.addUser(userData);
        setUsers(updatedUsers);
        triggerUserActionEvent('criou', userData.name, currentUser!.name);
    };

    const updateUser = async (updatedUser: User) => {
        const updatedUsers = await apiService.updateUser(updatedUser);
        setUsers(updatedUsers);
        triggerUserActionEvent('atualizou', updatedUser.name, currentUser!.name);
    };

    const deleteUser = async (userId: string) => {
        const userToDelete = users.find(u => u.id === userId);
        const updatedUsers = await apiService.deleteUser(userId);
        setUsers(updatedUsers);
        if(userToDelete) {
            triggerUserActionEvent('excluiu', userToDelete.name, currentUser!.name);
        }
    };

    const value = { currentUser, users, login, logout, addUser, updateUser, deleteUser };

    return React.createElement(AuthContext.Provider, { value }, children);
};

export const useAuth = (): AuthState => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};