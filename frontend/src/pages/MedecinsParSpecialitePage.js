import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import API_BASE_URL from '../config/api';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CircularProgress from '@mui/material/CircularProgress';
import SearchIcon from '@mui/icons-material/Search';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { useSnackbar } from '../components/GlobalSnackbar';

const specialitesImages = {
  'Cardiologie': 'https://images.unsplash.com/photo-1511174511562-5f97f4f4e0c8?auto=format&fit=crop&w=400&q=80',
  'Dermatologie': 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=400&q=80',
  'Ophtalmologie': 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80',
  'Pédiatrie': 'https://images.unsplash.com/photo-1503457574465-494bba506e52?auto=format&fit=crop&w=400&q=80',
  'Gynécologie': 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd23?auto=format&fit=crop&w=400&q=80',
  'Neurologie': 'https://images.unsplash.com/photo-1512070679279-c2f999098c01?auto=format&fit=crop&w=400&q=80',
  'Gastro-entérologie': 'https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=400&q=80',
  'Psychiatrie': 'https://images.unsplash.com/photo-1503676382389-4809596d5290?auto=format&fit=crop&w=400&q=80',
  'Orthopédie': 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=400&q=80',
};

const MedecinsParSpecialitePage = () => {
  const { specialite } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const { showSnackbar } = useSnackbar();
  
  const [medecins, setMedecins] = useState([]);
  const [filteredMedecins, setFilteredMedecins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchAdresse, setSearchAdresse] = useState('');
  const [searchNom, setSearchNom] = useState('');
  const [detailsDialog, setDetailsDialog] = useState(false);
  const [selectedMedecinDetails, setSelectedMedecinDetails] = useState(null);
  const [rdvDialog, setRdvDialog] = useState(false);
  const [selectedMedecinRdv, setSelectedMedecinRdv] = useState(null);
  const [rdvData, setRdvData] = useState({
    date: '',
    heure: '',
    motif: ''
  });
  const [saving, setSaving] = useState(false);

  const fetchMedecins = useCallback(async () => {
    try {
      console.log('=== RÉCUPÉRATION DES MÉDECINS ===');
      console.log('Spécialité:', specialite);
      console.log('Token présent:', !!token);
      
      setLoading(true);
      const response = await axios.get(`http://localhost:5000/api/users/medecins/specialite/${encodeURIComponent(specialite)}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('Réponse API:', response.data);
      const medecinsData = response.data.medecins || [];
      console.log('Médecins récupérés:', medecinsData.length);
      setMedecins(medecinsData);
      setLoading(false);
    } catch (error) {
      console.error('=== ERREUR LORS DU CHARGEMENT DES MÉDECINS ===');
      console.error('Erreur complète:', error);
      console.error('Message d\'erreur:', error.message);
      console.error('Réponse d\'erreur:', error.response?.data);
      console.error('Status:', error.response?.status);
      showSnackbar('Erreur lors du chargement des médecins', 'error');
      setLoading(false);
    }
  }, [specialite, token, showSnackbar]);

  useEffect(() => {
    fetchMedecins();
  }, [fetchMedecins]);

  // Filtrer les médecins selon les critères de recherche
  useEffect(() => {
    let filtered = medecins;

    // Filtre par nom
    if (searchNom) {
      filtered = filtered.filter(medecin => 
        medecin.nom?.toLowerCase().includes(searchNom.toLowerCase())
      );
    }

    // Filtre par adresse
    if (searchAdresse) {
      filtered = filtered.filter(medecin => 
        medecin.adresse?.toLowerCase().includes(searchAdresse.toLowerCase())
      );
    }

    setFilteredMedecins(filtered);
  }, [medecins, searchNom, searchAdresse]);

  const handlePrendreRdv = (medecin) => {
    setSelectedMedecinRdv(medecin);
    setRdvDialog(true);
  };

  const closeRdvDialog = () => {
    setRdvDialog(false);
    setSelectedMedecinRdv(null);
    setRdvData({ date: '', heure: '', motif: '' });
  };

  const handleVoirDetails = (medecin) => {
    setSelectedMedecinDetails(medecin);
    setDetailsDialog(true);
  };

  const handleSubmitRdv = async () => {
    try {
      console.log('=== DÉBUT PRISE DE RENDEZ-VOUS ===');
      console.log('Données du formulaire:', rdvData);
      console.log('Médecin sélectionné:', selectedMedecinRdv);
      
      if (!rdvData.date || !rdvData.heure || !rdvData.motif) {
        console.log('❌ Champs manquants:', { date: !!rdvData.date, heure: !!rdvData.heure, motif: !!rdvData.motif });
        showSnackbar('Veuillez remplir tous les champs', 'warning');
        return;
      }

      console.log('✅ Tous les champs sont présents');
      
      setSaving(true);
      
      const requestData = {
        medecinId: selectedMedecinRdv._id,
        date: rdvData.date,
        heure: rdvData.heure,
        motif: rdvData.motif
      };
      
      console.log('Données à envoyer:', requestData);
      console.log('Token:', token ? 'Présent' : 'Absent');
      
      console.log('Envoi de la requête...');
      const response = await axios.post('http://localhost:5000/api/rdv', requestData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('✅ Réponse reçue:', response.data);

      showSnackbar('Rendez-vous pris avec succès', 'success');
      closeRdvDialog();
    } catch (error) {
      console.error('=== ERREUR LORS DE LA PRISE DE RENDEZ-VOUS ===');
      console.error('Erreur complète:', error);
      console.error('Message d\'erreur:', error.message);
      console.error('Réponse d\'erreur:', error.response?.data);
      console.error('Status:', error.response?.status);
      showSnackbar('Erreur lors de la prise de rendez-vous: ' + (error.response?.data?.message || error.message), 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      bgcolor: 'linear-gradient(135deg, #e3f0ff 0%, #f7fafd 100%)', 
      px: { xs: 1, md: 6 }, 
      py: 6 
    }}>
      {/* Header moderne avec image de spécialité */}
      <Box sx={{ 
        position: 'relative', 
        height: 280, 
        borderRadius: 6, 
        overflow: 'hidden', 
        mb: 6,
        boxShadow: '0 20px 60px 0 rgba(31,38,135,0.12)',
        background: 'linear-gradient(135deg, rgba(102,126,234,0.1) 0%, rgba(118,75,162,0.1) 100%)',
        border: '1px solid rgba(255,255,255,0.2)',
      }}>
        <Box
          component="img"
          src={specialitesImages[specialite] || 'https://images.unsplash.com/photo-1511174511562-5f97f4f4e0c8?auto=format&fit=crop&w=400&q=80'}
          alt={specialite}
          sx={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            filter: 'brightness(0.6) saturate(1.2)',
            transition: 'all 0.3s ease',
          }}
        />
        <Box sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(120deg, rgba(161,196,253,0.8) 0%, rgba(194,233,251,0.8) 50%, rgba(251,194,235,0.8) 100%)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          color: 'white',
          backdropFilter: 'blur(2px)',
        }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/dashboard')}
            sx={{
              position: 'absolute',
              top: 20,
              left: 20,
              color: '#1565C0',
              bgcolor: 'rgba(255,255,255,0.95)',
              backdropFilter: 'blur(10px)',
              borderRadius: 3,
              px: 3,
              py: 1.5,
              fontWeight: 700,
              fontSize: '0.9rem',
              textTransform: 'none',
              border: '2px solid #1565C0',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 12px rgba(21,101,192,0.3)',
              '&:hover': {
                bgcolor: '#1565C0',
                color: 'white',
                transform: 'translateY(-2px)',
                boxShadow: '0 8px 24px rgba(21,101,192,0.4)',
              }
            }}
          >
            Retour
          </Button>
          <Typography 
            variant="h2" 
            sx={{ 
              fontWeight: 900, 
              textAlign: 'center', 
              textShadow: '0 4px 16px rgba(0,0,0,0.4)',
              fontSize: { xs: '2.5rem', md: '3.5rem' },
              letterSpacing: 2,
              mb: 2,
              color: '#1565C0',
            }}
          >
            {specialite}
          </Typography>
          <Typography 
            variant="h5" 
            sx={{ 
              textAlign: 'center', 
              opacity: 0.95, 
              fontWeight: 500,
              letterSpacing: 1,
              textShadow: '0 2px 8px rgba(0,0,0,0.3)',
              color: '#1565C0',
            }}
          >
            Trouvez votre spécialiste
          </Typography>
        </Box>
      </Box>

      {/* Section de recherche moderne */}
      <Box sx={{ 
        mb: 6,
        p: 4,
        bgcolor: 'rgba(255,255,255,0.9)',
        borderRadius: 4,
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.2)',
        boxShadow: '0 12px 40px rgba(0,0,0,0.08)',
      }}>
        <Box sx={{
          mb: 3,
          p: 2,
          borderRadius: 3,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          boxShadow: '0 8px 24px rgba(102,126,234,0.3)',
          border: '1px solid rgba(255,255,255,0.2)',
        }}>
          <Typography 
            variant="h5" 
            sx={{ 
              fontWeight: 800,
              color: 'white',
              textAlign: 'center',
              letterSpacing: 1.5,
              textShadow: '0 2px 8px rgba(0,0,0,0.3)',
              fontSize: '1.5rem',
            }}
          >
            🔍 Rechercher un médecin
          </Typography>
        </Box>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Rechercher par nom de médecin..."
              value={searchNom}
              onChange={(e) => setSearchNom(e.target.value)}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 3,
                      bgcolor: 'rgba(255,255,255,0.8)',
                      border: '1px solid rgba(25,118,210,0.2)',
                      '&:hover, &.Mui-focused': {
                        borderColor: '#1976d2',
                      },
                    },
                    '& .MuiInputBase-input': {
                      fontSize: '1rem',
                      fontWeight: 500,
                      color: '#424242',
                    },
                  }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: '#1976d2', opacity: 0.7 }} />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Rechercher par adresse..."
              value={searchAdresse}
              onChange={(e) => setSearchAdresse(e.target.value)}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 3,
                      bgcolor: 'rgba(255,255,255,0.8)',
                      border: '1px solid rgba(25,118,210,0.2)',
                      '&:hover, &.Mui-focused': {
                        borderColor: '#1976d2',
                      },
                    },
                    '& .MuiInputBase-input': {
                      fontSize: '1rem',
                      fontWeight: 500,
                      color: '#424242',
                    },
                  }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LocationOnIcon sx={{ color: '#1976d2', opacity: 0.7 }} />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
        </Grid>

        {/* Résultats de recherche */}
        <Box sx={{ 
          mt: 3,
          p: 2,
          bgcolor: 'rgba(25,118,210,0.05)',
          borderRadius: 2,
          border: '1px solid rgba(25,118,210,0.1)',
        }}>
          <Typography 
            variant="body2" 
            sx={{ 
              color: '#1976d2',
              fontWeight: 600,
              textAlign: 'center'
            }}
          >
            {filteredMedecins.length} médecin{filteredMedecins.length !== 1 ? 's' : ''} trouvé{filteredMedecins.length !== 1 ? 's' : ''}
            {(searchNom || searchAdresse) && ` pour votre recherche`}
          </Typography>
        </Box>
      </Box>

      {/* Liste des médecins */}
      {loading ? (
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center', 
          justifyContent: 'center', 
          mt: 8,
          gap: 3
        }}>
          <CircularProgress 
            size={80} 
            sx={{ 
              color: '#667eea',
              '& .MuiCircularProgress-circle': {
                strokeLinecap: 'round',
              }
            }} 
          />
          <Typography 
            variant="h6" 
            sx={{ 
              color: '#1565C0',
              fontWeight: 600,
              letterSpacing: 1,
              textAlign: 'center'
            }}
          >
            Chargement des médecins...
          </Typography>
        </Box>
              ) : filteredMedecins.length === 0 ? (
        <Box sx={{ 
          textAlign: 'center', 
          mt: 8,
          p: 6,
          bgcolor: 'rgba(255,255,255,0.8)',
          borderRadius: 4,
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.2)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
        }}>
          <Typography 
            variant="h4" 
            sx={{ 
              mb: 2,
              fontWeight: 700,
              color: '#1565C0',
              letterSpacing: 1
            }}
          >
            {searchNom || searchAdresse ? 'Aucun résultat trouvé' : 'Aucun médecin trouvé'}
          </Typography>
          <Typography 
            variant="body1" 
            sx={{ 
              color: '#1565C0',
              fontSize: '1.1rem',
              lineHeight: 1.6,
              maxWidth: 500,
              mx: 'auto'
            }}
          >
            {searchNom || searchAdresse 
              ? 'Aucun médecin ne correspond à votre recherche. Essayez de modifier vos critères.'
              : 'Aucun médecin n\'est disponible pour cette spécialité pour le moment. Veuillez réessayer plus tard ou contacter l\'administration.'
            }
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={4}>
          {filteredMedecins.map((medecin, index) => (
            <Grid item xs={12} sm={6} md={4} key={`${medecin._id}-${medecin.nom}`}>
              <Card
                sx={{
                  borderRadius: 4,
                  boxShadow: '0 12px 40px 0 rgba(31,38,135,0.08)',
                  bgcolor: 'rgba(255,255,255,0.95)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                  position: 'relative',
                  overflow: 'hidden',
                  '&:hover': {
                    boxShadow: '0 24px 60px 0 rgba(25,118,210,0.15)',
                    borderColor: 'rgba(25,118,210,0.3)',
                  }
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  {/* Header avec avatar et infos principales */}
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'flex-start', 
                    mb: 3,
                    position: 'relative'
                  }}>
                    <Avatar
                      src={medecin.avatar}
                  sx={{ 
                    width: 80, 
                    height: 80, 
                    mr: 3,
                    border: '3px solid rgba(25,118,210,0.1)',
                    boxShadow: '0 8px 24px rgba(25,118,210,0.15)'
                  }}
                  >
                    {medecin.nom?.charAt(0)}
                  </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography 
                        variant="h5" 
                        sx={{ 
                          fontWeight: 800, 
                          color: '#1565C0',
                          mb: 1,
                          fontSize: '1.4rem'
                        }}
                      >
                        Dr. {medecin.nom}
                      </Typography>
                      <Chip 
                        label={medecin.specialite} 
                        color="primary" 
                        size="medium"
                        sx={{ 
                          fontWeight: 600,
                          fontSize: '0.85rem',
                          height: 28,
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          color: 'white',
                          '& .MuiChip-label': {
                            color: 'white',
                          }
                        }}
                      />
                    </Box>
                  </Box>

                  {/* Informations de contact avec icônes modernes */}
                  <Box sx={{ mb: 3 }}>
                    {medecin.adresse && (
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    mb: 2,
                    p: 1.5,
                    borderRadius: 2,
                    bgcolor: 'rgba(25,118,210,0.04)'
                  }}>
                    <LocationOnIcon sx={{ 
                      fontSize: 20, 
                      color: '#1976d2', 
                      mr: 2,
                      opacity: 0.8
                    }} />
                    <Typography variant="body2" sx={{ 
                      color: '#1565C0',
                      fontWeight: 500,
                      lineHeight: 1.4
                    }}>
                      {medecin.adresse}
                    </Typography>
                  </Box>
                    )}
                    {medecin.hopital && (
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    mb: 2,
                    p: 1.5,
                    borderRadius: 2,
                    bgcolor: 'rgba(156,39,176,0.04)'
                  }}>
                    <LocalHospitalIcon sx={{ 
                      fontSize: 20, 
                      color: '#9c27b0', 
                      mr: 2,
                      opacity: 0.8
                    }} />
                    <Typography variant="body2" sx={{ 
                      color: '#1565C0',
                      fontWeight: 500,
                      lineHeight: 1.4
                    }}>
                      {medecin.hopital}
                    </Typography>
                  </Box>
                    )}
                    {medecin.telephone && (
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    mb: 2,
                    p: 1.5,
                    borderRadius: 2,
                    bgcolor: 'rgba(76,175,80,0.04)'
                  }}>
                    <PhoneIcon sx={{ 
                      fontSize: 20, 
                      color: '#4caf50', 
                      mr: 2,
                      opacity: 0.8
                    }} />
                    <Typography variant="body2" sx={{ 
                      color: '#1565C0',
                      fontWeight: 500,
                      lineHeight: 1.4
                    }}>
                      {medecin.telephone}
                    </Typography>
                  </Box>
                    )}
                    {medecin.email && (
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    mb: 2,
                    p: 1.5,
                    borderRadius: 2,
                    bgcolor: 'rgba(255,152,0,0.04)'
                  }}>
                    <EmailIcon sx={{ 
                      fontSize: 20, 
                      color: '#ff9800', 
                      mr: 2,
                      opacity: 0.8
                    }} />
                    <Typography variant="body2" sx={{ 
                      color: '#1565C0',
                      fontWeight: 500,
                      lineHeight: 1.4
                    }}>
                      {medecin.email}
                    </Typography>
                  </Box>
                    )}
                  </Box>

                  {/* Boutons d'action modernes */}
                  <Box sx={{ 
                    display: 'flex', 
                    gap: 2,
                    mt: 'auto'
                  }}>
                    <Button
                      variant="outlined"
                      size="medium"
                      onClick={() => handleVoirDetails(medecin)}
                  sx={{ 
                    flex: 1, 
                    borderRadius: 3,
                    height: 44,
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    textTransform: 'none',
                    borderWidth: 2,
                    borderColor: 'rgba(25,118,210,0.3)',
                    color: '#1976d2',
                    '&:hover': {
                      borderColor: '#1976d2',
                      backgroundColor: 'rgba(25,118,210,0.04)'
                    }
                  }}
                    >
                      Voir détails
                    </Button>
                    <Button
                      variant="contained"
                      size="medium"
                      onClick={() => handlePrendreRdv(medecin)}
                  sx={{ 
                    flex: 1, 
                    borderRadius: 3,
                    height: 44,
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    textTransform: 'none',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)'
                    }
                  }}
                    >
                      Prendre RDV
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Dialogue de détails du médecin */}
      <Dialog 
        open={detailsDialog} 
        onClose={() => setDetailsDialog(false)} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 4,
            background: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.2)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
          }
        }}
        TransitionProps={{
          onExited: () => {
            // Nettoyage après fermeture
            setSelectedMedecinDetails(null);
          }
        }}
      >
        {selectedMedecinDetails && (
          <>
            <DialogTitle sx={{ 
              pb: 1,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              borderRadius: '4px 4px 0 0',
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar
                  src={selectedMedecinDetails.avatar}
                  sx={{ 
                    width: 60, 
                    height: 60,
                    border: '3px solid rgba(255,255,255,0.3)',
                  }}
                >
                  {selectedMedecinDetails.nom?.charAt(0)}
                </Avatar>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 800, mb: 0.5 }}>
                    Dr. {selectedMedecinDetails.nom}
                  </Typography>
                  <Chip 
                    label={selectedMedecinDetails.specialite} 
                    color="primary" 
                    size="small"
                    sx={{ 
                      background: 'rgba(255,255,255,0.2)',
                      color: 'white',
                      fontWeight: 600,
                    }}
                  />
                </Box>
              </Box>
            </DialogTitle>
            
            <DialogContent sx={{ p: 4 }}>
              <Grid container spacing={3}>
                {/* Informations de contact */}
                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ mb: 2, color: '#1565C0', fontWeight: 700 }}>
                    📞 Informations de contact
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {selectedMedecinDetails.adresse && (
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        p: 2,
                        borderRadius: 2,
                        bgcolor: 'rgba(25,118,210,0.05)',
                        border: '1px solid rgba(25,118,210,0.1)',
                      }}>
                        <LocationOnIcon sx={{ color: '#1976d2', mr: 2, fontSize: 24 }} />
                        <Box>
                          <Typography variant="subtitle2" sx={{ color: '#1976d2', fontWeight: 600, mb: 0.5 }}>
                            Adresse
                          </Typography>
                          <Typography variant="body1" sx={{ color: '#1565C0' }}>
                            {selectedMedecinDetails.adresse}
                          </Typography>
                        </Box>
                      </Box>
                    )}
                    
                    {selectedMedecinDetails.telephone && (
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        p: 2,
                        borderRadius: 2,
                        bgcolor: 'rgba(76,175,80,0.05)',
                        border: '1px solid rgba(76,175,80,0.1)',
                      }}>
                        <PhoneIcon sx={{ color: '#4caf50', mr: 2, fontSize: 24 }} />
                        <Box>
                          <Typography variant="subtitle2" sx={{ color: '#4caf50', fontWeight: 600, mb: 0.5 }}>
                            Téléphone
                          </Typography>
                          <Typography variant="body1" sx={{ color: '#1565C0' }}>
                            {selectedMedecinDetails.telephone}
                          </Typography>
                        </Box>
                      </Box>
                    )}
                    
                    {selectedMedecinDetails.email && (
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        p: 2,
                        borderRadius: 2,
                        bgcolor: 'rgba(255,152,0,0.05)',
                        border: '1px solid rgba(255,152,0,0.1)',
                      }}>
                        <EmailIcon sx={{ color: '#ff9800', mr: 2, fontSize: 24 }} />
                        <Box>
                          <Typography variant="subtitle2" sx={{ color: '#ff9800', fontWeight: 600, mb: 0.5 }}>
                            Email
                          </Typography>
                          <Typography variant="body1" sx={{ color: '#1565C0' }}>
                            {selectedMedecinDetails.email}
                          </Typography>
                        </Box>
                      </Box>
                    )}
                  </Box>
                </Grid>

                {/* Informations professionnelles */}
                {selectedMedecinDetails.bio && (
                  <Grid item xs={12}>
                    <Divider sx={{ my: 3 }} />
                    <Typography variant="h6" sx={{ mb: 2, color: '#1565C0', fontWeight: 700 }}>
                      👨‍⚕️ Biographie
                    </Typography>
                    <Box sx={{ 
                      p: 3,
                      borderRadius: 2,
                      bgcolor: 'rgba(102,126,234,0.05)',
                      border: '1px solid rgba(102,126,234,0.1)',
                    }}>
                      <Typography variant="body1" sx={{ color: '#1565C0', lineHeight: 1.6 }}>
                        {selectedMedecinDetails.bio}
                      </Typography>
                    </Box>
                  </Grid>
                )}

                {selectedMedecinDetails.formation && (
                  <Grid item xs={12}>
                    <Typography variant="h6" sx={{ mb: 2, color: '#1565C0', fontWeight: 700 }}>
                      🎓 Formation
                    </Typography>
                    <Box sx={{ 
                      p: 3,
                      borderRadius: 2,
                      bgcolor: 'rgba(118,75,162,0.05)',
                      border: '1px solid rgba(118,75,162,0.1)',
                    }}>
                      <Typography variant="body1" sx={{ color: '#1565C0', lineHeight: 1.6 }}>
                        {selectedMedecinDetails.formation}
                      </Typography>
                    </Box>
                  </Grid>
                )}

                {selectedMedecinDetails.numeroRPPS && (
                  <Grid item xs={12}>
                    <Typography variant="h6" sx={{ mb: 2, color: '#1565C0', fontWeight: 700 }}>
                      🆔 Numéro RPPS
                    </Typography>
                    <Box sx={{ 
                      p: 3,
                      borderRadius: 2,
                      bgcolor: 'rgba(156,39,176,0.05)',
                      border: '1px solid rgba(156,39,176,0.1)',
                    }}>
                      <Typography variant="body1" sx={{ color: '#1565C0', fontWeight: 600 }}>
                        {selectedMedecinDetails.numeroRPPS}
                      </Typography>
                    </Box>
                  </Grid>
                )}
              </Grid>
            </DialogContent>
            
            <DialogActions sx={{ p: 3, gap: 2 }}>
              <Button 
                onClick={() => setDetailsDialog(false)}
                variant="outlined"
                sx={{ 
                  borderRadius: 2,
                  borderColor: '#1565C0',
                  color: '#1565C0',
                  '&:hover': {
                    borderColor: '#1565C0',
                    backgroundColor: 'rgba(21,101,192,0.04)',
                  }
                }}
              >
                Fermer
              </Button>
              <Button 
                onClick={() => {
                  const med = selectedMedecinDetails;
                  setDetailsDialog(false);
                  handlePrendreRdv(med);
                }}
                variant="contained"
                sx={{ 
                  borderRadius: 2,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                  }
                }}
              >
                Prendre RDV
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Modal de prise de rendez-vous */}
      <Dialog 
        open={rdvDialog} 
        onClose={closeRdvDialog}
        keepMounted
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
          }
        }}
        TransitionProps={{
          onExited: () => {
            // Nettoyage après fermeture
            setSelectedMedecinRdv(null);
            setRdvData({ date: '', heure: '', motif: '' });
          }
        }}
      >
        {selectedMedecinRdv && (
          <>
            <DialogTitle sx={{ 
              pb: 1,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              textAlign: 'center'
            }}>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                📅 Prendre un Rendez-vous
              </Typography>
              <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
                Dr. {selectedMedecinRdv.nom} - {selectedMedecinRdv.specialite}
              </Typography>
            </DialogTitle>
            
            <DialogContent sx={{ p: 4 }}>
              <Grid container spacing={3}>
                {/* Date */}
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Date du rendez-vous"
                    type="date"
                    value={rdvData.date}
                    onChange={(e) => setRdvData({ ...rdvData, date: e.target.value })}
                    InputLabelProps={{ shrink: true }}
                    inputProps={{
                      min: new Date().toISOString().split('T')[0] // Date d'aujourd'hui
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                      },
                    }}
                  />
                </Grid>

                {/* Heure */}
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Heure du rendez-vous</InputLabel>
                    <Select
                      value={rdvData.heure}
                      onChange={(e) => setRdvData({ ...rdvData, heure: e.target.value })}
                      label="Heure du rendez-vous"
                      sx={{
                        borderRadius: 2,
                      }}
                    >
                      <MenuItem value="08:00">08:00</MenuItem>
                      <MenuItem value="08:30">08:30</MenuItem>
                      <MenuItem value="09:00">09:00</MenuItem>
                      <MenuItem value="09:30">09:30</MenuItem>
                      <MenuItem value="10:00">10:00</MenuItem>
                      <MenuItem value="10:30">10:30</MenuItem>
                      <MenuItem value="11:00">11:00</MenuItem>
                      <MenuItem value="11:30">11:30</MenuItem>
                      <MenuItem value="12:00">12:00</MenuItem>
                      <MenuItem value="12:30">12:30</MenuItem>
                      <MenuItem value="13:00">13:00</MenuItem>
                      <MenuItem value="13:30">13:30</MenuItem>
                      <MenuItem value="14:00">14:00</MenuItem>
                      <MenuItem value="14:30">14:30</MenuItem>
                      <MenuItem value="15:00">15:00</MenuItem>
                      <MenuItem value="15:30">15:30</MenuItem>
                      <MenuItem value="16:00">16:00</MenuItem>
                      <MenuItem value="16:30">16:30</MenuItem>
                      <MenuItem value="17:00">17:00</MenuItem>
                      <MenuItem value="17:30">17:30</MenuItem>
                      <MenuItem value="18:00">18:00</MenuItem>
                      <MenuItem value="18:30">18:30</MenuItem>
                      <MenuItem value="19:00">19:00</MenuItem>
                      <MenuItem value="19:30">19:30</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                {/* Motif */}
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Motif de la consultation"
                    multiline
                    rows={3}
                    value={rdvData.motif}
                    onChange={(e) => setRdvData({ ...rdvData, motif: e.target.value })}
                    placeholder="Décrivez brièvement le motif de votre consultation..."
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                      },
                    }}
                  />
                </Grid>
              </Grid>
            </DialogContent>
            
            <DialogActions sx={{ p: 3, gap: 2 }}>
              <Button 
                onClick={closeRdvDialog}
                variant="outlined"
                disabled={saving}
                sx={{ 
                  borderRadius: 2,
                  borderColor: '#1565C0',
                  color: '#1565C0',
                  '&:hover': {
                    borderColor: '#1565C0',
                    backgroundColor: 'rgba(21,101,192,0.04)',
                  }
                }}
              >
                Annuler
              </Button>
              <Button 
                onClick={handleSubmitRdv}
                variant="contained"
                disabled={saving}
                startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <span />}
                sx={{ 
                  borderRadius: 2,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                  }
                }}
              >
                {saving ? 'Prise en cours...' : 'Confirmer le RDV'}
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default MedecinsParSpecialitePage; 