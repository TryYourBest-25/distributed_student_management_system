'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useSession } from 'next-auth/react';
import { UserRole } from '@/types/auth';

interface User {
  id: string;
  username: string;
  role: UserRole;
  faculty_code?: string;
  faculty_name?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  selectedFacultyForPgv?: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();

  const user: User | null = React.useMemo(() => {
    if (!session?.user) return null;

    // Determine role from session roles
    const roles = session.user.roles || [];
    let role: UserRole;
    
    if (roles.includes('PGV')) {
      role = UserRole.PGV;
    } else if (roles.includes('KHOA')) {
      role = UserRole.KHOA;
    } else if (roles.includes('GV')) {
      role = UserRole.GV;
    } else if (roles.includes('SV')) {
      role = UserRole.SV;
    } else {
      // Default fallback
      role = UserRole.SV;
    }

    return {
      id: session.user.id || '',
      username: session.user.name || session.user.email || '',
      role,
      faculty_code: 'it-faculty', // Hardcoded for now as per current implementation
      faculty_name: 'Khoa Công nghệ thông tin',
    };
  }, [session]);

  const contextValue: AuthContextType = {
    user,
    isLoading: status === 'loading',
    selectedFacultyForPgv: null,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 