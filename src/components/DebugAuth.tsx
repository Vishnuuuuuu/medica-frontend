import { useAuth0 } from '@auth0/auth0-react';
import React, { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

const DebugAuth: React.FC = () => {
  const { user: auth0User, isAuthenticated } = useAuth0();
  const { user } = useAuth();

  useEffect(() => {
    if (isAuthenticated && auth0User) {
      console.group('🔍 Auth Debug Info');
      console.log('Auth0 User:', auth0User);
      console.log('Mapped User:', user);
      console.log('Auth0 Roles:', auth0User?.['https://yourapp.com/roles'] || 'No roles found');
      console.log('Raw Auth0 User Object:', JSON.stringify(auth0User, null, 2));
      console.groupEnd();
    }
  }, [isAuthenticated, auth0User, user]);

  return null; // Don't render anything to the screen
};

export default DebugAuth;
