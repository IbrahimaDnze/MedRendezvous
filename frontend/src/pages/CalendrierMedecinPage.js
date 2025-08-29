import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import API_BASE_URL from '../config/api';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Avatar from '@mui/material/Avatar';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import TodayIcon from '@mui/icons-material/Today';
import EventIcon from '@mui/icons-material/Event';
import ScheduleIcon from '@mui/icons-material/Schedule';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import CancelIcon from '@mui/icons-material/Cancel';
import AddIcon from '@mui/icons-material/Add';
import { useSnackbar } from '../components/GlobalSnackbar';

const CalendrierMedecinPage = () => {
  const { token, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [rdvs, setRdvs] = useState([]);
  const [disponibilites, setDisponibilites] = useState([]);
  const [view, setView] = useState('month'); // 'month', 'week', 'day'
  const [selectedRdv, setSelectedRdv] = useState(null);
  const [showRdvDialog, setShowRdvDialog] = useState(false);
  const [showDispoDialog, setShowDispoDialog] = useState(false);
  const [newDispo, setNewDispo] = useState({
    jour: '',
    heureDebut: '',
    heureFin: ''
  });
  const { showSnackbar } = useSnackbar();

  useEffect(() => {
    fetchData();
  }, [currentDate]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Récupérer les rendez-vous du médecin
      const rdvsResponse = await axios.get('http://localhost:5000/api/rdv/mes', {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Conversion des dates string en objets Date
      const rdvsData = (rdvsResponse.data.rdvs || []).map(rdv => ({
        ...rdv,
        date: new Date(rdv.date)
      }));
      
      // Récupérer les disponibilités du médecin
      const disposResponse = await axios.get('http://localhost:5000/api/users/disponibilites', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setRdvs(rdvsData);
      setDisponibilites(disposResponse.data.disponibilites || []);
      setLoading(false);
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      showSnackbar('Erreur lors du chargement des données', 'error');
      setLoading(false);
    }
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();

    const days = [];
    for (let i = 0; i < startingDay; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };

  const getRdvsForDate = (date) => {
    return rdvs.filter(rdv => 
      rdv.date.toDateString() === date.toDateString()
    );
  };

  const handleDateClick = (date) => {
    setSelectedDate(date);
    const rdvsForDate = getRdvsForDate(date);
    if (rdvsForDate.length > 0) {
      setSelectedRdv(rdvsForDate[0]);
      setShowRdvDialog(true);
    }
  };

  const handleConfirmerRdv = async (rdvId) => {
    try {
      await axios.put(`${API_BASE_URL}/api/rdv/${rdvId}/confirmer`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showSnackbar('Rendez-vous confirmé', 'success');
      fetchData();
      setShowRdvDialog(false);
    } catch (error) {
      showSnackbar('Erreur lors de la confirmation', 'error');
    }
  };

  const handleAnnulerRdv = async (rdvId) => {
    try {
      await axios.patch(`${API_BASE_URL}/api/rdv/annuler/${rdvId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showSnackbar('Rendez-vous annulé', 'success');
      fetchData();
      setShowRdvDialog(false);
    } catch (error) {
      showSnackbar('Erreur lors de l\'annulation', 'error');
    }
  };

  const handleAddDispo = async () => {
    try {
      const newDispoObj = { ...newDispo };
      const updatedDisponibilites = [...disponibilites, newDispoObj];
      await axios.put(`${API_BASE_URL}/api/users/disponibilites`, { disponibilites: updatedDisponibilites }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await fetchData();
      setNewDispo({ jour: '', heureDebut: '', heureFin: '' });
      setShowDispoDialog(false);
      showSnackbar('Disponibilité ajoutée', 'success');
    } catch (error) {
      showSnackbar('Erreur lors de l\'ajout', 'error');
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
      case 'en attente': return <PendingIcon />;
      case 'annulé': return <CancelIcon />;
      default: return <ScheduleIcon />;
    }
  };

  const joursSemaine = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
  const mois = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

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
          Calendrier
        </Typography>
        <Typography variant="h6" sx={{ 
          color: 'rgba(255,255,255,0.9)', 
          fontWeight: 500,
          letterSpacing: 1
        }}>
          Gérez votre planning et vos rendez-vous
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {/* Calendrier principal */}
        <Grid item xs={12} md={8}>
          <Card sx={{
            borderRadius: 4,
            bgcolor: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
          }}>
            <CardContent>
              {/* Contrôles du calendrier */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <IconButton onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}>
                    <ChevronLeftIcon />
                  </IconButton>
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    {mois[currentDate.getMonth()]} {currentDate.getFullYear()}
                  </Typography>
                  <IconButton onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}>
                    <ChevronRightIcon />
                  </IconButton>
                </Box>
                <Button
                  variant="outlined"
                  startIcon={<TodayIcon />}
                  onClick={() => setCurrentDate(new Date())}
                  sx={{ borderRadius: 3 }}
                >
                  Aujourd'hui
                </Button>
              </Box>

              {/* Grille du calendrier */}
              <Grid container sx={{ mb: 2 }}>
                {joursSemaine.map((jour) => (
                  <Grid item xs={12/7} key={jour}>
                    <Box sx={{ 
                      p: 1, 
                      textAlign: 'center', 
                      fontWeight: 600,
                      color: 'primary.main',
                      borderBottom: '2px solid #e0e0e0'
                    }}>
                      {jour.slice(0, 3)}
                    </Box>
                  </Grid>
                ))}
              </Grid>

              <Grid container>
                {getDaysInMonth(currentDate).map((day, index) => (
                  <Grid item xs={12/7} key={index}>
                    <Box
                      sx={{
                        p: 1,
                        minHeight: 100,
                        border: '1px solid #e0e0e0',
                        cursor: day ? 'pointer' : 'default',
                        bgcolor: day ? 'white' : 'transparent',
                        '&:hover': day ? { bgcolor: 'rgba(103, 126, 234, 0.1)' } : {},
                        position: 'relative'
                      }}
                      onClick={() => day && handleDateClick(day)}
                    >
                      {day && (
                        <>
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              fontWeight: day.toDateString() === new Date().toDateString() ? 700 : 400,
                              color: day.toDateString() === new Date().toDateString() ? 'primary.main' : 'text.primary'
                            }}
                          >
                            {day.getDate()}
                          </Typography>
                          {getRdvsForDate(day).map((rdv, rdvIndex) => (
                            <Chip
                              key={rdvIndex}
                              label={`${rdv.heure} - ${rdv.patient.nom}`}
                              size="small"
                              color={getStatutColor(rdv.statut)}
                              icon={getStatutIcon(rdv.statut)}
                              sx={{ 
                                fontSize: '0.7rem',
                                height: 20,
                                mb: 0.5,
                                maxWidth: '100%'
                              }}
                            />
                          ))}
                        </>
                      )}
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Panneau latéral */}
        <Grid item xs={12} md={4}>
          <Grid container spacing={3}>
            {/* Disponibilités */}
            <Grid item xs={12}>
              <Card sx={{
                borderRadius: 4,
                bgcolor: 'rgba(255,255,255,0.95)',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
              }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
                      Disponibilités
                    </Typography>
                    <IconButton
                      color="primary"
                      onClick={() => setShowDispoDialog(true)}
                      sx={{ bgcolor: 'primary.main', color: 'white', '&:hover': { bgcolor: 'primary.dark' } }}
                    >
                      <AddIcon />
                    </IconButton>
                  </Box>
                  
                  <List>
                    {disponibilites.map((dispo, index) => (
                      <ListItem key={index} sx={{ px: 0 }}>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
                            <ScheduleIcon fontSize="small" />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={dispo.jour}
                          secondary={`${dispo.heureDebut} - ${dispo.heureFin}`}
                        />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Grid>

            {/* Statistiques */}
            <Grid item xs={12}>
              <Card sx={{
                borderRadius: 4,
                bgcolor: 'rgba(255,255,255,0.95)',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
              }}>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main', mb: 3 }}>
                    Statistiques du mois
                  </Typography>
                  
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'success.light', color: 'white' }}>
                        <Typography variant="h4" sx={{ fontWeight: 700 }}>
                          {rdvs.filter(r => r.statut === 'confirmé').length}
                        </Typography>
                        <Typography variant="body2">Confirmés</Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={6}>
                      <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'warning.light', color: 'white' }}>
                        <Typography variant="h4" sx={{ fontWeight: 700 }}>
                          {rdvs.filter(r => r.statut === 'en attente').length}
                        </Typography>
                        <Typography variant="body2">En attente</Typography>
                      </Paper>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      {/* Dialog Détails RDV */}
      <Dialog open={showRdvDialog} onClose={() => setShowRdvDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <EventIcon color="primary" />
            <Typography variant="h6">Détails du rendez-vous</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedRdv && (
            <Box>
              <Typography variant="h6" sx={{ mb: 2 }}>
                {selectedRdv.patient.nom}
              </Typography>
              <Typography variant="body1" sx={{ mb: 1 }}>
                <strong>Date :</strong> {selectedRdv.date.toLocaleDateString('fr-FR')}
              </Typography>
              <Typography variant="body1" sx={{ mb: 1 }}>
                <strong>Heure :</strong> {selectedRdv.heure}
              </Typography>
              <Typography variant="body1" sx={{ mb: 1 }}>
                <strong>Motif :</strong> {selectedRdv.motif}
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Chip
                  icon={getStatutIcon(selectedRdv.statut)}
                  label={selectedRdv.statut}
                  color={getStatutColor(selectedRdv.statut)}
                  sx={{ mb: 2 }}
                />
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          {selectedRdv?.statut === 'en attente' && (
            <>
              <Button
                variant="contained"
                color="success"
                onClick={() => handleConfirmerRdv(selectedRdv._id)}
              >
                Confirmer
              </Button>
              <Button
                variant="outlined"
                color="error"
                onClick={() => handleAnnulerRdv(selectedRdv._id)}
              >
                Annuler
              </Button>
            </>
          )}
          <Button onClick={() => setShowRdvDialog(false)}>
            Fermer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog Ajouter Disponibilité */}
      <Dialog open={showDispoDialog} onClose={() => setShowDispoDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Ajouter une disponibilité</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Jour</InputLabel>
              <Select
                value={newDispo.jour}
                onChange={(e) => setNewDispo({ ...newDispo, jour: e.target.value })}
                label="Jour"
              >
                {joursSemaine.slice(1, 6).map((jour) => (
                  <MenuItem key={jour} value={jour.toLowerCase()}>
                    {jour}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              fullWidth
              type="time"
              label="Heure de début"
              value={newDispo.heureDebut}
              onChange={(e) => setNewDispo({ ...newDispo, heureDebut: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              fullWidth
              type="time"
              label="Heure de fin"
              value={newDispo.heureFin}
              onChange={(e) => setNewDispo({ ...newDispo, heureFin: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDispoDialog(false)}>
            Annuler
          </Button>
          <Button
            variant="contained"
            onClick={handleAddDispo}
            disabled={!newDispo.jour || !newDispo.heureDebut || !newDispo.heureFin}
          >
            Ajouter
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CalendrierMedecinPage; 