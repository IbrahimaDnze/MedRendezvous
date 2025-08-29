import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import API_BASE_URL from '../config/api';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { useSnackbar } from '../components/GlobalSnackbar';
import Avatar from '@mui/material/Avatar';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import IconButton from '@mui/material/IconButton';
import CircularProgress from '@mui/material/CircularProgress';

const illustration = (
  <img src="https://storyset.com/illustration/profile/bro" alt="Profil médical" style={{ width: '100%', maxWidth: 350 }} />
);

const ProfilePage = () => {
  const { token, user, setUser, logout } = useAuth();
  const [form, setForm] = useState({ nom: '', email: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { showSnackbar } = useSnackbar();
  const [avatarPreview, setAvatarPreview] = useState(null);

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/users/profil', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const userData = response.data.user;
      console.log('=== DÉBOGAGE PROFIL PATIENT ===');
      console.log('UserData complet:', userData);
      console.log('Avatar reçu:', userData.avatar);
      console.log('Type d\'avatar:', typeof userData.avatar);
      console.log('Avatar commence par data:', userData.avatar?.startsWith('data:'));
      
      setForm({ nom: userData.nom, email: userData.email });
      setAvatarPreview(userData.avatar);
      setLoading(false);
    } catch (error) {
      console.error('Erreur lors du chargement du profil:', error);
      showSnackbar('Erreur lors du chargement du profil', 'error');
      logout();
    }
  }, [token, showSnackbar, logout]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Gestion de l'upload d'image de profil
  const handleAvatarChange = (e) => {
      const file = e.target.files[0];
      if (file && (file.type === 'image/jpeg' || file.type === 'image/png')) {
        // Vérifier la taille du fichier (max 20MB)
        if (file.size > 20 * 1024 * 1024) {
          showSnackbar('L\'image est trop volumineuse. Taille maximum : 20MB', 'error');
          return;
        }
      
        const reader = new FileReader();
        reader.onloadend = () => {
          // Compresser l'image si elle est trop grande
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            // Redimensionner si l'image est trop grande
            let width = img.width;
            let height = img.height;
            const maxSize = 300;
            
            if (width > maxSize || height > maxSize) {
              if (width > height) {
                height = (height * maxSize) / width;
                width = maxSize;
              } else {
                width = (width * maxSize) / height;
                height = maxSize;
              }
            }
            
            canvas.width = width;
            canvas.height = height;
            ctx.drawImage(img, 0, 0, width, height);
            
            // Convertir en base64 avec qualité réduite
            const compressedAvatar = canvas.toDataURL('image/jpeg', 0.7);
            setAvatarPreview(compressedAvatar);
          };
          img.src = reader.result;
        };
        reader.readAsDataURL(file);
      } else {
        showSnackbar('Veuillez sélectionner une image JPEG ou PNG', 'error');
      }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const response = await axios.put('http://localhost:5000/api/users/profil', {
        nom: form.nom,
        email: form.email,
        avatar: avatarPreview
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Mettre à jour le contexte utilisateur
      setUser(response.data.user);
      showSnackbar('Profil mis à jour avec succès !', 'success');
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      showSnackbar('Erreur lors de la mise à jour: ' + (error.response?.data?.message || error.message), 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: 'linear-gradient(120deg, #a1c4fd 0%, #c2e9fb 50%, #fbc2eb 100%)'
      }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box sx={{
      minHeight: '100vh',
      background: 'linear-gradient(120deg, #a1c4fd 0%, #c2e9fb 50%, #fbc2eb 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      py: 6,
      px: 2,
    }}>
      <Box sx={{
        width: '100%',
        maxWidth: 420,
        mx: 'auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        borderRadius: 7,
        boxShadow: '0 8px 32px 0 rgba(25,118,210,0.10)',
        p: { xs: 2, md: 5 },
        minWidth: 320,
        border: '1.5px solid #b3d1fa',
        bgcolor: 'rgba(255,255,255,0.96)',
      }}>
        <AccountCircleIcon color="primary" sx={{ fontSize: 44, mb: 1 }} />
        <Typography component="h1" variant="h4" sx={{ mb: 2, fontWeight: 900, color: 'primary.main', letterSpacing: 1 }}>
          Mon profil
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
          <Avatar 
            src={avatarPreview} 
            sx={{ width: 90, height: 90, mb: 1, bgcolor: 'primary.light', fontSize: 38 }}
            onError={(e) => {
              console.log('Erreur de chargement de l\'avatar:', e);
              console.log('AvatarPreview:', avatarPreview);
            }}
            onLoad={() => {
              console.log('Avatar chargé avec succès');
            }}
          >
            {!avatarPreview && user?.nom?.charAt(0).toUpperCase()}
          </Avatar>
          <input
            accept="image/jpeg,image/png"
            style={{ display: 'none' }}
            id="avatar-upload"
            type="file"
            onChange={handleAvatarChange}
          />
          <label htmlFor="avatar-upload">
            <IconButton color="primary" component="span">
              <PhotoCamera />
            </IconButton>
          </label>
          <Typography variant="caption" sx={{ color: 'text.secondary', mt: 0.5 }}>
            JPG ou PNG, max 5Mo
          </Typography>
        </Box>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
          <TextField
            margin="normal"
            fullWidth
            label="Nom"
            name="nom"
            value={form.nom}
            onChange={handleChange}
            required
          />
          <TextField
            margin="normal"
            fullWidth
            label="Email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
          />
          <TextField
            margin="normal"
            fullWidth
            label="Rôle"
            value={user?.role || ''}
            disabled
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={saving}
            sx={{ mt: 3, mb: 2, borderRadius: 99, fontWeight: 700, fontSize: 18 }}
          >
            {saving ? 'Mise à jour...' : 'Mettre à jour'}
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default ProfilePage;