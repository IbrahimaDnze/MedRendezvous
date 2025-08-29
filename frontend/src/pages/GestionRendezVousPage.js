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
import InputAdornment from '@mui/material/InputAdornment';
import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import { useSnackbar } from '../components/GlobalSnackbar';
import SearchIcon from '@mui/icons-material/Search';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import ScheduleIcon from '@mui/icons-material/Schedule';
import DeleteIcon from '@mui/icons-material/Delete';
import NotificationsIcon from '@mui/icons-material/Notifications';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';

const GestionRendezVousPage = () => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [rdvs, setRdvs] = useState([]);
  const [filteredRdvs, setFilteredRdvs] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('tous');
  const [dateFilter, setDateFilter] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const { showSnackbar } = useSnackbar();

  const fetchRendezVous = useCallback(async () => {
    try {
      setLoading(true);
      
      // Appel API réel pour récupérer les RDV
      const response = await axios.get('http://localhost:5000/api/rdv/mes', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setRdvs(response.data.rdvs || []);
      setLoading(false);
    } catch (error) {
      console.error('Erreur lors du chargement des rendez-vous:', error);
      showSnackbar('Erreur lors du chargement des rendez-vous', 'error');
      setLoading(false);
    }
  }, [token, showSnackbar]);

  useEffect(() => {
    fetchRendezVous();
  }, [fetchRendezVous]);

  const filterRendezVous = useCallback(() => {
    let filtered = rdvs;

    // Filtre par statut
    if (statusFilter !== 'tous') {
      filtered = filtered.filter(rdv => rdv.statut === statusFilter);
    }

    // Filtre par date
    if (dateFilter) {
      filtered = filtered.filter(rdv => 
        new Date(rdv.date).toISOString().split('T')[0] === dateFilter
      );
    }

    // Filtre par recherche
    if (search) {
      filtered = filtered.filter(rdv => 
        rdv.patient?.nom?.toLowerCase().includes(search.toLowerCase()) ||
        rdv.motif?.toLowerCase().includes(search.toLowerCase()) ||
        rdv.heure.includes(search)
      );
    }

    setFilteredRdvs(filtered);
  }, [rdvs, statusFilter, dateFilter, search]);

  useEffect(() => {
    filterRendezVous();
  }, [filterRendezVous]);

  const handleConfirmerRdv = async (rdvId) => {
    try {
      console.log('=== CONFIRMATION RENDEZ-VOUS ===');
      console.log('ID du RDV à confirmer:', rdvId);
      console.log('Token:', token ? 'Présent' : 'Absent');
      
      console.log('Envoi de la requête de confirmation...');
      const response = await axios.put(`${API_BASE_URL}/api/rdv/${rdvId}/confirmer`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('✅ Réponse de confirmation:', response.data);
      showSnackbar('Rendez-vous confirmé avec succès', 'success');
      fetchRendezVous();
    } catch (error) {
      console.error('=== ERREUR LORS DE LA CONFIRMATION ===');
      console.error('Erreur complète:', error);
      console.error('Message d\'erreur:', error.message);
      console.error('Réponse d\'erreur:', error.response?.data);
      console.error('Status:', error.response?.status);
      showSnackbar('Erreur lors de la confirmation: ' + (error.response?.data?.message || error.message), 'error');
    }
  };

  const handleAnnulerRdv = async (rdvId) => {
    try {
      console.log('=== ANNULATION RENDEZ-VOUS ===');
      console.log('ID du RDV à annuler:', rdvId);
      console.log('Token:', token ? 'Présent' : 'Absent');
      
      console.log('Envoi de la requête d\'annulation...');
      const response = await axios.put(`${API_BASE_URL}/api/rdv/${rdvId}/annuler`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('✅ Réponse d\'annulation:', response.data);
      showSnackbar('Rendez-vous annulé avec succès', 'success');
      fetchRendezVous();
    } catch (error) {
      console.error('=== ERREUR LORS DE L\'ANNULATION ===');
      console.error('Erreur complète:', error);
      console.error('Message d\'erreur:', error.message);
      console.error('Réponse d\'erreur:', error.response?.data);
      console.error('Status:', error.response?.status);
      showSnackbar('Erreur lors de l\'annulation: ' + (error.response?.data?.message || error.message), 'error');
    }
  };

  const handleSupprimerRdv = async (rdvId) => {
    try {
      console.log('=== SUPPRESSION RENDEZ-VOUS ===');
      console.log('ID du RDV à supprimer:', rdvId);
      console.log('Token:', token ? 'Présent' : 'Absent');
      
      console.log('Envoi de la requête de suppression...');
      const response = await axios.delete(`${API_BASE_URL}/api/rdv/${rdvId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('✅ Réponse de suppression:', response.data);
      showSnackbar('Rendez-vous supprimé avec succès', 'success');
      fetchRendezVous();
    } catch (error) {
      console.error('=== ERREUR LORS DE LA SUPPRESSION ===');
      console.error('Erreur complète:', error);
      console.error('Message d\'erreur:', error.message);
      console.error('Réponse d\'erreur:', error.response?.data);
      console.error('Status:', error.response?.status);
      showSnackbar('Erreur lors de la suppression: ' + (error.response?.data?.message || error.message), 'error');
    }
  };

  const handleEnvoyerRappel = async (rdvId) => {
    try {
      console.log('=== ENVOI RAPPEL RENDEZ-VOUS ===');
      console.log('ID du RDV pour rappel:', rdvId);
      
      await axios.post(`${API_BASE_URL}/api/rdv/${rdvId}/rappeler`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('✅ Rappel envoyé avec succès');
      showSnackbar('Rappel envoyé au patient avec succès', 'success');
    } catch (error) {
      console.error('❌ Erreur lors de l\'envoi du rappel:', error);
      const message = error.response?.data?.message || 'Erreur lors de l\'envoi du rappel';
      showSnackbar(message, 'error');
    }
  };

  const getStatutColor = (statut) => {
    switch (statut) {
      case 'confirmé': return 'success';
      case 'en attente': return 'warning';
      case 'annulé': return 'error';
      default: return 'default';
    }
  };

  const getStatutIcon = (statut) => {
    switch (statut) {
      case 'confirmé': return <CheckCircleIcon />;
      case 'en attente': return <ScheduleIcon />; // Changed from PendingIcon
      case 'annulé': return <CancelIcon />;
      default: return <ScheduleIcon />;
    }
  };

  const getRdvsByStatus = (status) => {
    if (status === 'tous') return filteredRdvs;
    return filteredRdvs.filter(rdv => rdv.statut === status);
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    const statusMap = ['tous', 'en attente', 'confirmé', 'annulé'];
    setStatusFilter(statusMap[newValue]);
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
          Gestion des Rendez-vous
        </Typography>
        <Typography variant="h6" sx={{ 
          color: 'rgba(255,255,255,0.9)', 
          fontWeight: 500,
          letterSpacing: 1
        }}>
          Gérez vos consultations et patients
        </Typography>
      </Box>

      {/* Filtres et recherche */}
      <Card sx={{
        borderRadius: 4,
        bgcolor: 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
        mb: 4
      }}>
        <CardContent>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Rechercher un patient"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon color="primary" />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 3,
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Statut</InputLabel>
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  label="Statut"
                >
                  <MenuItem value="tous">Tous</MenuItem>
                  <MenuItem value="en attente">En attente</MenuItem>
                  <MenuItem value="confirmé">Confirmés</MenuItem>
                  <MenuItem value="annulé">Annulés</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                type="date"
                label="Date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 3,
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                variant="outlined"
                fullWidth
                startIcon={<ScheduleIcon />} // Changed from FilterListIcon
                onClick={() => {
                  setSearch('');
                  setStatusFilter('tous');
                  setDateFilter('');
                }}
                sx={{ borderRadius: 3, py: 1.5 }}
              >
                Réinitialiser
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Onglets */}
      <Box sx={{ mb: 4 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            bgcolor: 'rgba(255,255,255,0.95)',
            borderRadius: 3,
            px: 2,
            '& .MuiTab-root': {
              fontWeight: 600,
              textTransform: 'none',
              fontSize: 16,
            },
          }}
        >
          <Tab label={`Tous (${filteredRdvs.length})`} />
          <Tab label={`En attente (${getRdvsByStatus('en attente').length})`} />
          <Tab label={`Confirmés (${getRdvsByStatus('confirmé').length})`} />
          <Tab label={`Annulés (${getRdvsByStatus('annulé').length})`} />
        </Tabs>
      </Box>

      {/* Liste des rendez-vous */}
      <Card sx={{
        borderRadius: 4,
        bgcolor: 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
        minHeight: 400
      }}>
        <CardContent>
          {filteredRdvs.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <ScheduleIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                Aucun rendez-vous trouvé
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {search || statusFilter !== 'tous' || dateFilter 
                  ? 'Essayez de modifier vos filtres de recherche'
                  : 'Aucun rendez-vous pour le moment'
                }
              </Typography>
            </Box>
          ) : (
            <List>
              {filteredRdvs.map((rdv) => (
                <ListItem key={rdv._id} sx={{
                  border: '1px solid #e0e0e0',
                  borderRadius: 3,
                  mb: 2,
                  bgcolor: 'rgba(255,255,255,0.7)',
                  transition: 'all 0.2s',
                  '&:hover': {
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    transform: 'translateY(-2px)'
                  }
                }}>
                  <ListItemAvatar>
                    <Avatar 
                      src={rdv.patient?.avatar || undefined}
                      sx={{ 
                        bgcolor: rdv.patient?.avatar ? 'transparent' : 'primary.main',
                        width: 56,
                        height: 56,
                        border: '2px solid #e3f0ff'
                      }}
                    >
                      {!rdv.patient?.avatar && (rdv.patient?.nom?.charAt(0) || 'P')}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>
                          {rdv.patient?.nom || 'Patient'}
                        </Typography>
                        <Chip
                          icon={getStatutIcon(rdv.statut)}
                          label={rdv.statut}
                          color={getStatutColor(rdv.statut)}
                          size="small"
                        />
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          <strong>Date :</strong> {new Date(rdv.date).toLocaleDateString('fr-FR')} à {rdv.heure}
                        </Typography>
                        {rdv.motif && (
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            <strong>Motif :</strong> {rdv.motif}
                          </Typography>
                        )}
                        <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                          {/* Removed EmailIcon and PhoneIcon as they were not imported */}
                        </Box>
                      </Box>
                    }
                  />
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, minWidth: 120 }}>
                    {rdv.statut === 'en attente' && (
                      <>
                        <Button
                          size="small"
                          variant="contained"
                          color="success"
                          onClick={() => handleConfirmerRdv(rdv._id)}
                          sx={{ borderRadius: 2, fontWeight: 600 }}
                        >
                          Confirmer
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          color="error"
                          onClick={() => handleAnnulerRdv(rdv._id)}
                          sx={{ borderRadius: 2, fontWeight: 600 }}
                        >
                          Annuler
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          color="error"
                          startIcon={<DeleteIcon />}
                          onClick={() => handleSupprimerRdv(rdv._id)}
                          sx={{ borderRadius: 2, fontWeight: 600 }}
                        >
                          Supprimer
                        </Button>
                      </>
                    )}
                    {rdv.statut === 'confirmé' && (
                      <>
                        <Button
                          size="small"
                          variant="contained"
                          color="info"
                          startIcon={<NotificationsIcon />}
                          onClick={() => handleEnvoyerRappel(rdv._id)}
                          sx={{ borderRadius: 2, fontWeight: 600 }}
                        >
                          Envoyer Rappel
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          color="error"
                          onClick={() => handleAnnulerRdv(rdv._id)}
                          sx={{ borderRadius: 2, fontWeight: 600 }}
                        >
                          Annuler
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          color="error"
                          startIcon={<DeleteIcon />}
                          onClick={() => handleSupprimerRdv(rdv._id)}
                          sx={{ borderRadius: 2, fontWeight: 600 }}
                        >
                          Supprimer
                        </Button>
                      </>
                    )}
                    {rdv.statut === 'annulé' && (
                      <Button
                        size="small"
                        variant="outlined"
                        color="error"
                        startIcon={<DeleteIcon />}
                        onClick={() => handleSupprimerRdv(rdv._id)}
                        sx={{ borderRadius: 2, fontWeight: 600 }}
                      >
                        Supprimer
                      </Button>
                    )}
                  </Box>
                </ListItem>
              ))}
            </List>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default GestionRendezVousPage; 