import React, { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';

const SecurityGuard = ({ children }) => {
  const { isAuthenticated, loading, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Protection contre la modification manuelle de l'URL
    const protectRoutes = () => {
      const currentPath = location.pathname;
      
      // Routes protégées par rôle
      const protectedRoutes = {
        patient: ['/dashboard', '/profil', '/rendezvous', '/mes-rendezvous', '/notifications', '/messagerie'],
        medecin: ['/dashboard-medecin', '/calendrier-medecin', '/disponibilites', '/gestion-rendezvous', '/messagerie-medecin', '/notifications-medecin', '/profil-medecin', '/export-donnees'],
        admin: ['/admin', '/admin/users', '/admin/doctors', '/admin/appointments', '/admin/specialites', '/admin/mon-profil']
      };

      // Routes d'authentification
      const authRoutes = ['/login', '/register'];
      
      // Si l'utilisateur essaie d'accéder à une route protégée sans être authentifié
      if (!loading && !isAuthenticated) {
        const isProtectedRoute = Object.values(protectedRoutes).flat().some(route => 
          currentPath.startsWith(route)
        );
        
        if (isProtectedRoute) {
          console.log('🚫 Accès non autorisé - Redirection vers accueil');
          navigate('/', { replace: true });
          return;
        }
      }

      // Si l'utilisateur est authentifié, vérifier ses permissions
      if (!loading && isAuthenticated && user) {
        const userRole = user.role;
        
        // Si un patient essaie d'accéder aux routes médecin
        if (userRole === 'patient' && protectedRoutes.medecin.some(route => currentPath.startsWith(route))) {
          console.log('🚫 Patient tentant d\'accéder aux routes médecin - Redirection');
          navigate('/dashboard', { replace: true });
          return;
        }
        
        // Si un patient essaie d'accéder aux routes admin
        if (userRole === 'patient' && protectedRoutes.admin.some(route => currentPath.startsWith(route))) {
          console.log('🚫 Patient tentant d\'accéder aux routes admin - Redirection');
          navigate('/dashboard', { replace: true });
          return;
        }
        
        // Si un médecin essaie d'accéder aux routes patient
        if (userRole === 'medecin' && protectedRoutes.patient.some(route => currentPath.startsWith(route))) {
          console.log('🚫 Médecin tentant d\'accéder aux routes patient - Redirection');
          navigate('/dashboard-medecin', { replace: true });
          return;
        }
        
        // Si un médecin essaie d'accéder aux routes admin
        if (userRole === 'medecin' && protectedRoutes.admin.some(route => currentPath.startsWith(route))) {
          console.log('🚫 Médecin tentant d\'accéder aux routes admin - Redirection');
          navigate('/dashboard-medecin', { replace: true });
          return;
        }
        
        // Si un admin essaie d'accéder aux routes non-admin
        if (userRole === 'admin' && 
            !protectedRoutes.admin.some(route => currentPath.startsWith(route)) &&
            (protectedRoutes.patient.some(route => currentPath.startsWith(route)) || 
             protectedRoutes.medecin.some(route => currentPath.startsWith(route)))) {
          console.log('🚫 Admin tentant d\'accéder aux routes non-admin - Redirection');
          navigate('/admin', { replace: true });
          return;
        }
      }
    };

    protectRoutes();
  }, [location.pathname, isAuthenticated, loading, user, navigate]);

  return children;
};

export default SecurityGuard;
