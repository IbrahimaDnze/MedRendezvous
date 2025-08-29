import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Box, CircularProgress, Typography } from '@mui/material';

const PrivateRoute = ({ children }) => {
  const { token, user, loading, isAuthenticated, hasRole } = useAuth();
  
  // Afficher un loader pendant la vérification
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

  // Rediriger vers la page d'accueil si pas connecté
  if (!isAuthenticated || !token) {
    console.log('🔒 Accès refusé: Utilisateur non connecté');
    return <Navigate to="/" replace />;
  }

  // Vérifier que l'utilisateur existe
  if (!user) {
    console.log('🔒 Accès refusé: Données utilisateur manquantes');
    return <Navigate to="/" replace />;
  }

  // Si l'utilisateur est un médecin, rediriger vers le dashboard médecin
  if (hasRole('medecin')) {
    console.log('🔄 Redirection médecin vers dashboard médecin');
    return <Navigate to="/dashboard-medecin" replace />;
  }

  // Vérifier que l'utilisateur est bien un patient
  if (!hasRole('patient')) {
    console.log('🔒 Accès refusé: Rôle non autorisé pour cette page');
    return <Navigate to="/" replace />;
  }

  console.log('✅ Accès autorisé pour patient');
  return children;
};

export default PrivateRoute; 