# 🧪 Guide de Test - Connexion Frontend ↔ Backend

## 📋 **Étapes de test avant redéploiement :**

### 1. **Test de compilation**
```bash
cd frontend
npm start
```

### 2. **Vérifiez la console du navigateur**
Ouvrez les outils de développement (F12) et regardez la console. Vous devriez voir :
```
🚀 Application démarrée - Test de la configuration...
🔧 Configuration API actuelle:
API_BASE_URL: https://medrendez-vou.onrender.com
REACT_APP_API_URL: https://medrendez-vou.onrender.com
URL de test construite: https://medrendez-vou.onrender.com/api/users/login
🔍 Test de connexion au backend...
URL testée: https://medrendez-vou.onrender.com
✅ Backend accessible!
```

### 3. **Tests fonctionnels à effectuer :**

#### ✅ **Test 1 : Page d'accueil**
- Ouvrez `http://localhost:3000`
- Vérifiez que la page se charge sans erreur
- Regardez la console pour les messages de test

#### ✅ **Test 2 : Connexion utilisateur**
- Cliquez sur "Connexion" 
- Essayez de vous connecter avec un compte existant
- Vérifiez dans l'onglet Network que les requêtes vont vers `https://medrendez-vou.onrender.com`

#### ✅ **Test 3 : Inscription**
- Testez le formulaire d'inscription
- Vérifiez que les appels API utilisent la bonne URL

#### ✅ **Test 4 : Dashboard**
- Après connexion, vérifiez que le dashboard se charge
- Regardez les requêtes dans l'onglet Network

### 4. **Vérifications dans l'onglet Network (F12)**
Toutes les requêtes doivent aller vers :
- ✅ `https://medrendez-vou.onrender.com/api/...`
- ❌ PAS `http://localhost:5000/api/...`

### 5. **Test des WebSockets**
- Connectez-vous en tant que médecin
- Vérifiez dans l'onglet Network → WS que la connexion WebSocket va vers :
  - ✅ `wss://medrendez-vou.onrender.com`
  - ❌ PAS `ws://localhost:5000`

## 🚨 **Erreurs possibles et solutions :**

### Erreur CORS
```
Access to XMLHttpRequest at 'https://medrendez-vou.onrender.com' from origin 'http://localhost:3000' has been blocked by CORS policy
```
**Solution :** Votre backend doit autoriser `http://localhost:3000` dans sa configuration CORS.

### Erreur de connexion
```
❌ Erreur de connexion au backend: Network Error
```
**Solution :** Vérifiez que votre backend sur Render est bien démarré.

### Variables d'environnement non définies
```
API_BASE_URL: undefined
```
**Solution :** Vérifiez que le fichier `.env` est bien présent et redémarrez `npm start`.

## 🧹 **Nettoyage après test :**

Une fois les tests terminés, supprimez les fichiers temporaires :
```bash
rm src/test-api-config.js
rm src/test-backend-connection.js
```

Et retirez les imports de test dans `src/App.js`.

## ✅ **Validation finale :**

Si tous les tests passent :
1. ✅ La console affiche la bonne configuration
2. ✅ Les requêtes vont vers `https://medrendez-vou.onrender.com`
3. ✅ Pas d'erreurs CORS
4. ✅ Les fonctionnalités de base marchent

➡️ **Vous pouvez redéployer en toute sécurité !**