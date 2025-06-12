import { useSession } from 'next-auth/react';

export function useAuth() {
  const { data: session, status } = useSession();

  const isAuthenticated = status === 'authenticated' && !!session;
  const isLoading = status === 'loading';
  const accessToken = session?.user?.accessToken;
  const roles = session?.user?.roles || [];

  const hasRole = (role: string): boolean => {
    return roles.includes(role);
  };

  const hasAnyRole = (roleList: string[]): boolean => {
    return roleList.some(role => roles.includes(role));
  };

  const getAuthHeaders = (): Record<string, string> => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }

    return headers;
  };

  return {
    session,
    isAuthenticated,
    isLoading,
    accessToken,
    roles,
    hasRole,
    hasAnyRole,
    getAuthHeaders,
    user: session?.user,
  };
} 