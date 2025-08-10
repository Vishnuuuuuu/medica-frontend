import { ApolloProvider } from '@apollo/client';
import { Auth0Provider, useAuth0 } from '@auth0/auth0-react';
import { ConfigProvider } from 'antd';
import { Navigate, Route, BrowserRouter as Router, Routes, useLocation } from 'react-router-dom';
import DebugAuth from './components/DebugAuth';
import Layout from './components/Layout';
import Loading from './components/Loading';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { apolloClient } from './lib/apollo';
import Profile from './pages/auth/Profile';
import CareWorkerHome from './pages/careWorker/Home';
import CareWorkerHistory from './pages/careWorker/ShiftHistory';
import ManagerActiveStaff from './pages/manager/ActiveStaff';
import ManagerDashboard from './pages/manager/Dashboard';
import LocationManagement from './pages/manager/LocationManagement';
import ManagerShiftLogs from './pages/manager/ShiftLogs';

const theme = {
  token: {
    colorPrimary: '#1890ff',
    borderRadius: 8,
  },
};

// Simple Login Page
function LoginPage() {
  const { loginWithRedirect } = useAuth0();
  
  return (
    <div style={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <div style={{
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        borderRadius: '24px',
        padding: '60px 50px',
        boxShadow: '0 25px 50px rgba(0, 0, 0, 0.15)',
        textAlign: 'center',
        maxWidth: '480px',
        width: '90%',
        border: '1px solid rgba(255, 255, 255, 0.2)'
      }}>
        <div style={{
          width: '80px',
          height: '80px',
          background: 'linear-gradient(135deg, #667eea, #764ba2)',
          borderRadius: '20px',
          margin: '0 auto 30px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 10px 30px rgba(102, 126, 234, 0.3)'
        }}>
          <div style={{
            color: 'white',
            fontSize: '32px',
            fontWeight: 'bold'
          }}>+</div>
        </div>

        <h1 style={{
          fontSize: '42px',
          fontWeight: '700',
          background: 'linear-gradient(135deg, #667eea, #764ba2)',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          margin: '0 0 16px 0',
          letterSpacing: '-1px'
        }}>
          Medica App
        </h1>
        
        <p style={{
          fontSize: '18px',
          color: '#64748b',
          margin: '0 0 32px 0',
          fontWeight: '500'
        }}>
          Your healthcare management solution
        </p>
        
        <button 
          onClick={() => loginWithRedirect()}
          style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '16px',
            padding: '18px 40px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
            width: '100%',
            boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3)',
            transition: 'all 0.3s ease'
          }}
        >
          Login / Sign Up
        </button>

        <div style={{
          marginTop: '32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          color: '#94a3b8',
          fontSize: '13px'
        }}>
          <div style={{
            width: '16px',
            height: '16px',
            background: '#10b981',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '10px',
            fontWeight: 'bold'
          }}>✓</div>
          Secured by Auth0
        </div>
      </div>
    </div>
  );
}

function AppRoutes() {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <Loading />;
  }

  if (!user) {
    return <LoginPage />;
  }

  // Handle root path redirect based on role
  if (location.pathname === '/') {
    if (user.role === 'CAREWORKER') {
      return <Navigate to="/dashboard" replace />;
    } else {
      return <Navigate to="/manager" replace />;
    }
  }

  return (
    <Layout>
      <Routes>
        <Route path="/profile" element={<Profile />} />
        {user.role === 'CAREWORKER' ? (
          <>
            <Route path="/dashboard" element={<CareWorkerHome />} />
            <Route path="/clock-in" element={<CareWorkerHome />} />
            <Route path="/clock-out" element={<CareWorkerHome />} />
            <Route path="/history" element={<CareWorkerHistory />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </>
        ) : (
          <>
            <Route path="/manager" element={<ManagerDashboard />} />
            <Route path="/manager/staff" element={<ManagerActiveStaff />} />
            <Route path="/manager/analytics" element={<ManagerShiftLogs />} />
            <Route path="/manager/location" element={<LocationManagement />} />
            <Route path="/" element={<Navigate to="/manager" replace />} />
            <Route path="*" element={<Navigate to="/manager" replace />} />
          </>
        )}
      </Routes>
    </Layout>
  );
}

function App() {

  return (
    <Auth0Provider
      domain={import.meta.env.VITE_AUTH0_DOMAIN}
      clientId={import.meta.env.VITE_AUTH0_CLIENT_ID}
      authorizationParams={{
        redirect_uri: window.location.origin,
        audience: `https://${import.meta.env.VITE_AUTH0_DOMAIN}/api/v2/`,
        scope: 'openid profile email read:current_user',
      }}
    >
      <ApolloProvider client={apolloClient}>
        <ConfigProvider theme={theme}>
          <AuthProvider>
            <Router>
              <DebugAuth />
              <AppRoutes />
            </Router>
          </AuthProvider>
        </ConfigProvider>
      </ApolloProvider>
    </Auth0Provider>
  );
}

export default App;