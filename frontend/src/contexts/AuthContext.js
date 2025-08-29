import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from '../config/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Vérifier automatiquement le token au démarrage
  useEffect(() => {
    const verifyToken = async () => {
      const storedToken = localStorage.getItem('token');
      
      if (!storedToken) {
        setLoading(false);
        setIsAuthenticated(false);
        return;
      }

      try {
        // Vérifier le token avec le serveur
        const response = await axios.get(`${API_BASE_URL}/api/users/verify-token`, {
          headers: { Authorization: `Bearer ${storedToken}` }
        });

        if (response.data.valid) {
          setToken(storedToken);
          setUser(response.data.user);
          setIsAuthenticated(true);
        } else {
          // Token invalide ou expiré
          logout();
        }
      } catch (error) {
        console.error('Erreur de vérification du token:', error);
        logout();
      } finally {
        setLoading(false);
      }
    };

    verifyToken();
  }, []);

  const login = async (newToken, userData) => {
    try {
      setToken(newToken);
      setUser(userData);
      setIsAuthenticated(true);
      localStorage.setItem('token', newToken);
    } catch (error) {
      console.error('Erreur lors de la connexion:', error);
      logout();
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('token');
  };

  // Vérifier si l'utilisateur a un rôle spécifique
  const hasRole = (role) => {
    return user && user.role === role;
  };

  // Vérifier si l'utilisateur est connecté
  const isLoggedIn = () => {
    return isAuthenticated && !!token;
  };

  return (
    <AuthContext.Provider value={{ 
      token, 
      user, 
      setUser, 
      login, 
      logout, 
      loading,
      isAuthenticated,
      hasRole,
      isLoggedIn
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext); 