import { Box } from '@mui/material';
import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';

// Components
import LoadingScreen from './components/common/LoadingScreen';
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Pages
import ActivationKeys from './pages/ActivationKeys';
import ActivityLogs from './pages/ActivityLogs';
import Analytics from './pages/Analytics';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Settings from './pages/Settings';
import SyncManagement from './pages/SyncManagement';
import Users from './pages/Users';

function AppContent() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();

  // Loading screen
  if (isLoading) {
    return <LoadingScreen />;
  }

  // Login screen - show Login component for /login route or when not authenticated
  if (!isAuthenticated || location.pathname === '/login') {
    return <Login />;
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <Sidebar open={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      
      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          transition: 'margin-left 0.3s ease',
          marginLeft: sidebarOpen ? '280px' : '80px',
          minHeight: '100vh',
          backgroundColor: '#f8fafc',
        }}
      >
        {/* Header */}
        <Header 
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
          user={user}
        />
        
        {/* Page Content */}
        <Box sx={{ p: 3 }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/login" element={<Login />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/users" element={<Users />} />
                <Route path="/activation-keys" element={<ActivationKeys />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/sync" element={<SyncManagement />} />
                <Route path="/activity" element={<ActivityLogs />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </motion.div>
          </AnimatePresence>
        </Box>
      </Box>
    </Box>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
