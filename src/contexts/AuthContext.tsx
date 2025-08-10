import { useAuth0 } from '@auth0/auth0-react';
import React, { createContext, useContext, useEffect, useState } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'CAREWORKER' | 'MANAGER';
  picture?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const {
    user: auth0User,
    isAuthenticated,
    isLoading: auth0Loading,
    loginWithRedirect,
    logout: auth0Logout,
  } = useAuth0();

  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!auth0Loading) {
      if (isAuthenticated && auth0User) {
        // Extract roles from Auth0 user metadata
        const auth0Roles = auth0User['https://yourapp.com/roles'] || auth0User.roles || [];
        
        // Map Auth0 roles to our application roles
        let userRole: 'CAREWORKER' | 'MANAGER' = 'CAREWORKER'; // Default
        if (auth0Roles.includes('manager')) {
          userRole = 'MANAGER';
        } else if (auth0Roles.includes('caretaker')) {
          userRole = 'CAREWORKER';
        }

        const mappedUser: User = {
          id: auth0User.sub || '',
          email: auth0User.email || '',
          name: auth0User.name || auth0User.nickname || '',
          role: userRole,
          picture: auth0User.picture,
        };
        setUser(mappedUser);
      } else {
        setUser(null);
      }
      setIsLoading(false);
    }
  }, [isAuthenticated, auth0User, auth0Loading]);

  const login = () => {
    loginWithRedirect();
  };

  const logout = () => {
    auth0Logout({ 
      logoutParams: { 
        returnTo: window.location.origin 
      } 
    });
  };

  const value: AuthContextType = {
    user,
    isLoading,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};