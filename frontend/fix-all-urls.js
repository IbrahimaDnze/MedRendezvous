const fs = require('fs');
const path = require('path');

// Liste des fichiers à corriger (basée sur ripgrep)
const filesToFix = [
  'src/pages/DashboardMedecinPage.js',
  'src/components/Header.js',
  'src/pages/CalendrierMedecinPage.js',
  'src/pages/DashboardPage.js',
  'src/pages/admin/DashboardAdminPage.js',
  'src/pages/GestionRendezVousPage.js',
  'src/pages/MesRendezVousPage.js',
  'src/pages/ExportDonneesPage.js',
  'src/pages/MedecinsParSpecialitePage.js',
  'src/pages/admin/appointments/AppointmentsAdminPage.js',
  'src/pages/admin/users/UsersAdminPage.js',
  'src/pages/admin/ProfileAdminPage.js',
  'src/pages/DisponibilitesPage.js',
  'src/pages/NotificationsPage.js',
  'src/pages/NotificationsMedecinPage.js',
  'src/pages/ValidationMedecinsPage.js',
  'src/pages/ProfilMedecinPage.js',
  'src/pages/MessagerieMedecinPage.js',
  'src/pages/admin/doctors/DoctorsAdminPage.js',
  'src/pages/MessageriePage.js',
  'src/pages/admin/specialites/SpecialitesAdminPage.js',
  'src/pages/RegisterPage.js',
  'src/pages/ProfilePage.js',
  'src/pages/RendezVousPage.js'
];

function fixFile(filePath) {
  const fullPath = path.join(__dirname, filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  Fichier non trouvé: ${filePath}`);
    return false;
  }

  try {
    let content = fs.readFileSync(fullPath, 'utf8');
    
    // Vérifier si le fichier contient localhost:5000
    if (!content.includes('http://localhost:5000')) {
      console.log(`✅ Déjà corrigé: ${filePath}`);
      return false;
    }
    
    // Déterminer le bon chemin d'import selon la profondeur
    const depth = filePath.split('/').length - 2; // -2 pour src/ et le fichier lui-même
    const importPath = '../'.repeat(depth) + 'config/api';
    
    // Vérifier si l'import existe déjà
    const hasApiImport = content.includes(`import API_BASE_URL from '${importPath}'`) || 
                        content.includes(`import API_BASE_URL from "${importPath}"`);
    
    // Ajouter l'import si nécessaire
    if (!hasApiImport) {
      // Chercher la dernière ligne d'import
      const lines = content.split('\n');
      let lastImportIndex = -1;
      
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].trim().startsWith('import ')) {
          lastImportIndex = i;
        }
      }
      
      if (lastImportIndex !== -1) {
        lines.splice(lastImportIndex + 1, 0, `import API_BASE_URL from '${importPath}';`);
        content = lines.join('\n');
      }
    }
    
    // Remplacer toutes les occurrences
    const originalContent = content;
    content = content.replace(/http:\/\/localhost:5000/g, '${API_BASE_URL}');
    
    // Corriger les guillemets pour les template literals
    content = content.replace(/'\$\{API_BASE_URL\}/g, '`${API_BASE_URL}');
    content = content.replace(/"\$\{API_BASE_URL\}/g, '`${API_BASE_URL}');
    
    // Corriger les fins de chaînes
    content = content.replace(/\$\{API_BASE_URL\}'/g, '${API_BASE_URL}`');
    content = content.replace(/\$\{API_BASE_URL\}"/g, '${API_BASE_URL}`');
    
    if (content !== originalContent) {
      fs.writeFileSync(fullPath, content, 'utf8');
      console.log(`✅ Corrigé: ${filePath}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ Erreur avec ${filePath}:`, error.message);
    return false;
  }
}

// Exécuter les corrections
console.log('🔧 Correction automatique de tous les fichiers...\n');

let fixedCount = 0;
for (const file of filesToFix) {
  if (fixFile(file)) {
    fixedCount++;
  }
}

console.log(`\n✨ Terminé! ${fixedCount} fichiers corrigés sur ${filesToFix.length}.`);
console.log('\n🚀 Votre projet est maintenant prêt pour le redéploiement!');