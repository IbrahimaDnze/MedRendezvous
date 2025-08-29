import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const useSecurity = (requiredRole = null) => {
  const { isAuthenticated, hasRole, loading, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Ne rien faire pendant le chargement
    if (loading) return;

    // Log de sécurité
    console.log('🔒 useSecurity - Vérification:', {
      isAuthenticated,
      requiredRole,
      userRole: user?.role,
      loading
    });

    // Rediriger si non connecté
    if (!isAuthenticated) {
      console.log('🔒 Redirection: Utilisateur non connecté');
      navigate('/', { replace: true });
      return;
    }

    // Vérifier le rôle si requis
    if (requiredRole && !hasRole(requiredRole)) {
      console.log('🔒 Redirection: Rôle non autorisé');
      
      // Rediriger vers le bon dashboard selon le rôle
      if (hasRole('medecin')) {
        navigate('/dashboard-medecin', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
      return;
    }

    console.log('✅ Accès autorisé');
  }, [isAuthenticated, hasRole, loading, user, requiredRole, navigate]);

  return {
    isAuthenticated,
    hasRole,
    loading,
    user,
    isAuthorized: !loading && isAuthenticated && (!requiredRole || hasRole(requiredRole))
  };
}; 