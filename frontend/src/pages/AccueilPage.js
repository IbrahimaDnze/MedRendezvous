import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from '../config/api';

// Material-UI Components
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Avatar from '@mui/material/Avatar';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import MenuItem from '@mui/material/MenuItem';
import Grid from '@mui/material/Grid';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Stack from '@mui/material/Stack';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';

// Icons
import { 
  Visibility, 
  VisibilityOff, 
  Person as PersonIcon, 
  Email as EmailIcon, 
  VpnKey as VpnKeyIcon, 
  PhotoCamera,
  LockOutlined as LockOutlinedIcon,
  MedicalServices as MedicalServicesIcon,
  Twitter as TwitterIcon,
  Facebook as FacebookIcon,
  Instagram as InstagramIcon
} from '@mui/icons-material';

// Phone Input
import 'react-phone-number-input/style.css';
import PhoneInput from 'react-phone-number-input';
import { isValidPhoneNumber } from 'react-phone-number-input';

// Custom Hooks & Services
import { useSnackbar } from '../components/GlobalSnackbar';
import { useAuth } from '../contexts/AuthContext';
import { login as loginApi, register as registerApi, createMedecinProfile } from '../api/auth';

const bgImage = process.env.PUBLIC_URL + '/accueil-bg.jpeg';

