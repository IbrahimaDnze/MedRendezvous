import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Box, CircularProgress, Typography } from '@mui/material';

const PrivateRouteAdmin = ({ children }) => {
  const { token, user, loading, isAuthenticated, hasRole } = useAuth();

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        background: 'linear-gradient(120deg, #a1c4fd 0%, #c2e9fb 50%, #fbc2eb 100%)'
      }}>
        <CircularProgress size={60} sx={{ color: '#2a3eb1', mb: 2 }} />
        <Typography variant="h6" sx={{ color: '#2a3eb1', fontWeight: 600 }}>
          Vérification de l'authentification...
        </Typography>
      </Box>
    );
  }

  if (!isAuthenticated || !token) {
    return <Navigate to="/" replace />;
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (!hasRole('admin')) {
    // Rediriger selon le rôle
    if (hasRole('medecin')) return <Navigate to="/dashboard-medecin" replace />;
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default PrivateRouteAdmin;
