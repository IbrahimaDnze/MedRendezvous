// Test de connexion au backend - à supprimer après test
import axios from 'axios';
import API_BASE_URL from './config/api';

export const testBackendConnection = async () => {
  try {
    console.log('🔍 Test de connexion au backend...');
    console.log('URL testée:', API_BASE_URL);
    
    // Test simple de ping au backend
    const response = await axios.get(API_BASE_URL, {
      timeout: 10000 // 10 secondes de timeout
    });
    
    console.log('✅ Backend accessible!');
    console.log('Réponse:', response.data);
    return true;
  } catch (error) {
    console.error('❌ Erreur de connexion au backend:');
    console.error('URL:', API_BASE_URL);
    console.error('Erreur:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.error('Le backend n\'est pas accessible');
    } else if (error.code === 'TIMEOUT') {
      console.error('Timeout - le backend met trop de temps à répondre');
    }
    
    return false;
  }
};