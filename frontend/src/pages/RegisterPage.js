import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSnackbar } from '../components/GlobalSnackbar';
import { createMedecinProfile } from '../api/auth';
import API_BASE_URL from '../config/api';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import Avatar from '@mui/material/Avatar';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import PersonIcon from '@mui/icons-material/Person';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { login, setUser } = useAuth();
  const { showSnackbar } = useSnackbar();
  
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({
    nom: '',
    email: '',
    motDePasse: '',
    confirmerMotDePasse: '',
    role: 'patient'
  });
  
  const [profileData, setProfileData] = useState({
    specialite: '',
    numeroRPPS: '',
    telephone: '',
    adresse: '',
    hopital: '',
    formation: '',
    experience: '',
    avatar: null
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Force re-render when role changes
  useEffect(() => {
    console.log('Role changed to:', formData.role);
  }, [formData.role]);

  const specialites = [
    'Cardiologie', 'Dermatologie', 'Endocrinologie', 'Gastro-entérologie',
    'Gynécologie', 'Neurologie', 'Ophtalmologie', 'Orthopédie',
    'Oto-rhino-laryngologie', 'Pédiatrie', 'Psychiatrie', 'Pneumologie',
    'Rhumatologie', 'Urologie', 'Chirurgie générale', 'Chirurgie orthopédique'
  ];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleProfileChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file && (file.type === 'image/jpeg' || file.type === 'image/png')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileData({ ...profileData, avatar: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.role === 'medecin' && step === 0) {
      // Première étape pour les médecins
      setStep(1);
      return;
    }

    try {
      setLoading(true);
      
      if (formData.motDePasse !== formData.confirmerMotDePasse) {
        showSnackbar('Les mots de passe ne correspondent pas', 'error');
        return;
      }

      // Appel API réel pour l'inscription
      const userData = {
        nom: formData.nom,
        email: formData.email,
        motDePasse: formData.motDePasse,
        role: formData.role
      };

      console.log('Données d\'inscription à envoyer:', userData);

      const response = await fetch(`${API_BASE_URL}/api/users/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData)
      });

      console.log('Status de la réponse:', response.status);
      console.log('Headers de la réponse:', response.headers);

      const result = await response.json();
      console.log('Résultat de l\'API:', result);

      if (!response.ok) {
        console.error('Erreur API:', result);
        throw new Error(result.message || 'Erreur lors de l\'inscription');
      }

      console.log('Réponse d\'inscription:', result);

      // Si c'est un médecin, créer le profil médecin
      if (result.user.role === 'medecin') {
        try {
          console.log('=== CRÉATION PROFIL MÉDECIN ===');
          
          const medecinData = {
            userId: result.user._id || result.user.id,
            specialite: profileData.specialite,
            numeroRPPS: profileData.numeroRPPS,
            telephone: profileData.telephone,
            adresse: profileData.adresse,
            hopital: profileData.hopital,
            formation: profileData.formation,
            experience: profileData.experience,
            avatar: profileData.avatar,
            langues: profileData.langues || ['Français']
          };
          
          console.log('Données profil médecin:', medecinData);
          
          const medecinResponse = await createMedecinProfile(medecinData);
          
          console.log('Profil médecin créé:', medecinResponse);
          
          // Mettre à jour l'utilisateur avec les informations du profil médecin
          const updatedUser = {
            ...result.user,
            ...medecinResponse.medecin
          };
          
          setUser(updatedUser);
          login(result.token);
          showSnackbar('Inscription réussie ! Profil médecin créé.', 'success');
          
          navigate('/dashboard-medecin');
        } catch (medecinError) {
          console.error('Erreur lors de la création du profil médecin:', medecinError);
          showSnackbar('Inscription réussie mais erreur lors de la création du profil médecin. Contactez l\'administrateur.', 'warning');
          
          // L'utilisateur est créé mais pas le profil médecin
          login(result.token);
          setUser(result.user);
          
          navigate('/dashboard-medecin');
        }
      } else {
        // Pour les patients, procédure normale
        login(result.token);
        setUser(result.user);
        showSnackbar('Inscription réussie ! Bienvenue.', 'success');
        
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Erreur lors de l\'inscription:', error);
      showSnackbar(error.message || 'Erreur lors de l\'inscription', 'error');
    } finally {
      setLoading(false);
    }
  };

  const steps = ['Informations de base', 'Profil médical'];

  const getButtonText = () => {
    console.log('Debug - role:', formData.role, 'step:', step, 'loading:', loading);
    if (loading) return 'Inscription...';
    if (formData.role === 'medecin' && step === 0) return 'Suivant';
    return 'Inscription';
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      px: 2
    }}>
      <Card sx={{
        maxWidth: 600,
        width: '100%',
        borderRadius: 4,
        bgcolor: 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
      }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography variant="h4" sx={{ 
              fontWeight: 900, 
              color: 'primary.main',
              mb: 2
            }}>
              Inscription
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {formData.role === 'medecin' ? 'Rejoignez notre équipe médicale' : 'Créez votre compte patient'}
            </Typography>
          </Box>

          {formData.role === 'medecin' && (
            <Stepper activeStep={step} sx={{ mb: 4 }}>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
          )}

          <form onSubmit={handleSubmit}>
            {step === 0 && (
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Nom complet"
                    name="nom"
                    value={formData.nom}
                    onChange={handleChange}
                    required
                    sx={{ mb: 2 }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    sx={{ mb: 2 }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Mot de passe"
                    name="motDePasse"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.motDePasse}
                    onChange={handleChange}
                    required
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    sx={{ mb: 2 }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Confirmer le mot de passe"
                    name="confirmerMotDePasse"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmerMotDePasse}
                    onChange={handleChange}
                    required
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            edge="end"
                          >
                            {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    sx={{ mb: 3 }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Rôle</InputLabel>
                    <Select
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      label="Rôle"
                    >
                      <MenuItem value="patient">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <PersonIcon />
                          Patient
                        </Box>
                      </MenuItem>
                      <MenuItem value="medecin">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <MedicalServicesIcon />
                          Médecin
                        </Box>
                      </MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            )}

            {step === 1 && formData.role === 'medecin' && (
              <Grid container spacing={3}>
                <Grid item xs={12} sx={{ textAlign: 'center', mb: 3 }}>
                  <Box sx={{ position: 'relative', display: 'inline-block' }}>
                    <Avatar
                      src={profileData.avatar}
                      sx={{ 
                        width: 120, 
                        height: 120, 
                        bgcolor: 'primary.main',
                        fontSize: 48,
                        border: '4px solid white',
                        boxShadow: '0 4px 16px rgba(0,0,0,0.2)'
                      }}
                    >
                      {formData.nom.charAt(0) || 'M'}
                    </Avatar>
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
                  </Box>
                </Grid>

                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Spécialité</InputLabel>
                    <Select
                      name="specialite"
                      value={profileData.specialite}
                      onChange={handleProfileChange}
                      label="Spécialité"
                      required
                    >
                      {specialites.map((spec) => (
                        <MenuItem key={spec} value={spec}>
                          {spec}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Numéro RPPS"
                    name="numeroRPPS"
                    value={profileData.numeroRPPS}
                    onChange={handleProfileChange}
                    required
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Téléphone"
                    name="telephone"
                    value={profileData.telephone}
                    onChange={handleProfileChange}
                    required
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Années d'expérience"
                    name="experience"
                    value={profileData.experience}
                    onChange={handleProfileChange}
                    type="number"
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Adresse"
                    name="adresse"
                    value={profileData.adresse}
                    onChange={handleProfileChange}
                    multiline
                    rows={2}
                    required
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Formation et diplômes"
                    name="formation"
                    value={profileData.formation}
                    onChange={handleProfileChange}
                    multiline
                    rows={3}
                    placeholder="Listez vos diplômes, formations et certifications..."
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Nom de l'hôpital"
                    name="hopital"
                    value={profileData.hopital || ''}
                    onChange={handleProfileChange}
                    required
                    placeholder="Entrez le nom de l'hôpital où vous travaillez"
                  />
                </Grid>
              </Grid>
            )}

            <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
              {formData.role === 'medecin' && step === 1 && (
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => setStep(0)}
                  sx={{ borderRadius: 3, py: 1.5, fontWeight: 600 }}
                >
                  Retour
                </Button>
              )}
              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={loading}
                sx={{ borderRadius: 3, py: 1.5, fontWeight: 600 }}
              >
                {getButtonText()}
              </Button>
            </Box>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export default RegisterPage; 