const AccueilPage = () => {
  // navigate et showSnackbar inutiles ici, déjà utilisés dans LoginForm
  const [openLogin, setOpenLogin] = React.useState(false);
  const [isRegister, setIsRegister] = React.useState(false);
  const navigate = useNavigate();
  const [redirectRole, setRedirectRole] = useState(null);
  const handleRegisterSuccess = (role) => {
    setOpenLogin(false);
    setRedirectRole(role);
  };

  useEffect(() => {
    if (!openLogin && redirectRole) {
      if (redirectRole === 'medecin') {
        navigate('/dashboard-medecin');
      } else {
        navigate('/dashboard');
      }
      setRedirectRole(null);
    }
  }, [openLogin, redirectRole, navigate]);

  // Formulaire de connexion extrait de LoginPage
  const LoginForm = ({ onSuccess, onSwitch }) => {
    const [email, setEmail] = useState('');
    const [motDePasse, setMotDePasse] = useState('');
    const [error, setError] = useState('');
    const { showSnackbar } = useSnackbar();
    const { login, setUser } = useAuth();
    const [showPassword, setShowPassword] = useState(false);
    const [openForgot, setOpenForgot] = useState(false);
    const [forgotEmail, setForgotEmail] = useState('');
    const [forgotSuccess, setForgotSuccess] = useState('');
    const [forgotError, setForgotError] = useState('');
    const [showCodeInput, setShowCodeInput] = useState(false);
    const [resetCode, setResetCode] = useState('');
    const [codeSent, setCodeSent] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [showNewPassword, setShowNewPassword] = useState(false);

    const handleSubmit = async (e) => {
      e.preventDefault();
      setError('');
      try {
        const data = await loginApi(email, motDePasse); // renommé pour éviter conflit
        login(data.token);
        setUser(data.user);
        showSnackbar('Connexion réussie !', 'success');
        
        // Rediriger selon le rôle
        if (data.user.role === 'medecin') {
          navigate('/dashboard-medecin');
        } else if (data.user.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/dashboard');
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Erreur de connexion');
        showSnackbar(err.response?.data?.message || 'Erreur de connexion', 'error');
      }
    };


    const handleForgot = async () => {
      setForgotError('');
      setForgotSuccess('');
      setCodeSent(false);
      setShowCodeInput(false);
      if (!forgotEmail) {
        setForgotError('Veuillez saisir votre adresse email.');
        return;
      }
      try {
        await axios.post(`${API_BASE_URL}/api/auth/send-reset-code`, {
          email: forgotEmail
        });
        setForgotSuccess('Un code à 6 chiffres a été envoyé à votre adresse email.');
        setCodeSent(true);
        setShowCodeInput(true);
      } catch (error) {
        setForgotError(error.response?.data?.message || 'Erreur lors de l\'envoi du code. Veuillez réessayer.');
      }
    };
    const handleVerifyCode = async () => {
    setForgotError('');
    if (!resetCode) {
        setForgotError("Veuillez saisir le code.");
        return;
    }
    try {
        
        setForgotSuccess("Code vérifié ! Vous pouvez maintenant définir un nouveau mot de passe.");
        // Ici tu peux afficher un champ pour saisir le nouveau mot de passe
    } catch (error) {
        setForgotError(error.response?.data?.message || "Code invalide");
    }
};


    const handleResetPassword = async () => {
      setForgotError('');
      if (!newPassword) {
        setForgotError("Veuillez saisir un nouveau mot de passe.");
        return;
      }
      try {
        await axios.post(`${API_BASE_URL}/api/auth/reset-password`, {
          email: forgotEmail,
          code: resetCode,
          newPassword,
        });
        setForgotSuccess("Mot de passe réinitialisé avec succès ! Vous pouvez vous connecter.");
        setNewPassword('');
        setTimeout(() => setOpenForgot(false), 2000);
      } catch (error) {
        setForgotError(error.response?.data?.message || "Erreur lors de la réinitialisation.");
      }
    };

    return (
      <>
        <Box sx={{
          width: '100%',
          minHeight: 420,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          animation: 'slideUp 0.7s cubic-bezier(.39,.575,.56,1)',
          mt: 6,
        }}>
          <Box
            sx={{
              width: '100%',
              maxWidth: 370,
              px: 4,
              py: 4,
              borderRadius: 10,
              background: 'rgba(255,255,255,0.18)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              position: 'relative',
            }}
          >
            {/* Logo supprimé */}
            <Typography component="h1" variant="h5" sx={{ fontWeight: 900, mb: 2.5, color: 'primary.main', letterSpacing: 2, fontSize: 28, textShadow: '0 2px 12px #e3f0ff' }}>
              Connexion
            </Typography>
            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Adresse email"
                name="email"
                autoComplete="email"
                autoFocus
                value={email}
                onChange={e => setEmail(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon color="secondary" />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  borderRadius: 4,
                  mb: 2,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 4,
                    fontWeight: 500,
                    fontSize: 16,
                    background: 'rgba(255,255,255,0.85)',
                    boxShadow: '0 2px 12px 0 rgba(31,38,135,0.07)',
                    transition: 'box-shadow 0.2s',
                    '&:hover': {
                      boxShadow: '0 4px 16px 0 rgba(31,38,135,0.13)',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#f50057',
                    },
                  },
                }}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="motDePasse"
                label="Mot de passe"
                type={showPassword ? 'text' : 'password'}
                id="motDePasse"
                autoComplete="current-password"
                value={motDePasse}
                onChange={e => setMotDePasse(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <VpnKeyIcon color="secondary" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword(v => !v)} edge="end" tabIndex={-1}>
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  borderRadius: 4,
                  mb: 2,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 4,
                    fontWeight: 500,
                    fontSize: 16,
                    background: 'rgba(255,255,255,0.85)',
                    boxShadow: '0 2px 12px 0 rgba(31,38,135,0.07)',
                    transition: 'box-shadow 0.2s',
                    '&:hover': {
                      boxShadow: '0 4px 16px 0 rgba(31,38,135,0.13)',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#f50057',
                    },
                  },
                }}
              />
              {error && <Typography color="error" sx={{ mt: 1, textAlign: 'center', fontWeight: 500 }}>{error}</Typography>}
              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="secondary"
                sx={{
                  mt: 3,
                  mb: 2,
                  borderRadius: 99,
                  fontWeight: 900,
                  fontSize: 18,
                  py: 1.5,
                  background: 'linear-gradient(90deg, #f50057 0%, #1976d2 100%)',
                  color: '#fff',
                  boxShadow: '0 6px 32px 0 rgba(245,0,87,0.13)',
                  letterSpacing: 1,
                  textTransform: 'uppercase',
                  transition: 'transform 0.1s',
                  '&:active': {
                    transform: 'scale(0.97)',
                  },
                  '&:hover': {
                    background: 'linear-gradient(90deg, #1976d2 0%, #f50057 100%)',
                    color: '#fff',
                  },
                }}
                startIcon={<LockOutlinedIcon />}
              >
                Se connecter
              </Button>
              <Grid container justifyContent="flex-end">
                <Grid item>
                  <Button onClick={onSwitch} variant="text" color="secondary" sx={{ textTransform: 'none', fontWeight: 700, fontSize: 15, opacity: 0.8, '&:hover': { opacity: 1, color: '#1976d2' } }}>
                    Pas de compte ? Inscription
                  </Button>
                  <Button onClick={() => setOpenForgot(true)} variant="text" color="primary" sx={{ textTransform: 'none', fontWeight: 600, fontSize: 15, ml: 1 }}>
                    Mot de passe oublié ?
                  </Button>
                </Grid>
              </Grid>
            </Box>
          </Box>
          {/* Animation CSS */}
          <style>{`
            @keyframes slideUp {
              from { opacity: 0; transform: translateY(40px); }
              to { opacity: 1; transform: translateY(0); }
            }
          `}</style>
        </Box>
        <Dialog open={openForgot} onClose={() => { setOpenForgot(false); setForgotEmail(''); setForgotSuccess(''); setForgotError(''); setShowCodeInput(false); setCodeSent(false); setResetCode(''); }} maxWidth="xs" fullWidth>
          <DialogTitle>Réinitialiser le mot de passe</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Adresse email"
              type="email"
              fullWidth
              value={forgotEmail}
              onChange={e => setForgotEmail(e.target.value)}
              disabled={codeSent}
            />
            {showCodeInput && (
              <TextField
                margin="dense"
                label="Code reçu par email"
                type="text"
                fullWidth
                value={resetCode}
                onChange={e => setResetCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                inputProps={{ maxLength: 6 }}
                sx={{ mt: 2 }}
              />
            )}
            {forgotError && <Typography color="error" sx={{ mt: 1 }}>{forgotError}</Typography>}
            {forgotSuccess && <Typography color="success.main" sx={{ mt: 1 }}>{forgotSuccess}</Typography>}
            {forgotSuccess && forgotSuccess.startsWith("Code vérifié") && (
              <TextField
                margin="dense"
                label="Nouveau mot de passe"
                type={showNewPassword ? 'text' : 'password'}
                fullWidth
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowNewPassword(v => !v)} edge="end" tabIndex={-1}>
                        {showNewPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{ mt: 2 }}
              />
            )}
          </DialogContent>
         <DialogActions>
        <Button
    onClick={() => {
      setOpenForgot(false);
      setForgotEmail('');
      setForgotSuccess('');
      setForgotError('');
      setShowCodeInput(false);
      setCodeSent(false);
      setResetCode('');
      setNewPassword('');
    }}
    color="inherit"
  >
    Annuler
  </Button>
  {forgotSuccess && forgotSuccess.startsWith("Code vérifié") ? (
    <Button onClick={handleResetPassword} color="primary" variant="contained">
      Changer le mot de passe
    </Button>
  ) : !codeSent ? (
    <Button onClick={handleForgot} color="primary" variant="contained">
      Envoyer
    </Button>
  ) : (
    <Button onClick={handleVerifyCode} color="primary" variant="contained">
      Vérifier le code
    </Button>
  )}
</DialogActions>

        </Dialog>
      </>
    );
  };

  // Données fictives pour les témoignages
  const temoignages = [
    {
      nom: 'Dr.Ibrahima',
      profession: 'Dermatologue',
      texte: 'Grâce à MedRendezVous, j\'ai trouvé un spécialiste rapidement et pris rendez-vous en quelques clics. Service fiable et efficace !',
      photo: process.env.PUBLIC_URL + '/temoignage1 (1).jpg',
    },
    {
      nom: 'Dr. Korka',
      profession: 'Cardiologue',
      texte: 'La plateforme facilite la gestion de mes rendez-vous et me permet de mieux organiser mon agenda. Je recommande à mes confrères.',
      photo: process.env.PUBLIC_URL + '/temoignage2.jpg',
    },
    {
      nom: 'Sory',
      profession: 'Patiente',
      texte: 'Interface intuitive, prise de rendez-vous rapide, rappels par mail… Un vrai plus pour ma santé !',
      photo: process.env.PUBLIC_URL + '/tetemoignage3.jpg',
    },
  ];

  // Données fictives pour les articles
  const articles = [
    {
      titre: 'Comment bien préparer sa consultation médicale ?',
      image: process.env.PUBLIC_URL + '/article1 (1).jpg',
      resume: 'Découvrez nos conseils pour optimiser votre rendez-vous chez le spécialiste et poser les bonnes questions.',
      lien: '#',
    },
    {
      titre: 'Les avantages de la prise de rendez-vous en ligne',
      image: process.env.PUBLIC_URL + '/article2.jpg',
      resume: 'Gagnez du temps, évitez les files d\'attente et choisissez le créneau qui vous convient le mieux.',
      lien: '#',
    },
    {
      titre: 'Prévenir plutôt que guérir : l\'importance du suivi médical',
      image: 'https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=600&q=80',
      resume: 'Un suivi régulier avec votre médecin est la clé pour rester en bonne santé toute l\'année.',
      lien: '#',
    },
  ];

  // Formulaire d'inscription moderne
  const RegisterForm = ({ onSuccess, onSwitch }) => {
    const [step, setStep] = useState(0);
    const [formData, setFormData] = useState({
      nom: '',
      prenom: '',
      email: '',
      motDePasse: '',
      confirmerMotDePasse: '',
      telephone: '',
      specialite: '',
      adresse: '',
      ville: '',
      codePostal: '',
      presentation: '',
      photo: null,
      photoPreview: '',
      role: 'patient',
    });
  
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [confirmPasswordError, setConfirmPasswordError] = useState('');
    const [phoneError, setPhoneError] = useState('');
    const [rppsError, setRppsError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isEmailChecking, setIsEmailChecking] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    
    const [profileData, setProfileData] = useState({
      specialite: '',
      numeroRPPS: '',
      telephone: '',
      adresse: '',
      bio: '',
      formation: '',
      experience: '',
      avatar: null
    });
    
    const { showSnackbar } = useSnackbar();
    const { login, setUser } = useAuth();
    const navigate = useNavigate();
    // Fonction de validation du mot de passe
    const validatePassword = (password) => {
      if (password.length < 8) {
        return 'Le mot de passe doit contenir au moins 8 caractères';
      }
      return '';
    };

    const checkEmailExists = async (email) => {
      if (!email) return false;
      try {
        setIsEmailChecking(true);
        const response = await fetch(`${API_BASE_URL}/api/users/check-email?email=${encodeURIComponent(email)}`);
        const data = await response.json();
        return data.exists;
      } catch (error) {
        console.error('Erreur lors de la vérification de l\'email:', error);
        return false;
      } finally {
        setIsEmailChecking(false);
      }
    };

    const [apiSpecialites, setApiSpecialites] = useState([]);
    useEffect(() => {
      const fetchSpecialites = async () => {
        try {
          const r = await axios.get(`${API_BASE_URL}/api/specialites`);
          setApiSpecialites(r.data.specialites || []);
        } catch (e) {
          setApiSpecialites([]);
        }
      };
      fetchSpecialites();
    }, []);

    const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData({ ...formData, [name]: value });
      
      if (name === 'email') {
        setEmailError('');
      } else if (name === 'motDePasse') {
        const error = validatePassword(value);
        setPasswordError(error);
        
        // Vérifier aussi la confirmation si elle existe
        if (formData.confirmerMotDePasse) {
          if (value !== formData.confirmerMotDePasse) {
            setConfirmPasswordError('Les mots de passe ne correspondent pas');
          } else {
            setConfirmPasswordError('');
          }
        }
      } else if (name === 'confirmerMotDePasse') {
        if (value !== formData.motDePasse) {
          setConfirmPasswordError('Les mots de passe ne correspondent pas');
        } else {
          setConfirmPasswordError('');
        }
      }
    };

    const handleEmailBlur = async (e) => {
      const email = e.target.value.trim();
      if (!email) return;
      
      // Vérifier d'abord le format de base de l'email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setEmailError('Veuillez entrer une adresse email valide');
        return;
      }
      
      // Vérifier que c'est une adresse @gmail.com
      if (!email.toLowerCase().endsWith('@gmail.com')) {
        setEmailError('Seules les adresses @gmail.com sont acceptées');
        return;
      }
      
      // Vérifier si l'email existe déjà
      const exists = await checkEmailExists(email);
      if (exists) {
        setEmailError('Cette adresse email est déjà utilisée');
      } else {
        setEmailError('');
      }
    };

    const handleProfileChange = async (e) => {
      const { name, value } = e.target;
      setProfileData({ ...profileData, [name]: value });
      
      // Validation du RPPS
      if (name === 'numeroRPPS') {
        // Vérifier le format (11 chiffres)
        const rppsRegex = /^[0-9]{11}$/;
        if (!rppsRegex.test(value)) {
          setRppsError('Le numéro RPPS doit contenir exactement 11 chiffres');
          return;
        }
        
        try {
          // Vérifier si le RPPS existe déjà
          const response = await fetch(`${API_BASE_URL}/api/medecins/check-rpps/${value}`);
          const data = await response.json();
          
          if (data.exists) {
            setRppsError('Ce numéro RPPS est déjà utilisé');
          } else {
            setRppsError('');
          }
        } catch (error) {
          console.error('Erreur lors de la vérification du RPPS:', error);
          setRppsError('Erreur lors de la vérification du RPPS');
        }
      }
    };

    const handleAvatarChange = (e) => {
      const file = e.target.files[0];
      if (file && (file.type === 'image/jpeg' || file.type === 'image/png')) {
        // Augmenter la limite à 5MB pour être cohérent
        if (file.size > 20 * 1024 * 1024) {
          showSnackbar('L\'image est trop volumineuse. Taille maximum : 5MB', 'error');
          return;
        }
        
        const reader = new FileReader();
        reader.onloadend = () => {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            // Utiliser 300x300 comme taille standard
            const maxSize = 300;
            let { width, height } = img;
            
            if (width > height) {
              if (width > maxSize) {
                height = (height * maxSize) / width;
                width = maxSize;
              }
            } else {
              if (height > maxSize) {
                width = (width * maxSize) / height;
                height = maxSize;
              }
            }
            
            canvas.width = width;
            canvas.height = height;
            ctx.drawImage(img, 0, 0, width, height);
            
            // Augmenter la qualité à 0.9
            const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.9);
            setProfileData({ ...profileData, avatar: compressedDataUrl });
          };
          img.src = reader.result;
        };
        reader.readAsDataURL(file);
      }
    };

    const getButtonText = () => {
      if (loading) return 'Inscription...';
      if (formData.role === 'medecin' && step === 0) return 'Suivant';
      return 'Inscription';
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      setError('');
      
      console.log('Début handleSubmit - role:', formData.role, 'step:', step);
      
      // Vérification de l'email avant toute soumission
      if (formData.email) {
        // Vérifier le format de base
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
          setEmailError('Veuillez entrer une adresse email valide');
          setError('Veuillez corriger les erreurs dans le formulaire.');
          return;
        }
        
        // Vérifier que c'est une adresse @gmail.com
        if (!formData.email.toLowerCase().endsWith('@gmail.com')) {
          setEmailError('Seules les adresses @gmail.com sont acceptées');
          setError('Seules les adresses @gmail.com sont acceptées');
          return;
        }
      }
      
      if (formData.role === 'medecin' && step === 0) {
        // Vérifier tous les champs obligatoires
        const requiredFields = ['nom', 'email', 'motDePasse', 'confirmerMotDePasse'];
        const missingFields = requiredFields.filter(field => !formData[field]);
        
        if (missingFields.length > 0) {
          setError('Veuillez remplir tous les champs obligatoires.');
          return;
        }

        // Validation de l'email
        if (formData.email) {
          // Vérifier le format de l'email
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(formData.email)) {
            setEmailError('Veuillez entrer une adresse email valide');
            setError('Veuillez corriger les erreurs dans le formulaire.');
            return;
          }
          
          // Vérifier que c'est une adresse @gmail.com
          if (!formData.email.toLowerCase().endsWith('@gmail.com')) {
            setEmailError('Seules les adresses @gmail.com sont acceptées');
            setError('Seules les adresses @gmail.com sont acceptées');
            return;
          }
          
          // Vérifier si l'email existe déjà
          try {
            const exists = await checkEmailExists(formData.email);
            if (exists) {
              setEmailError('Cette adresse email est déjà utilisée');
              setError('Cette adresse email est déjà utilisée');
              showSnackbar('Cette adresse email est déjà utilisée', 'error');
              return;
            }
          } catch (error) {
            console.error('Erreur lors de la vérification de l\'email:', error);
            setError('Erreur lors de la vérification de l\'email. Veuillez réessayer.');
            return;
          }
        }
        
        // Validation du mot de passe
        const password = formData.motDePasse;
        const confirmPassword = formData.confirmerMotDePasse;
        
        // Vérification de la longueur minimale
        if (password.length < 8) {
          setPasswordError('Le mot de passe doit contenir au moins 8 caractères');
          setError('Le mot de passe est trop court');
          return;
        }
        
        // Vérification de la complexité du mot de passe
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumbers = /\d/.test(password);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
        
        // Construction d'un message d'erreur détaillé
        const missingRequirements = [];
        if (!hasUpperCase) missingRequirements.push('une majuscule');
        if (!hasLowerCase) missingRequirements.push('une minuscule');
        if (!hasNumbers) missingRequirements.push('un chiffre');
        if (!hasSpecialChar) missingRequirements.push('un caractère spécial');
        
        if (missingRequirements.length > 0) {
          const errorMsg = 'Le mot de passe doit contenir au moins :\n' +
                         `- ${missingRequirements.join('\n- ')}`;
          setPasswordError(errorMsg);
          setError('Le mot de passe ne respecte pas les exigences de sécurité');
          return;
        }
        
        // Vérifier que les mots de passe correspondent
        if (password !== confirmPassword) {
          setPasswordError('Les mots de passe ne correspondent pas');
          setConfirmPasswordError('Les mots de passe ne correspondent pas');
          setError('Les mots de passe ne correspondent pas');
          return;
        }
        
        // Si tout est valide, passer à l'étape suivante
        console.log('Passage à l\'étape 1 pour médecin');
        setStep(1);
        return;
      }
      // Validation des champs obligatoires pour tous les utilisateurs
      const requiredFields = [
        { field: 'nom', label: 'Nom' },
        { field: 'email', label: 'Email' },
        { field: 'motDePasse', label: 'Mot de passe' },
        { field: 'confirmerMotDePasse', label: 'Confirmation du mot de passe' }
      ];
      
      const missingFields = requiredFields
        .filter(({ field }) => !formData[field])
        .map(({ label }) => label);
      
      if (missingFields.length > 0) {
        setError(`Veuillez remplir les champs obligatoires : ${missingFields.join(', ')}`);
        return;
      }
      
      // Validation du numéro de téléphone pour les médecins
      if (formData.role === 'medecin' && (!profileData.telephone || !isValidPhoneNumber(profileData.telephone))) {
        setPhoneError('Veuillez entrer un numéro de téléphone valide');
        setError('Veuillez corriger le numéro de téléphone professionnel');
        return;
      }
      
      // Validation du mot de passe
      const password = formData.motDePasse;
      const confirmPassword = formData.confirmerMotDePasse;
      
      // Vérification de la longueur minimale
      if (password.length < 8) {
        setPasswordError('Le mot de passe doit contenir au moins 8 caractères');
        setError('Le mot de passe est trop court');
        return;
      }
      
      // Vérification de la complexité du mot de passe
      const hasUpperCase = /[A-Z]/.test(password);
      const hasLowerCase = /[a-z]/.test(password);
      const hasNumbers = /\d/.test(password);
      const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
      
      // Construction d'un message d'erreur détaillé
      const missingRequirements = [];
      if (!hasUpperCase) missingRequirements.push('une majuscule');
      if (!hasLowerCase) missingRequirements.push('une minuscule');
      if (!hasNumbers) missingRequirements.push('un chiffre');
      if (!hasSpecialChar) missingRequirements.push('un caractère spécial');
      
      if (missingRequirements.length > 0) {
        const errorMsg = 'Le mot de passe doit contenir au moins :\n' +
                       `- ${missingRequirements.join('\n- ')}`;
        setPasswordError(errorMsg);
        setError('Le mot de passe ne respecte pas les exigences de sécurité');
        return;
      }
      
      // Vérifier que les mots de passe correspondent
      if (password !== confirmPassword) {
        setPasswordError('Les mots de passe ne correspondent pas');
        setConfirmPasswordError('Les mots de passe ne correspondent pas');
        setError('Les mots de passe ne correspondent pas');
        return;
      }
      
      // Vérifier qu'il n'y a pas d'autres erreurs de validation
      if (passwordError || confirmPasswordError || emailError) {
        setError('Veuillez corriger les erreurs dans le formulaire.');
        return;
      }

      // Validation spécifique pour les médecins
      if (formData.role === 'medecin') {
        const requiredMedecinFields = [
          { field: 'specialite', label: 'Spécialité' },
          { field: 'numeroRPPS', label: 'Numéro RPPS' },
          { field: 'telephone', label: 'Téléphone professionnel' },
          { field: 'adresse', label: 'Adresse' }
        ];
        
        // Vérifier les champs manquants
        const missingMedecinFields = requiredMedecinFields
          .filter(({ field }) => !profileData[field])
          .map(({ label }) => label);
        
        if (missingMedecinFields.length > 0) {
          setError(`Veuillez remplir les champs obligatoires : ${missingMedecinFields.join(', ')}`);
          if (missingMedecinFields.includes('Téléphone professionnel')) {
            setPhoneError('Ce champ est obligatoire');
          }
          return;
        }
        
        // Validation du numéro de téléphone avec libphonenumber-js
        if (profileData.telephone && !isValidPhoneNumber(profileData.telephone)) {
          setPhoneError('Veuillez entrer un numéro de téléphone valide');
          setError('Veuillez corriger le numéro de téléphone professionnel');
          return;
        }
        
        // Vérifier s'il y a une erreur RPPS
        if (rppsError) {
          setError('Veuillez corriger le numéro RPPS');
          return;
        }
        
        // Validation du numéro RPPS (11 chiffres)
        const rppsRegex = /^[0-9]{11}$/;
        if (!rppsRegex.test(profileData.numeroRPPS)) {
          setRppsError('Le numéro RPPS doit contenir exactement 11 chiffres');
          setError('Veuillez corriger le numéro RPPS');
          return;
        }
      }

      try {
        setLoading(true);
        console.log('Début de l\'inscription');
        
        // Préparer les données pour l'API
        const userData = {
          nom: formData.nom,
          email: formData.email,
          motDePasse: formData.motDePasse,
          role: formData.role
        };
        
        // Ajouter le téléphone pour les médecins
        if (formData.role === 'medecin') {
          userData.telephone = profileData.telephone;
        }
        
        // Pour les médecins, on ne stocke que les informations de base
        // Le profil médecin sera créé séparément
        if (formData.role === 'medecin') {
          if (profileData.avatar) {
            userData.avatar = profileData.avatar;
          }
        }

        console.log('Données utilisateur:', userData);

        // Appel API réel
        console.log('=== APPEL API REGISTER ===');
        console.log('Données complètes à envoyer:', userData);
        
        const response = await registerApi(userData.nom, userData.email, userData.motDePasse, userData.role, userData);

        console.log('Réponse API:', response);

        if (response && response.token) {
          // Si c'est un médecin, créer le profil médecin
          if (response.user.role === 'medecin') {
            try {
              console.log('=== CRÉATION PROFIL MÉDECIN ===');
              const medecinData = {
                userId: response.user._id || response.user.id,
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
              console.log('User ID utilisé:', medecinData.userId);
              console.log('Type de userId:', typeof medecinData.userId);
              // Passer le token à createMedecinProfile
              const medecinResponse = await createMedecinProfile(medecinData, response.token);
              console.log('Profil médecin créé:', medecinResponse);
              // Mettre à jour l'utilisateur avec les informations du profil médecin
              const updatedUser = {
                ...response.user,
                ...medecinResponse.medecin
              };
              setUser(updatedUser);
              login(response.token, updatedUser);
              showSnackbar('Inscription réussie ! Profil médecin créé.', 'success');
              onSuccess(formData.role);
              return;
            } catch (medecinError) {
              console.error('Erreur lors de la création du profil médecin:', medecinError);
              showSnackbar('Inscription réussie mais erreur lors de la création du profil médecin. Contactez l\'administrateur.', 'warning');
              // L'utilisateur est créé mais pas le profil médecin
              login(response.token, response.user);
              onSuccess(formData.role);
              // SUPPRESSION navigate('/dashboard-medecin') ici, la redirection sera gérée par le parent
            }
          } else {
            // Pour les patients, procédure normale
            login(response.token, response.user);
            showSnackbar('Inscription réussie ! Bienvenue.', 'success');
            
            // Fermer d'abord le dialog
            onSuccess(formData.role);
            
            // Puis rediriger
            setTimeout(() => {
              navigate('/dashboard');
            }, 100);
          }
        }
      } catch (error) {
        console.error('Erreur lors de l\'inscription:', error);
        const errorMessage = error.response?.data?.message || error.message || 'Erreur inconnue';
        
        // Vérifier si l'erreur concerne un email déjà utilisé
        if (errorMessage.toLowerCase().includes('déjà utilisé') || errorMessage.toLowerCase().includes('email existant')) {
          setError('Cette adresse email est déjà utilisée. Veuillez utiliser une autre adresse email ou vous connecter.');
          showSnackbar('Cette adresse email est déjà utilisée', 'error');
        } else {
          setError('Erreur lors de l\'inscription: ' + errorMessage);
          showSnackbar('Erreur lors de l\'inscription', 'error');
        }
      } finally {
        setLoading(false);
      }
    };

    const steps = ['Informations de base', 'Profil médical'];

    return (
      <Box sx={{
        width: '100%',
        minHeight: 420,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        animation: 'fadeIn 0.7s cubic-bezier(.39,.575,.56,1)',
        mt: 6,
      }}>
        <Box
          sx={{
            width: '100%',
            maxWidth: 370,
            px: 0,
            py: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            position: 'relative',
          }}
        >
          {/* Logo supprimé */}
          <Typography component="h1" variant="h5" sx={{ fontWeight: 900, mb: 2, color: 'primary.main', letterSpacing: 2, fontSize: 28 }}>
            Inscription
          </Typography>
          
          {formData.role === 'medecin' && (
            <Stepper activeStep={step} sx={{ mb: 4 }}>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
          )}
          
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
            {error && (
              <Alert severity="error" sx={{ mb: 2, width: '100%' }}>
                {error}
              </Alert>
            )}
            {step === 0 && (
              <>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  label="Nom"
                  value={formData.nom}
                  onChange={handleChange}
                  name="nom"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonIcon color="primary" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    borderRadius: 4,
                    mb: 2,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 4,
                      fontWeight: 500,
                      fontSize: 16,
                      background: 'rgba(255,255,255,0.85)',
                      boxShadow: '0 2px 12px 0 rgba(31,38,135,0.07)',
                      transition: 'box-shadow 0.2s',
                      '&:hover': {
                        boxShadow: '0 4px 16px 0 rgba(31,38,135,0.13)',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#f50057',
                      },
                    },
                  }}
                />
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  label="Adresse email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  name="email"
                  onBlur={handleEmailBlur}
                  error={!!emailError}
                  helperText={emailError}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailIcon color={emailError ? 'error' : 'primary'} />
                      </InputAdornment>
                    ),
                    endAdornment: isEmailChecking ? (
                      <InputAdornment position="end">
                        <CircularProgress size={20} />
                      </InputAdornment>
                    ) : null,
                  }}
                  sx={{
                    borderRadius: 4,
                    mb: 2,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 4,
                      fontWeight: 500,
                      fontSize: 16,
                      background: 'rgba(255,255,255,0.85)',
                      boxShadow: '0 2px 12px 0 rgba(31,38,135,0.07)',
                      transition: 'box-shadow 0.2s',
                      '&:hover': {
                        boxShadow: '0 4px 16px 0 rgba(31,38,135,0.13)',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#f50057',
                      },
                    },
                  }}
                />
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  label="Mot de passe"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.motDePasse}
                  onChange={handleChange}
                  name="motDePasse"
                  error={!!passwordError}
                  helperText={passwordError}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <VpnKeyIcon color={passwordError ? 'error' : 'primary'} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowPassword(v => !v)} edge="end" tabIndex={-1}>
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    borderRadius: 4,
                    mb: 2,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 4,
                      fontWeight: 500,
                      fontSize: 16,
                      background: 'rgba(255,255,255,0.85)',
                      boxShadow: '0 2px 12px 0 rgba(31,38,135,0.07)',
                      transition: 'box-shadow 0.2s',
                      '&:hover': {
                        boxShadow: '0 4px 16px 0 rgba(31,38,135,0.13)',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#f50057',
                      },
                    },
                  }}
                />
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  label="Confirmer le mot de passe"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmerMotDePasse}
                  onChange={handleChange}
                  name="confirmerMotDePasse"
                  error={!!confirmPasswordError}
                  helperText={confirmPasswordError}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <VpnKeyIcon color={confirmPasswordError ? 'error' : 'primary'} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowConfirmPassword(v => !v)} edge="end" tabIndex={-1}>
                          {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    borderRadius: 4,
                    mb: 2,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 4,
                      fontWeight: 500,
                      fontSize: 16,
                      background: 'rgba(255,255,255,0.85)',
                      boxShadow: '0 2px 12px 0 rgba(31,38,135,0.07)',
                      transition: 'box-shadow 0.2s',
                      '&:hover': {
                        boxShadow: '0 4px 16px 0 rgba(31,38,135,0.13)',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#f50057',
                      },
                    },
                  }}
                />
                {/* Champ téléphone supprimé du premier formulaire */}
                {/* Le téléphone est maintenant uniquement dans le formulaire du médecin */}
                <TextField
                  margin="normal"
                  select
                  fullWidth
                  label="Rôle"
                  value={formData.role}
                  onChange={handleChange}
                  name="role"
                  sx={{
                    borderRadius: 4,
                    mb: 2,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 4,
                      fontWeight: 500,
                      fontSize: 16,
                      background: 'rgba(255,255,255,0.85)',
                      boxShadow: '0 2px 12px 0 rgba(31,38,135,0.07)',
                      transition: 'box-shadow 0.2s',
                      '&:hover': {
                        boxShadow: '0 4px 16px 0 rgba(31,38,135,0.13)',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#f50057',
                      },
                    },
                  }}
                >
                  <MenuItem value="patient">Patient</MenuItem>
                  <MenuItem value="medecin">Médecin</MenuItem>
                </TextField>
                {error && <Typography color="error" sx={{ mt: 1, textAlign: 'center', fontWeight: 500 }}>{error}</Typography>}
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  color="secondary"
                  disabled={loading}
                  sx={{
                    mt: 3,
                    mb: 2,
                    borderRadius: 99,
                    fontWeight: 900,
                    fontSize: 18,
                    py: 1.5,
                    background: 'linear-gradient(90deg, #f50057 0%, #1976d2 100%)',
                    color: '#fff',
                    boxShadow: '0 6px 32px 0 rgba(245,0,87,0.13)',
                    letterSpacing: 1,
                    textTransform: 'uppercase',
                    transition: 'transform 0.1s',
                    '&:active': {
                      transform: 'scale(0.97)',
                    },
                    '&:hover': {
                      background: 'linear-gradient(90deg, #1976d2 0%, #f50057 100%)',
                      color: '#fff',
                    },
                  }}
                  startIcon={<LockOutlinedIcon />}
                >
                  {getButtonText()}
                </Button>
                <Grid container justifyContent="flex-end">
                  <Grid item>
                    <Button onClick={onSwitch} variant="text" color="secondary" sx={{ textTransform: 'none', fontWeight: 700, fontSize: 15, opacity: 0.8, '&:hover': { opacity: 1, color: '#1976d2' } }}>
                      Déjà un compte ? Connexion
                    </Button>
                  </Grid>
                </Grid>
              </>
            )}
            
            {step === 1 && formData.role === 'medecin' && (
              <>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, color: 'primary.main', textAlign: 'center' }}>
                  Informations de votre profil médical
                </Typography>
                
                <Box sx={{ textAlign: 'center', mb: 3 }}>
                  <Box sx={{ position: 'relative', display: 'inline-block' }}>
                    <Avatar
                      src={profileData.avatar}
                      sx={{ 
                        width: 100, 
                        height: 100, 
                        bgcolor: 'primary.main',
                        fontSize: 40,
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
                </Box>

                <TextField
                  margin="normal"
                  required
                  fullWidth
                  label="Spécialité"
                  value={profileData.specialite}
                  onChange={handleProfileChange}
                  name="specialite"
                  select
                  sx={{
                    borderRadius: 4,
                    mb: 2,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 4,
                      fontWeight: 500,
                      fontSize: 16,
                      background: 'rgba(255,255,255,0.85)',
                      boxShadow: '0 2px 12px 0 rgba(31,38,135,0.07)',
                      transition: 'box-shadow 0.2s',
                      '&:hover': {
                        boxShadow: '0 4px 16px 0 rgba(31,38,135,0.13)',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#f50057',
                      },
                    },
                  }}
                >
                  {apiSpecialites.map((s) => (
                    <MenuItem key={s._id} value={s.name}>
                      {s.name}
                    </MenuItem>
                  ))}
                </TextField>
                
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  label="Numéro RPPS"
                  value={profileData.numeroRPPS}
                  onChange={handleProfileChange}
                  name="numeroRPPS"
                  error={!!rppsError}
                  helperText={rppsError}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <MedicalServicesIcon color={rppsError ? 'error' : 'primary'} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    borderRadius: 4,
                    mb: 2,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 4,
                      fontWeight: 500,
                      fontSize: 16,
                      background: 'rgba(255,255,255,0.85)',
                      boxShadow: '0 2px 12px 0 rgba(31,38,135,0.07)',
                      transition: 'box-shadow 0.2s',
                      '&:hover': {
                        boxShadow: '0 4px 16px 0 rgba(31,38,135,0.13)',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#f50057',
                      },
                    },
                  }}
                />
                
                <Box sx={{ width: '100%', mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600, color: 'text.primary' }}>
                    Téléphone professionnel *
                  </Typography>
                  <Box sx={{
                    borderRadius: 4,
                    border: phoneError ? '1px solid #d32f2f' : '1px solid rgba(0, 0, 0, 0.23)',
                    p: '4px 14px',
                    transition: 'border-color 0.2s',
                    '&:hover': {
                      borderColor: phoneError ? '#d32f2f' : 'rgba(0, 0, 0, 0.87)'
                    },
                    '&:focus-within': {
                      borderColor: phoneError ? '#d32f2f' : '#1976d2',
                      boxShadow: '0 0 0 2px rgba(25, 118, 210, 0.2)'
                    },
                    '& .PhoneInput': {
                      width: '100%',
                      '& input': {
                        border: 'none',
                        outline: 'none',
                        backgroundColor: 'transparent',
                        cursor: 'pointer',
                        fontSize: '16px',
                        padding: '10px 0',
                        width: '100%',
                        '&::placeholder': {
                          color: 'rgba(0, 0, 0, 0.38)'
                        }
                      },
                      '& select': {
                        border: 'none',
                        outline: 'none',
                        backgroundColor: 'transparent',
                        cursor: 'pointer',
                        fontSize: '16px',
                        '&:focus': {
                          outline: 'none'
                        }
                      }
                    }
                  }}>
                    <PhoneInput
                      international
                      defaultCountry="FR"
                      value={profileData.telephone}
                      onChange={(value) => {
                        setProfileData({ ...profileData, telephone: value });
                        // Validation en temps réel
                        if (value) {
                          if (!isValidPhoneNumber(value)) {
                            setPhoneError('Numéro de téléphone invalide');
                          } else {
                            setPhoneError('');
                          }
                        } else {
                          setPhoneError('');
                        }
                      }}
                      onBlur={() => {
                        // Validation au blur
                        if (profileData.telephone && !isValidPhoneNumber(profileData.telephone)) {
                          setPhoneError('Veuillez entrer un numéro de téléphone valide');
                        } else {
                          setPhoneError('');
                        }
                      }}
                      placeholder="Entrez votre numéro de téléphone professionnel"
                    />
                  </Box>
                  {phoneError && (
                    <Typography color="error" variant="caption" sx={{ display: 'block', mt: 1 }}>
                      {phoneError}
                    </Typography>
                  )}
                </Box>
                
                <TextField
                  margin="normal"
                  fullWidth
                  label="Nom de l'hôpital"
                  value={profileData.hopital || ''}
                  onChange={handleProfileChange}
                  name="hopital"
                  placeholder="Entrez le nom de l'hôpital où vous travaillez"
                  sx={{
                    borderRadius: 4,
                    mb: 2,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 4,
                      fontWeight: 500,
                      fontSize: 16,
                      background: 'rgba(255,255,255,0.85)',
                      boxShadow: '0 2px 12px 0 rgba(31,38,135,0.07)',
                      transition: 'box-shadow 0.2s',
                      '&:hover': {
                        boxShadow: '0 4px 16px 0 rgba(31,38,135,0.13)',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#f50057',
                      },
                    },
                  }}
                />
                <TextField
                  margin="normal"
                  fullWidth
                  label="Adresse"
                  value={profileData.adresse || ''}
                  onChange={handleProfileChange}
                  name="adresse"
                  placeholder="Adresse professionnelle"
                  sx={{
                    borderRadius: 4,
                    mb: 2,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 4,
                      fontWeight: 500,
                      fontSize: 16,
                      background: 'rgba(255,255,255,0.85)',
                      boxShadow: '0 2px 12px 0 rgba(31,38,135,0.07)',
                      transition: 'box-shadow 0.2s',
                      '&:hover': {
                        boxShadow: '0 4px 16px 0 rgba(31,38,135,0.13)',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#f50057',
                      },
                    },
                  }}
                />
                
                <TextField
                  margin="normal"
                  fullWidth
                  label="Formation et diplômes"
                  value={profileData.formation}
                  onChange={handleProfileChange}
                  name="formation"
                  multiline
                  rows={3}
                  placeholder="Listez vos diplômes, formations et certifications..."
                  sx={{
                    borderRadius: 4,
                    mb: 2,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 4,
                      fontWeight: 500,
                      fontSize: 16,
                      background: 'rgba(255,255,255,0.85)',
                      boxShadow: '0 2px 12px 0 rgba(31,38,135,0.07)',
                      transition: 'box-shadow 0.2s',
                      '&:hover': {
                        boxShadow: '0 4px 16px 0 rgba(31,38,135,0.13)',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#f50057',
                      },
                    },
                  }}
                />
                
                <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={() => setStep(0)}
                    sx={{ borderRadius: 99, py: 1.5, fontWeight: 600 }}
                  >
                    Retour
                  </Button>
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    color="secondary"
                    disabled={loading}
                    sx={{
                      borderRadius: 99,
                      fontWeight: 900,
                      fontSize: 18,
                      py: 1.5,
                      background: 'linear-gradient(90deg, #f50057 0%, #1976d2 100%)',
                      color: '#fff',
                      boxShadow: '0 6px 32px 0 rgba(245,0,87,0.13)',
                      letterSpacing: 1,
                      textTransform: 'uppercase',
                      transition: 'transform 0.1s',
                      '&:active': {
                        transform: 'scale(0.97)',
                      },
                      '&:hover': {
                        background: 'linear-gradient(90deg, #1976d2 0%, #f50057 100%)',
                        color: '#fff',
                      },
                    }}
                    startIcon={<LockOutlinedIcon />}
                  >
                    {loading ? 'Inscription...' : 'Inscription'}
                  </Button>
                </Box>
              </>
            )}
          </Box>
        </Box>
        <style>{`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>
      </Box>
    );
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f9f9f9', display: 'flex', flexDirection: 'column', overflowX: 'hidden' }}>
      {/* Header identique au global mais sans navigation */}
      <AppBar position="fixed" color="primary" elevation={4} sx={{ zIndex: 1201 }}>
        <Toolbar sx={{ minHeight: 96, px: { xs: 2, md: 24 }, width: '100%', mx: 'auto' }}>
          <Stack direction="row" spacing={3} alignItems="center" justifyContent="center" sx={{ width: '100%' }}>
            <Avatar sx={{ bgcolor: 'white', color: 'secondary.main', width: 56, height: 56, boxShadow: 4, border: '2.5px solid #f50057' }}>
              <MedicalServicesIcon fontSize="large" />
            </Avatar>
            <Typography variant="h4" sx={{ fontWeight: 800, color: 'white', letterSpacing: 2, fontSize: { xs: 22, md: 32 }, textAlign: 'center' }}>
              MedRendezVous
            </Typography>
          </Stack>
        </Toolbar>
      </AppBar>
      {/* Espaceur pour compenser la hauteur du header fixed */}
      <Toolbar sx={{ minHeight: 96 }} />
      {/* Bloc central */}
      <Box
        sx={{
          width: '100%',
          minHeight: { xs: 600, md: 400 },
          background: `url(${bgImage}) center/cover no-repeat`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          imageRendering: 'crisp-edges',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          mb: 8,
          boxShadow: 4,
        }}
      >
          <Box sx={{
            position: 'absolute',
            inset: 0,
            bgcolor: 'rgba(0,0,0,0.35)',
            zIndex: 1,
          }} />
          <Box sx={{ position: 'relative', zIndex: 2, textAlign: 'center', px: 2 }}>
            <Typography variant="h4" sx={{ color: 'white', fontWeight: 800, mb: 2, letterSpacing: 1, fontSize: { xs: 18, md: 32 } }}>
              Trouvez le bon spécialiste pour vos besoins
            </Typography>
            <Typography variant="body1" sx={{ color: 'white', fontWeight: 400, mb: 3, fontSize: { xs: 16, md: 20 } }}>
              Prenez rendez-vous facilement avec les meilleurs médecins spécialistes de votre région et gérez votre santé en toute simplicité.
            </Typography>
            <Button
              variant="contained"
              color="secondary"
              size="large"
              sx={{ borderRadius: 3, fontWeight: 700, fontSize: 16, px: 3, py: 1, boxShadow: 2, letterSpacing: 1 }}
              onClick={() => setOpenLogin(true)}
            >
              Commencer
            </Button>
          </Box>
        </Box>
      {/* Section Témoignages - style glassmorphism moderne */}
      <Box sx={{ width: '100%', maxWidth: 1200, mx: 'auto', mt: 4, mb: 8, px: 2 }}>
        <Typography variant="h4" sx={{ fontWeight: 900, mb: 4, textAlign: 'center', color: 'primary.main', letterSpacing: 2 }}>
          Ils nous font confiance
        </Typography>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={4} justifyContent="center" alignItems="stretch">
          {temoignages.map((t, i) => (
            <Box key={i} sx={{
              flex: 1,
              background: 'rgba(255,255,255,0.22)',
              borderRadius: 7,
              boxShadow: '0 8px 32px 0 rgba(31,38,135,0.13)',
              backdropFilter: 'blur(10px)',
              p: 4,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              minWidth: 260,
              maxWidth: 350,
              mx: 'auto',
              border: '1.5px solid rgba(255,255,255,0.25)',
              position: 'relative',
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                transform: 'translateY(-8px) scale(1.03)',
                boxShadow: '0 16px 40px 0 rgba(31,38,135,0.18)',
              },
              animation: 'fadeInUp 0.7s',
            }}>
              <Box sx={{
                mb: 2,
                borderRadius: '50%',
                p: '3px',
                background: 'linear-gradient(135deg, #f50057 0%, #1976d2 100%)',
                boxShadow: '0 2px 12px 0 rgba(245,0,87,0.10)',
              }}>
                <Avatar src={t.photo} alt={t.nom} sx={{ width: 64, height: 64, border: '3px solid #fff' }} />
              </Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'primary.main', mb: 0.5, fontSize: 18 }}>{t.nom}</Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1, fontWeight: 500 }}>{t.profession}</Typography>
              <Typography variant="h6" sx={{ fontStyle: 'italic', textAlign: 'center', color: 'text.primary', mb: 0, fontWeight: 400, lineHeight: 1.5 }}>
                <span style={{ fontSize: 32, color: '#f50057', verticalAlign: 'top', fontWeight: 700 }}>&ldquo;</span>
                {t.texte}
                <span style={{ fontSize: 32, color: '#f50057', verticalAlign: 'bottom', fontWeight: 700 }}>&rdquo;</span>
              </Typography>
            </Box>
          ))}
        </Stack>
        <style>{`
          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(40px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>
      </Box>

      {/* Section Articles - style moderne avec effet hover */}
      <Box sx={{ width: '100%', maxWidth: 1200, mx: 'auto', mb: 10, px: 2 }}>
        <Typography variant="h4" sx={{ fontWeight: 900, mb: 4, textAlign: 'center', color: 'primary.main', letterSpacing: 2 }}>
          Nos articles
        </Typography>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={4} justifyContent="center" alignItems="stretch">
          {articles.map((a, i) => (
            <Box key={i} sx={{
              flex: 1,
              background: 'rgba(255,255,255,0.92)',
              borderRadius: 7,
              boxShadow: '0 8px 32px 0 rgba(31,38,135,0.10)',
              p: 0,
              minWidth: 260,
              maxWidth: 350,
              mx: 'auto',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                transform: 'translateY(-8px) scale(1.03)',
                boxShadow: '0 16px 40px 0 rgba(31,38,135,0.18)',
              },
              animation: 'fadeInUp 0.7s',
            }}>
              <Box component="img" src={a.image} alt={a.titre} sx={{ width: '100%', height: 170, objectFit: 'cover', borderTopLeftRadius: 7, borderTopRightRadius: 7, transition: 'filter 0.2s', '&:hover': { filter: 'brightness(0.95) scale(1.04)' } }} />
              <Box sx={{ p: 2.5, flex: 1, display: 'flex', flexDirection: 'column' }}>
                <Typography variant="h6" sx={{ fontWeight: 800, color: 'primary.main', mb: 1.5, fontSize: 20, letterSpacing: 1 }}>{a.titre}</Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2, fontSize: 15 }}>{a.resume}</Typography>
                <Button onClick={() => navigate(`/article/${i+1}`)} variant="contained" color="secondary" sx={{ alignSelf: 'flex-start', borderRadius: 99, fontWeight: 700, px: 3, py: 0.5, fontSize: 15, boxShadow: '0 2px 8px 0 rgba(245,0,87,0.10)', textTransform: 'none', mt: 'auto' }} endIcon={<span style={{fontSize:18,marginLeft:4}}>→</span>}>
                  Lire la suite
                </Button>
              </Box>
            </Box>
          ))}
        </Stack>
      </Box>

      {/* Footer moderne sans liens */}
      <Box sx={{ width: '100%', py: 6, bgcolor: 'transparent', textAlign: 'center' }}>
        <Stack direction="row" spacing={4} justifyContent="center" sx={{ mb: 2 }}>
          <IconButton color="primary" sx={{ fontSize: 40 }}><TwitterIcon sx={{ fontSize: 40 }} /></IconButton>
          <IconButton color="primary" sx={{ fontSize: 40 }}><FacebookIcon sx={{ fontSize: 40 }} /></IconButton>
          <IconButton color="primary" sx={{ fontSize: 40 }}><InstagramIcon sx={{ fontSize: 40 }} /></IconButton>
        </Stack>
        <Typography variant="body2" color="text.secondary">
          © 2024 MedRendezVous. Tous droits réservés.
        </Typography>
      </Box>
      {/* Dialog de connexion */}
      <Dialog open={openLogin} onClose={() => { setOpenLogin(false); setIsRegister(false); }} maxWidth="xs" fullWidth>
        {isRegister ? (
          <RegisterForm onSuccess={handleRegisterSuccess} onSwitch={() => setIsRegister(false)} />
        ) : (
          <LoginForm onSuccess={() => setOpenLogin(false)} onSwitch={() => setIsRegister(true)} />
        )}
      </Dialog>
    </Box>
  );
};

export default AccueilPage;