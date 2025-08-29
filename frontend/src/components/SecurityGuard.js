import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Box, Typography, Button } from '@mui/material';
import SecurityIcon from '@mui/icons-material/Security';

const SecurityGuard = ({ children, requiredRole = null }) => {
  const { isAuthenticated, hasRole, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Log des tentatives d'accès pour audit
    console.log('🔒 SecurityGuard - Vérification accès:', {
      isAuthenticated,
      requiredRole,
      loading
    });
  }, [isAuthenticated, requiredRole, loading]);

  // Afficher un message d'erreur si accès non autorisé
  if (!loading && !isAuthenticated) {
    return (
      <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(120deg, #a1c4fd 0%, #c2e9fb 50%, #fbc2eb 100%)',
        p: 4
      }}>
        <SecurityIcon sx={{ fontSize: 80, color: '#d32f2f', mb: 2 }} />
        <Typography variant="h4" sx={{ color: '#d32f2f', mb: 2, fontWeight: 700 }}>
          Accès Refusé
        </Typography>
        <Typography variant="h6" sx={{ color: '#666', mb: 3, textAlign: 'center' }}>
          Vous devez être connecté pour accéder à cette page.
        </Typography>
        <Button 
          variant="contained" 
          onClick={() => navigate('/')}
          sx={{ 
            bgcolor: '#2a3eb1',
            '&:hover': { bgcolor: '#1a2b91' }
          }}
        >
          Retour à l'accueil
        </Button>
      </Box>
    );
  }

  // Vérifier le rôle si requis
  if (!loading && requiredRole && !hasRole(requiredRole)) {
    return (
      <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(120deg, #a1c4fd 0%, #c2e9fb 50%, #fbc2eb 100%)',
        p: 4
      }}>
        <SecurityIcon sx={{ fontSize: 80, color: '#f57c00', mb: 2 }} />
        <Typography variant="h4" sx={{ color: '#f57c00', mb: 2, fontWeight: 700 }}>
          Permissions Insuffisantes
        </Typography>
        <Typography variant="h6" sx={{ color: '#666', mb: 3, textAlign: 'center' }}>
          Vous n'avez pas les permissions nécessaires pour accéder à cette page.
        </Typography>
        <Button 
          variant="contained" 
          onClick={() => navigate('/dashboard')}
          sx={{ 
            bgcolor: '#2a3eb1',
            '&:hover': { bgcolor: '#1a2b91' }
          }}
        >
          Retour au dashboard
        </Button>
      </Box>
    );
  }

  return children;
};

export default SecurityGuard; 