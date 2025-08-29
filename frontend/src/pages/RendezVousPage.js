import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from '../config/api';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import SearchIcon from '@mui/icons-material/Search';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import EventIcon from '@mui/icons-material/Event';
import { useSnackbar } from '../components/GlobalSnackbar';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';

const RendezVousPage = () => {
  const { token } = useAuth();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [medecins, setMedecins] = useState([]);
  const [filteredMedecins, setFilteredMedecins] = useState([]);
  const [search, setSearch] = useState('');
  const [specialiteFilter, setSpecialiteFilter] = useState('');
  const [selectedMedecin, setSelectedMedecin] = useState(null);
  const [rdvDialog, setRdvDialog] = useState(false);
  const [apiSpecialites, setApiSpecialites] = useState([]);
  useEffect(() => {
    const fetchSpecs = async () => {
      try {
        const r = await axios.get('http://localhost:5000/api/specialites');
        setApiSpecialites(r.data.specialites || []);
      } catch (e) {
        setApiSpecialites([]);
      }
    };
    fetchSpecs();
  }, []);
  const [rdvData, setRdvData] = useState({
    date: '',
    heure: '',
    motif: ''
  });
  const { showSnackbar } = useSnackbar();

  const specialites = [
    'Cardiologie', 'Dermatologie', 'Endocrinologie', 'Gastro-entérologie',
    'Gynécologie', 'Neurologie', 'Ophtalmologie', 'Orthopédie',
    'Oto-rhino-laryngologie', 'Pédiatrie', 'Psychiatrie', 'Pneumologie',
    'Rhumatologie', 'Urologie', 'Chirurgie générale', 'Chirurgie orthopédique'
  ];

  const heures = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
    '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30'
  ];

  const fetchMedecins = useCallback(async () => {
    try {
      setLoading(true);
      
      // Récupérer le médecin spécifique depuis l'URL
      const medecinId = searchParams.get('medecin');
      
      if (medecinId) {
        console.log('Médecin spécifique demandé:', medecinId);
        
        let medecin;
        try {
          // Récupérer le médecin spécifique
          const response = await axios.get(`http://localhost:5000/api/medecins/${medecinId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          medecin = response.data.medecin;
          // Normaliser l'ID (_id pour la cohérence)
          medecin = { ...medecin, _id: medecin._id || medecin.id };
          console.log('Médecin récupéré:', medecin);
        } catch (error) {
          console.error('Erreur lors de la récupération du médecin:', error);
          showSnackbar('Erreur lors de la récupération du médecin', 'error');
          setLoading(false);
          return;
        }
        
        // Vérifier les disponibilités du médecin
        const aujourdhui = new Date();
        const jourSemaine = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'][aujourdhui.getDay()];
        
        if (medecin.disponibilites && medecin.disponibilites.length > 0) {
          const dispoAujourdhui = medecin.disponibilites.find(d => d.jour === jourSemaine);
          if (dispoAujourdhui) {
            const maintenant = new Date();
            const heureActuelle = maintenant.getHours() + ':' + String(maintenant.getMinutes()).padStart(2, '0');
            
            if (heureActuelle < dispoAujourdhui.heureFin) {
              medecin.disponibilite = dispoAujourdhui;
              setMedecins([medecin]);
            } else {
              setMedecins([]); // Ne pas afficher le médecin si l'heure est dépassée
            }
          } else {
            setMedecins([]); // Ne pas afficher le médecin s'il n'est pas disponible aujourd'hui
          }
        } else {
          setMedecins([]); // Ne pas afficher le médecin s'il n'a pas de disponibilités
        }
      } else {
        // Récupérer tous les médecins (comportement par défaut)
        const response = await axios.get('http://localhost:5000/api/users/medecins', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const tousMedecins = response.data.medecins || [];
        
        // Filtrer pour ne garder que les médecins disponibles aujourd'hui
        const aujourdhui = new Date();
        const jourSemaine = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'][aujourdhui.getDay()];
        
        // Filtrer les médecins disponibles aujourd'hui
        const medecinsDisponibles = tousMedecins.filter(medecin => {
          // Si le médecin n'a pas de disponibilités définies, on le considère comme non disponible
          if (!medecin.disponibilites || medecin.disponibilites.length === 0) {
            console.log(`Médecin ${medecin.nom} n'a pas de disponibilités définies`);
            return false;
          }
          
          // Chercher la disponibilité pour aujourd'hui
          const dispoAujourdhui = medecin.disponibilites.find(d => d.jour === jourSemaine);
          
          if (!dispoAujourdhui) {
            console.log(`Médecin ${medecin.nom} n'est pas disponible le ${jourSemaine}`);
            return false;
          }
          
          // Vérifier si le médecin a des créneaux disponibles aujourd'hui
          const maintenant = new Date();
          const heureActuelle = maintenant.getHours() + ':' + String(maintenant.getMinutes()).padStart(2, '0');
          
          console.log(`Médecin ${medecin.nom}: heure actuelle ${heureActuelle}, fin disponibilité ${dispoAujourdhui.heureFin}`);
          
          // Si l'heure actuelle est avant la fin de la disponibilité, le médecin est disponible
          if (heureActuelle < dispoAujourdhui.heureFin) {
            console.log(`Médecin ${medecin.nom} est disponible aujourd'hui`);
            return true;
          } else {
            console.log(`Médecin ${medecin.nom} n'est plus disponible aujourd'hui (heure dépassée)`);
            return false;
          }
        }).map(medecin => {
          const dispoAujourdhui = medecin.disponibilites.find(d => d.jour === jourSemaine);
          return {
            ...medecin,
            disponibilite: dispoAujourdhui
          };
        });
        
        console.log(`Médecins disponibles aujourd'hui: ${medecinsDisponibles.length}/${tousMedecins.length}`);
        setMedecins(medecinsDisponibles);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Erreur lors du chargement des médecins:', error);
      showSnackbar('Erreur lors du chargement des médecins', 'error');
      setLoading(false);
    }
  }, [token, showSnackbar, searchParams]);

  useEffect(() => {
    fetchMedecins();
  }, [fetchMedecins]);

  // Pré-sélectionner le médecin si spécifié dans l'URL
  useEffect(() => {
    const medecinId = searchParams.get('medecin');
    if (medecinId && medecins.length > 0) {
      const medecin = medecins.find(m => (m._id === medecinId) || (m.id === medecinId));
      if (medecin) {
        setSelectedMedecin(medecin);
        setRdvDialog(true);
      }
    }
  }, [searchParams, medecins]);



  const filterMedecins = useCallback(() => {
    let filtered = medecins;

    // Filtre par spécialité
    if (specialiteFilter) {
      filtered = filtered.filter(medecin => medecin.specialite === specialiteFilter);
    }

    // Filtre par recherche
    if (search) {
      filtered = filtered.filter(medecin => 
        medecin.nom.toLowerCase().includes(search.toLowerCase()) ||
        medecin.specialite.toLowerCase().includes(search.toLowerCase()) ||
        medecin.adresse.toLowerCase().includes(search.toLowerCase())
      );
    }

    setFilteredMedecins(filtered);
  }, [medecins, search, specialiteFilter]);

  useEffect(() => {
    filterMedecins();
  }, [filterMedecins]);

  const handlePrendreRdv = (medecin) => {
    setSelectedMedecin(medecin);
    setRdvDialog(true);
  };

  const closeRdvDialog = () => {
    // D'abord, réinitialiser les données du formulaire
    setRdvData({ date: '', heure: '', motif: '' });
    // Ensuite, fermer le dialogue
    setRdvDialog(false);
    // Enfin, réinitialiser le médecin sélectionné après la fermeture du dialogue
    setTimeout(() => {
      setSelectedMedecin(null);
    }, 300);
  };

  const handleSubmitRdv = async () => {
    try {
      console.log('=== DÉBUT PRISE DE RENDEZ-VOUS ===');
      console.log('Données du formulaire:', rdvData);
      console.log('Médecin sélectionné:', selectedMedecin);
      
      if (!rdvData.date || !rdvData.heure || !rdvData.motif) {
        console.log('❌ Champs manquants:', { date: !!rdvData.date, heure: !!rdvData.heure, motif: !!rdvData.motif });
        showSnackbar('Veuillez remplir tous les champs', 'warning');
        return;
      }

      console.log('✅ Tous les champs sont présents');
      
      const requestData = {
        medecinId: selectedMedecin._id || selectedMedecin.id,
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
    }
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
      background: 'linear-gradient(120deg, #a1c4fd 0%, #c2e9fb 50%, #fbc2eb 100%)',
      position: 'relative',
      overflowX: 'hidden',
    }}>
      {/* En-tête */}
      <Box sx={{ mb: 6, textAlign: 'center' }}>
        <Typography variant="h3" sx={{ 
          fontWeight: 900, 
          color: '#2a3eb1', 
          fontSize: { xs: 28, md: 42 }, 
          letterSpacing: 2,
          textShadow: '0 4px 16px #c2e9fb',
          mb: 2
        }}>
          {searchParams.get('medecin') && medecins.length === 1 
            ? `Rendez-vous avec Dr. ${medecins[0].nom}`
            : 'Prendre un Rendez-vous'
          }
        </Typography>
        <Typography variant="h6" sx={{ 
          color: '#4f4f4f', 
          fontWeight: 500,
          letterSpacing: 1,
          mb: 2
        }}>
          {searchParams.get('medecin') && medecins.length === 1
            ? `${medecins[0].specialite} - ${medecins[0].adresse}`
            : 'Trouvez le spécialiste qui vous convient'
          }
        </Typography>
        {!searchParams.get('medecin') && (
          <Box sx={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: 1,
            bgcolor: 'rgba(255,255,255,0.2)',
            px: 3,
            py: 1,
            borderRadius: 3,
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.3)'
          }}>
            <EventIcon sx={{ color: '#2a3eb1', fontSize: 20 }} />
            <Typography variant="body2" sx={{ color: '#2a3eb1', fontWeight: 600 }}>
              Médecins disponibles aujourd'hui uniquement ({new Date().toLocaleDateString('fr-FR', { weekday: 'long' })})
            </Typography>
          </Box>
        )}
      </Box>

      {/* Filtres - seulement si pas de médecin spécifique */}
      {!searchParams.get('medecin') && (
        <Box sx={{ mb: 4 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
                              <TextField
                  fullWidth
                  placeholder="Rechercher un médecin..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ color: '#2a3eb1' }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 3,
                      bgcolor: 'rgba(255,255,255,0.95)',
                      border: '2px solid #a1c4fd',
                      '&:hover': {
                        borderColor: '#2a3eb1',
                      },
                      '&.Mui-focused': {
                        borderColor: '#2a3eb1',
                        boxShadow: '0 0 0 2px rgba(42, 62, 177, 0.2)',
                      },
                    },
                    '& .MuiInputLabel-root': {
                      color: '#2a3eb1',
                      fontWeight: 600,
                    },
                  }}
                />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel sx={{ color: '#2a3eb1', fontWeight: 600 }}>Spécialité</InputLabel>
                <Select
                  value={specialiteFilter}
                  onChange={(e) => setSpecialiteFilter(e.target.value)}
                  label="Spécialité"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 3,
                      bgcolor: 'rgba(255,255,255,0.95)',
                      border: '2px solid #a1c4fd',
                      '&:hover': {
                        borderColor: '#2a3eb1',
                      },
                      '&.Mui-focused': {
                        borderColor: '#2a3eb1',
                        boxShadow: '0 0 0 2px rgba(42, 62, 177, 0.2)',
                      },
                    },
                    '& .MuiSelect-icon': {
                      color: '#2a3eb1',
                    },
                  }}
                >
                  <MenuItem value="">Toutes les spécialités</MenuItem>
                  {apiSpecialites.map((s) => (
                    <MenuItem key={s._id} value={s.name}>
                      {s.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Box>
      )}

      {/* Liste des médecins */}
      {filteredMedecins.length === 0 ? (
        <Box sx={{ 
          width: '100%', 
          textAlign: 'center', 
          py: 8,
          bgcolor: 'rgba(255,255,255,0.9)',
          borderRadius: 4,
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.2)'
        }}>
          <EventIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h5" sx={{ color: 'text.secondary', mb: 2, fontWeight: 600 }}>
            Aucun médecin disponible aujourd'hui
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary', maxWidth: 500, mx: 'auto', mb: 3 }}>
            Il n'y a actuellement aucun médecin disponible pour aujourd'hui. 
            Veuillez réessayer demain ou consulter les autres jours de la semaine.
          </Typography>
          <Box sx={{ 
            bgcolor: 'rgba(255,193,7,0.1)', 
            p: 2, 
            borderRadius: 2, 
            border: '1px solid rgba(255,193,7,0.3)',
            maxWidth: 600,
            mx: 'auto'
          }}>
            <Typography variant="body2" sx={{ color: 'text.secondary', fontFamily: 'monospace' }}>
              Debug: {medecins.length} médecins au total, {filteredMedecins.length} filtrés
            </Typography>
          </Box>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {filteredMedecins.map((medecin) => (
          <Grid item xs={12} md={6} lg={4} key={medecin._id || medecin.id}>
            <Card sx={{
              borderRadius: 4,
              bgcolor: 'rgba(255,255,255,0.95)',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 12px 40px 0 rgba(31, 38, 135, 0.25)',
              },
            }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar
                    src={medecin.avatar}
                    sx={{ width: 60, height: 60, mr: 2, bgcolor: 'primary.main' }}
                  >
                    {medecin.nom.charAt(0)}
                  </Avatar>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
                      Dr. {medecin.nom}
                    </Typography>
                    <Chip 
                      label={medecin.specialite} 
                      color="secondary" 
                      size="small"
                      sx={{ mt: 0.5 }}
                    />
                  </Box>
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <LocationOnIcon sx={{ mr: 1, color: 'text.secondary', fontSize: 20 }} />
                    <Typography variant="body2" color="text.secondary">
                      {medecin.adresse}
                    </Typography>
                  </Box>
                  {medecin.hopital && (
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <LocalHospitalIcon sx={{ mr: 1, color: 'text.secondary', fontSize: 20 }} />
                      <Typography variant="body2" color="text.secondary">
                        {medecin.hopital}
                      </Typography>
                    </Box>
                  )}
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <PhoneIcon sx={{ mr: 1, color: 'text.secondary', fontSize: 20 }} />
                    <Typography variant="body2" color="text.secondary">
                      {medecin.telephone}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <EmailIcon sx={{ mr: 1, color: 'text.secondary', fontSize: 20 }} />
                    <Typography variant="body2" color="text.secondary">
                      {medecin.email}
                    </Typography>
                  </Box>
                </Box>

                {medecin.bio && (
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {medecin.bio.substring(0, 100)}...
                  </Typography>
                )}

                {/* Informations de disponibilité */}
                {medecin.disponibilite && (
                  <Box sx={{ 
                    mt: 2, 
                    p: 2, 
                    bgcolor: 'rgba(76,175,80,0.1)', 
                    borderRadius: 2,
                    border: '1px solid rgba(76,175,80,0.2)'
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <EventIcon sx={{ mr: 1, color: 'success.main', fontSize: 18 }} />
                      <Typography variant="subtitle2" sx={{ color: 'success.main', fontWeight: 600 }}>
                        Disponible aujourd'hui
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {medecin.disponibilite.heureDebut} - {medecin.disponibilite.heureFin}
                    </Typography>
                  </Box>
                )}
              </CardContent>
              <CardActions>
                <Button
                  fullWidth
                  variant="contained"
                  color="primary"
                  onClick={() => handlePrendreRdv(medecin)}
                  sx={{ borderRadius: 2, fontWeight: 600 }}
                >
                  Prendre RDV
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
        </Grid>
      )}

      {/* Dialog de prise de rendez-vous */}
      <Dialog open={rdvDialog} onClose={closeRdvDialog} keepMounted maxWidth="sm" fullWidth>
        <DialogTitle>
          Prendre rendez-vous avec Dr. {selectedMedecin?.nom}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Date"
                type="date"
                value={rdvData.date}
                onChange={(e) => setRdvData({ ...rdvData, date: e.target.value })}
                InputLabelProps={{ shrink: true }}
                inputProps={{
                  min: new Date().toISOString().split('T')[0] // Date d'aujourd'hui
                }}
                helperText="Sélectionnez une date à partir d'aujourd'hui"
                FormHelperTextProps={{
                  sx: { color: 'text.secondary', fontSize: '0.75rem' }
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Heure</InputLabel>
                <Select
                  value={rdvData.heure}
                  onChange={(e) => setRdvData({ ...rdvData, heure: e.target.value })}
                  label="Heure"
                >
                  {heures.map((heure) => (
                    <MenuItem key={heure} value={heure}>
                      {heure}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Motif de consultation"
                multiline
                rows={3}
                value={rdvData.motif}
                onChange={(e) => setRdvData({ ...rdvData, motif: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeRdvDialog} color="inherit">
            Annuler
          </Button>
          <Button onClick={handleSubmitRdv} variant="contained" color="primary">
            Confirmer le RDV
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RendezVousPage;