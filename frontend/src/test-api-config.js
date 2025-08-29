// Fichier de test temporaire - à supprimer après test
import API_BASE_URL from './config/api';

console.log('🔧 Configuration API actuelle:');
console.log('API_BASE_URL:', API_BASE_URL);
console.log('REACT_APP_API_URL:', process.env.REACT_APP_API_URL);
console.log('REACT_APP_SOCKET_URL:', process.env.REACT_APP_SOCKET_URL);

// Test de construction d'URL
const testUrl = `${API_BASE_URL}/api/users/login`;
console.log('URL de test construite:', testUrl);

export default API_BASE_URL;