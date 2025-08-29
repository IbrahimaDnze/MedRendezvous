# 🔧 Corrections API - Frontend vers Backend

## ✅ **Fichiers déjà corrigés :**

### Configuration
- ✅ `src/config/api.js` - Configuration centralisée
- ✅ `.env` et `.env.production` - Variables d'environnement

### Composants
- ✅ `src/api/auth.js`
- ✅ `src/contexts/AuthContext.js`
- ✅ `src/utils/socket.js`
- ✅ `src/hooks/useNotifications.js`
- ✅ `src/components/Header.js`
- ✅ `src/components/HeaderMedecin.js`
- ✅ `src/components/NotificationProvider.js`

### Pages principales
- ✅ `src/pages/AccueilPage.js`
- ✅ `src/pages/DashboardPage.js`
- ✅ `src/pages/DashboardMedecinPage.js`
- ✅ `src/pages/DisponibilitesPage.js`
- ✅ `src/pages/CalendrierMedecinPage.js`
- ✅ `src/pages/MessageriePage.js`
- ✅ `src/pages/MedecinsParSpecialitePage.js`
- ✅ `src/pages/RendezVousPage.js`
- ✅ `src/pages/ProfilePage.js`

### Pages admin
- ✅ `src/pages/admin/DashboardAdminPage.js`
- ✅ `src/pages/admin/ProfileAdminPage.js`

## 🔄 **Fichiers restants à corriger :**

Pour corriger automatiquement tous les fichiers restants, exécutez le script :

```bash
cd frontend
node fix-api-urls.js
```

Ou corrigez manuellement ces fichiers :

### Pages restantes
- `src/pages/ValidationMedecinsPage.js`
- `src/pages/ExportDonneesPage.js`
- `src/pages/MessagerieMedecinPage.js`
- `src/pages/MesRendezVousPage.js`
- `src/pages/GestionRendezVousPage.js`
- `src/pages/RegisterPage.js`
- `src/pages/NotificationsPage.js`
- `src/pages/NotificationsMedecinPage.js`
- `src/pages/ProfilMedecinPage.js`

### Pages admin restantes
- `src/pages/admin/users/UsersAdminPage.js`
- `src/pages/admin/doctors/DoctorsAdminPage.js`
- `src/pages/admin/appointments/AppointmentsAdminPage.js`
- `src/pages/admin/specialites/SpecialitesAdminPage.js`

## 🚀 **Instructions de déploiement :**

1. **Vérifiez les variables d'environnement sur Vercel :**
   ```
   REACT_APP_API_URL=https://medrendez-vou.onrender.com
   REACT_APP_SOCKET_URL=https://medrendez-vou.onrender.com
   ```

2. **Redéployez votre frontend** avec ces modifications

3. **Testez la connexion** entre frontend et backend

## 🔍 **Pour chaque fichier restant, remplacez :**

```javascript
// AVANT
import axios from 'axios';

// APRÈS  
import axios from 'axios';
import API_BASE_URL from '../config/api'; // ou '../../config/api' selon le niveau

// ET remplacez toutes les occurrences :
'http://localhost:5000' → `${API_BASE_URL}`
```

## ✨ **Résultat attendu :**

Votre frontend communiquera maintenant avec :
- **Backend :** `https://medrendez-vou.onrender.com`
- **WebSocket :** `https://medrendez-vou.onrender.com`

Au lieu de `localhost:5000` !