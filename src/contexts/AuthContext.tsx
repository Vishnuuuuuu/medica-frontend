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

  // Function to sync user with backend
  const syncUserWithBackend = async (auth0User: any, userRole: 'CAREWORKER' | 'MANAGER') => {
    try {
      const userData = {
        auth0Id: auth0User.sub,
        name: auth0User.name || auth0User.nickname || auth0User.given_name || 'User',
        email: auth0User.email || '',
        role: userRole
      };

      console.log('Syncing user with backend:', userData);

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/users/sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (response.ok) {
        const syncedUser = await response.json();
        console.log('User synced successfully:', syncedUser);
        return syncedUser;
      } else {
        console.error('Failed to sync user with backend');
        return null;
      }
    } catch (error) {
      console.error('Error syncing user:', error);
      return null;
    }
  };

  useEffect(() => {
    const setupUser = async () => {
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
          
          // Check if user is admin based on email
          if (auth0User.email === 'itsvishnups@admin.com' || 
              auth0User.email === 'manager@example.com') {
            userRole = 'MANAGER';
          }

          const mappedUser: User = {
            id: auth0User.sub || '',
            email: auth0User.email || '',
            name: auth0User.name || auth0User.nickname || '',
            role: userRole,
            picture: auth0User.picture,
          };

          // Only sync user with backend once per session to avoid redundant calls
          const syncKey = `user-synced-${auth0User.sub}`;
          const hasBeenSynced = sessionStorage.getItem(syncKey);
          
          if (!hasBeenSynced) {
            console.log('🔄 Syncing user with backend (first time this session)');
            await syncUserWithBackend(auth0User, userRole);
            sessionStorage.setItem(syncKey, 'true');
          } else {
            console.log('✅ User already synced this session, skipping sync');
          }
          
          setUser(mappedUser);
        } else {
          setUser(null);
        }
        setIsLoading(false);
      }
    };

    setupUser();
  }, [isAuthenticated, auth0User, auth0Loading]);

  const login = () => {
    loginWithRedirect();
  };

  const logout = () => {
    // Clear session storage to reset sync tracking
    sessionStorage.clear();
    
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