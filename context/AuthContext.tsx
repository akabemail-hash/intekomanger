import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { User, Role } from '../types';
import { DEFAULT_ROLES } from '../constants';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  login: (voen: string, username: string, password?: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  users: User[];
  addUser: (newUser: User) => Promise<void>;
  updateUser: (id: string, updates: Partial<User>) => Promise<void>;
  roles: Role[];
  addRole: (newRole: Role) => void;
  updateRole: (updatedRole: Role) => void;
  getPermissionsForUser: (user: User) => string[];
  refreshUsers: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children?: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>(DEFAULT_ROLES);
  const [isLoading, setIsLoading] = useState(false);

  // Load users for the current tenant when authenticated
  const refreshUsers = async () => {
    if (user && user.tenant_id) {
        try {
            const tenantUsers = await api.users.list(user.tenant_id);
            setUsers(tenantUsers);
        } catch (e) {
            console.error("Failed to load users", e);
        }
    }
  };

  useEffect(() => {
    if (user) {
        refreshUsers();
    }
  }, [user]);

  const getPermissionsForUser = (u: User): string[] => {
    if (u.role === 'SuperAdmin') return ['super_admin', 'dashboard', 'admin_users', 'admin_roles'];
    const role = roles.find(r => r.name === u.role);
    return role ? role.permissions : [];
  };

  const login = async (voen: string, username: string, password?: string): Promise<{ success: boolean; message?: string }> => {
    setIsLoading(true);
    try {
        const loggedUser = await api.auth.login(voen, username, password);
        if (loggedUser) {
            setUser(loggedUser);
            setIsLoading(false);
            return { success: true };
        }
    } catch (e: any) {
        console.error("Login failed", e);
        setIsLoading(false);
        return { success: false, message: e.message };
    }
    setIsLoading(false);
    return { success: false };
  };

  const logout = () => {
    setUser(null);
    setUsers([]);
  };

  const addUser = async (newUser: User) => {
    if (!user?.tenant_id) return;
    try {
        await api.users.create({ ...newUser, tenant_id: user.tenant_id, voen: user.voen });
        await refreshUsers();
    } catch (e: any) {
        throw new Error(e.message || "Failed to create user");
    }
  };

  const updateUser = async (id: string, updates: Partial<User>) => {
      try {
          await api.users.update(id, updates);
          await refreshUsers();
      } catch (e: any) {
          throw new Error(e.message);
      }
  }

  const addRole = (newRole: Role) => {
    setRoles([...roles, newRole]);
  };

  const updateRole = (updatedRole: Role) => {
    setRoles(roles.map(r => r.name === updatedRole.name ? updatedRole : r));
  };

  return (
    <AuthContext.Provider value={{ 
        user, login, logout, users, addUser, updateUser, 
        roles, addRole, updateRole, getPermissionsForUser, 
        refreshUsers, isLoading 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};