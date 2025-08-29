const fs = require('fs');
const path = require('path');

// Fonction pour remplacer les URLs dans un fichier
function replaceUrlsInFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Vérifier si le fichier contient déjà l'import API_BASE_URL
    const hasApiImport = content.includes("import API_BASE_URL from '../config/api'") || 
                        content.includes('import API_BASE_URL from \'../config/api\'');
    
    // Vérifier si le fichier contient localhost:5000
    if (!content.includes('http://localhost:5000')) {
      return false; // Pas de changement nécessaire
    }
    
    // Ajouter l'import si nécessaire
    if (!hasApiImport && content.includes("import axios from 'axios'")) {
      content = content.replace(
        "import axios from 'axios';",
        "import axios from 'axios';\nimport API_BASE_URL from '../config/api';"
      );
    }
    
    // Remplacer toutes les occurrences de localhost:5000
    content = content.replace(/http:\/\/localhost:5000/g, '${API_BASE_URL}');
    
    // Corriger les template literals
    content = content.replace(/`\$\{API_BASE_URL\}/g, '`${API_BASE_URL}');
    content = content.replace(/'\$\{API_BASE_URL\}/g, '`${API_BASE_URL}');
    content = content.replace(/"\$\{API_BASE_URL\}/g, '`${API_BASE_URL}');
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Corrigé: ${filePath}`);
    return true;
  } catch (error) {
    console.error(`❌ Erreur avec ${filePath}:`, error.message);
    return false;
  }
}

// Fonction pour parcourir récursivement les dossiers
function processDirectory(dirPath) {
  const items = fs.readdirSync(dirPath);
  let changedFiles = 0;
  
  for (const item of items) {
    const fullPath = path.join(dirPath, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      changedFiles += processDirectory(fullPath);
    } else if (item.endsWith('.js') || item.endsWith('.jsx')) {
      if (replaceUrlsInFile(fullPath)) {
        changedFiles++;
      }
    }
  }
  
  return changedFiles;
}

// Exécuter le script
console.log('🔧 Correction des URLs API en cours...');
const srcPath = path.join(__dirname, 'src');
const totalChanged = processDirectory(srcPath);
console.log(`\n✨ Terminé! ${totalChanged} fichiers corrigés.`);