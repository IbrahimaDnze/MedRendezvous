import axios from 'axios';
import API_BASE_URL from '../config/api';

const API_URL = `${API_BASE_URL}/api/users`;

export const login = async (email, motDePasse) => {
  const res = await axios.post(`${API_URL}/login`, { email, motDePasse });
  return res.data;
};

export const register = async (nom, email, motDePasse, role, userData = null) => {
  let data;
  
  // Si on a un objet userData complet, l'utiliser directement
  if (userData && typeof userData === 'object' && userData.nom) {
    data = userData;
  } else {
    // Sinon, construire l'objet avec les paramètres individuels
    data = { nom, email, motDePasse, role };
  }
  
  console.log('Données envoyées à l\'API:', data);
  const res = await axios.post(`${API_URL}/register`, data);
  return res.data;
};

export const createMedecinProfile = async (medecinData, token = null) => {
  console.log('Création profil médecin:', medecinData);
  
  const config = {};
  if (token) {
    config.headers = { Authorization: `Bearer ${token}` };
  }
  
  const res = await axios.post(`${API_BASE_URL}/api/medecins/create`, medecinData, config);
  return res.data;
}; 