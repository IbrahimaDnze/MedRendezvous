import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import API_BASE_URL from '../config/api';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import CircularProgress from '@mui/material/CircularProgress';
import { useSnackbar } from '../components/GlobalSnackbar';
import Avatar from '@mui/material/Avatar';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import IconButton from '@mui/material/IconButton';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import WorkIcon from '@mui/icons-material/Work';
import Divider from '@mui/material/Divider';
import Chip from '@mui/material/Chip';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';

const specialites = [
  'Cardiologie', 'Dermatologie', 'Endocrinologie', 'Gastro-entérologie',
  'Gynécologie', 'Neurologie', 'Ophtalmologie', 'Orthopédie',
  'Oto-rhino-laryngologie', 'Pédiatrie', 'Psychiatrie', 'Pneumologie',
  'Rhumatologie', 'Urologie', 'Chirurgie générale', 'Chirurgie orthopédique'
];

const ProfilMedecinPage = () => {
  const { token, user, setUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [form, setForm] = useState({
    nom: '',
    email: '',
    specialite: '',
    numeroRPPS: '',
    adresse: '',
    telephone: '',
    hopital: '',
    formation: '',
    experience: '',
    langues: []
  });
  const [avatarPreview, setAvatarPreview] = useState(null);
  const { showSnackbar } = useSnackbar();

  const fetchProfil = useCallback(async () => {
    try {
      setLoading(true);
      
      // Appel API réel pour récupérer le profil médecin complet
      const response = await axios.get(`${API_BASE_URL}/api/medecins/profil`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const userData = response.data.user;
      
      setForm({
        nom: userData.nom,
        email: userData.email,
        specialite: userData.specialite,
        numeroRPPS: userData.numeroRPPS,
        adresse: userData.adresse,
        telephone: userData.telephone,
        hopital: userData.hopital,
        formation: userData.formation,
        experience: userData.experience,
        langues: userData.langues || ['Français']
      });
      setAvatarPreview(userData.avatar);
      setLoading(false);
    } catch (error) {
      console.error('Erreur lors du chargement du profil:', error);
      showSnackbar('Erreur lors du chargement du profil', 'error');
      setLoading(false);
    }
  }, [token, showSnackbar]);

  useEffect(() => {
    fetchProfil();
  }, [fetchProfil]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      
      console.log('=== ENVOI MISE À JOUR PROFIL ===');
      console.log('Avatar preview:', avatarPreview ? 'Présent' : 'Absent');
      
      // Préparer les données
      const updateData = {
        nom: form.nom,
        email: form.email,
        specialite: form.specialite,
        numeroRPPS: form.numeroRPPS,
        adresse: form.adresse,
        telephone: form.telephone,
        hopital: form.hopital,
        formation: form.formation,
        experience: form.experience,
        langues: form.langues
      };
      
      // Ajouter l'avatar seulement s'il a changé
      if (avatarPreview !== null) {
        updateData.avatar = avatarPreview;
        console.log('Avatar inclus dans la mise à jour');
      }
      
      console.log('Données à envoyer:', updateData);
      
      // Appel API réel pour mettre à jour le profil médecin
      const response = await axios.put(`${API_BASE_URL}/api/medecins/profil`, updateData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('Réponse API:', response.data);
      
      // Mettre à jour l'utilisateur dans le contexte
      const updatedUser = response.data.user;
      setUser(updatedUser);
      
      // Recharger le profil pour s'assurer que tout est à jour
      await fetchProfil();
      
      showSnackbar('Profil mis à jour avec succès', 'success');
      setEditing(false);
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      console.error('Détails de l\'erreur:', error.response?.data);
      showSnackbar('Erreur lors de la mise à jour: ' + (error.response?.data?.message || error.message), 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditing(false);
    fetchProfil(); // Recharger les données originales
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  if (loading) {
    return (
      <Box sx={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress color="primary" />
      </Box>
    );
  }

  return (
    <Box sx={{
      minHeight: '100vh',
      px: { xs: 2, md: 8 },
      py: 6,
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      position: 'relative',
      overflowX: 'hidden',
    }}>
      {/* En-tête */}
      <Box sx={{ mb: 6, textAlign: 'center' }}>
        <Typography variant="h3" sx={{ 
          fontWeight: 900, 
          color: 'white', 
          fontSize: { xs: 28, md: 42 }, 
          letterSpacing: 2,
          textShadow: '0 4px 16px rgba(0,0,0,0.3)',
          mb: 2
        }}>
          Profil Médecin
        </Typography>
        <Typography variant="h6" sx={{ 
          color: 'rgba(255,255,255,0.9)', 
          fontWeight: 500,
          letterSpacing: 1
        }}>
          Gérez vos informations professionnelles
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {/* Informations principales */}
        <Grid item xs={12} md={4}>
          <Card sx={{
            borderRadius: 4,
            bgcolor: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
            height: 'fit-content'
          }}>
            <CardContent sx={{ textAlign: 'center', py: 4 }}>
              <Box sx={{ position: 'relative', display: 'inline-block', mb: 3 }}>
                <Avatar
                  src={avatarPreview}
                  sx={{ 
                    width: 120, 
                    height: 120, 
                    bgcolor: 'primary.main',
                    fontSize: 48,
                    border: '4px solid white',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.2)'
                  }}
                >
                  {user?.nom?.charAt(0) || 'M'}
                </Avatar>
                {editing && (
                  <IconButton
                    component="label"
                    sx={{
                      position: 'absolute',
                      bottom: 0,
                      right: 0,
                      bgcolor: 'primary.main',
                      color: 'white',
                      '&:hover': { bgcolor: 'primary.dark' }
                    }}
                  >
                    <input
                      hidden
                      accept="image/*"
                      type="file"
                      onChange={handleAvatarChange}
                    />
                    <PhotoCamera />
                  </IconButton>
                )}
              </Box>

              <Typography variant="h5" sx={{ fontWeight: 700, mb: 1, color: 'primary.main' }}>
                Dr. {form.nom}
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                {form.specialite}
              </Typography>

              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mb: 3 }}>
                <Chip
                  icon={<WorkIcon />}
                  label="Médecin"
                  color="primary"
                  variant="outlined"
                />
                {form.numeroRPPS && (
                  <Chip
                    icon={<WorkIcon />}
                    label={`RPPS: ${form.numeroRPPS}`}
                    color="secondary"
                    variant="outlined"
                  />
                )}
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {!editing ? (
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<EditIcon />}
                    onClick={() => setEditing(true)}
                    fullWidth
                    sx={{ borderRadius: 3, py: 1.5, fontWeight: 600 }}
                  >
                    Modifier le profil
                  </Button>
                ) : (
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                      variant="contained"
                      color="success"
                      startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
                      onClick={handleSubmit}
                      disabled={saving}
                      sx={{ borderRadius: 3, py: 1.5, fontWeight: 600, flex: 1 }}
                    >
                      {saving ? 'Sauvegarde...' : 'Sauvegarder'}
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      startIcon={<CancelIcon />}
                      onClick={handleCancel}
                      sx={{ borderRadius: 3, py: 1.5, fontWeight: 600 }}
                    >
                      Annuler
                    </Button>
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Détails du profil */}
        <Grid item xs={12} md={8}>
          <Card sx={{
            borderRadius: 4,
            bgcolor: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
            minHeight: 400
          }}>
            <CardContent>
              <Tabs
                value={activeTab}
                onChange={handleTabChange}
                sx={{
                  mb: 3,
                  '& .MuiTab-root': {
                    fontWeight: 600,
                    textTransform: 'none',
                    fontSize: 16,
                  },
                }}
              >
                <Tab label="Informations générales" />
                <Tab label="Informations professionnelles" />
                <Tab label="Paramètres" />
              </Tabs>

              <Divider sx={{ mb: 3 }} />

              {/* Onglet Informations générales */}
              {activeTab === 0 && (
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Nom complet"
                      name="nom"
                      value={form.nom}
                      onChange={handleChange}
                      disabled={!editing}
                      sx={{ mb: 3 }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Email"
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={handleChange}
                      disabled={!editing}
                      sx={{ mb: 3 }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Téléphone"
                      name="telephone"
                      value={form.telephone}
                      onChange={handleChange}
                      disabled={!editing}
                      sx={{ mb: 3 }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth sx={{ mb: 3 }}>
                      <InputLabel>Spécialité</InputLabel>
                      <Select
                        name="specialite"
                        value={form.specialite}
                        onChange={handleChange}
                        disabled={!editing}
                        label="Spécialité"
                      >
                        {specialites.map((spec) => (
                          <MenuItem key={spec} value={spec}>
                            {spec}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Adresse"
                      name="adresse"
                      value={form.adresse}
                      onChange={handleChange}
                      disabled={!editing}
                      multiline
                      rows={2}
                      sx={{ mb: 3 }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Nom de l'hôpital"
                      name="hopital"
                      value={form.hopital}
                      onChange={handleChange}
                      disabled={!editing}
                      placeholder="Entrez le nom de l'hôpital où vous travaillez"
                    />
                  </Grid>
                </Grid>
              )}

              {/* Onglet Informations professionnelles */}
              {activeTab === 1 && (
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Numéro RPPS"
                      name="numeroRPPS"
                      value={form.numeroRPPS}
                      onChange={handleChange}
                      disabled={!editing}
                      sx={{ mb: 3 }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Années d'expérience"
                      name="experience"
                      value={form.experience}
                      onChange={handleChange}
                      disabled={!editing}
                      sx={{ mb: 3 }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Formation et diplômes"
                      name="formation"
                      value={form.formation}
                      onChange={handleChange}
                      disabled={!editing}
                      multiline
                      rows={4}
                      placeholder="Listez vos diplômes, formations et certifications..."
                    />
                  </Grid>
                </Grid>
              )}

              {/* Onglet Paramètres */}
              {activeTab === 2 && (
                <Box>
                  <Typography variant="h6" sx={{ mb: 3, color: 'primary.main' }}>
                    Paramètres de compte
                  </Typography>
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <Button
                        variant="outlined"
                        color="primary"
                        fullWidth
                        sx={{ borderRadius: 3, py: 2, fontWeight: 600 }}
                      >
                        Changer le mot de passe
                      </Button>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Button
                        variant="outlined"
                        color="secondary"
                        fullWidth
                        sx={{ borderRadius: 3, py: 2, fontWeight: 600 }}
                      >
                        Notifications
                      </Button>
                    </Grid>
                    <Grid item xs={12}>
                      <Button
                        variant="outlined"
                        color="error"
                        fullWidth
                        sx={{ borderRadius: 3, py: 2, fontWeight: 600 }}
                      >
                        Supprimer le compte
                      </Button>
                    </Grid>
                  </Grid>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ProfilMedecinPage;