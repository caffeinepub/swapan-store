import { useState, useEffect } from 'react';

const AUTH_KEY = 'admin_authenticated';

export function useAdminAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    // Check sessionStorage on initialization
    return sessionStorage.getItem(AUTH_KEY) === 'true';
  });

  useEffect(() => {
    // Sync state with sessionStorage
    if (isAuthenticated) {
      sessionStorage.setItem(AUTH_KEY, 'true');
    } else {
      sessionStorage.removeItem(AUTH_KEY);
    }
  }, [isAuthenticated]);

  const login = () => {
    setIsAuthenticated(true);
  };

  const logout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem(AUTH_KEY);
  };

  return {
    isAuthenticated,
    login,
    logout,
  };
}
