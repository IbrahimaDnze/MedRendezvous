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
import CircularProgress from '@mui/material/CircularProgress';
import { useSnackbar } from '../components/GlobalSnackbar';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
import EventIcon from '@mui/icons-material/Event';
import CalendarViewWeekIcon from '@mui/icons-material/CalendarViewWeek';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';

const DisponibilitesPage = () => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [disponibilites, setDisponibilites] = useState([]);
  const [nouvelleDispo, setNouvelleDispo] = useState({
    jour: '',
    heureDebut: '',
    heureFin: ''
  });
  const [showSemaineForm, setShowSemaineForm] = useState(false);
  const [dispoSemaine, setDispoSemaine] = useState({
    heureDebut: '',
    heureFin: '',
    joursSelectionnes: []
  });
  const { showSnackbar } = useSnackbar();

  const joursSemaine = [
    { value: 'lundi', label: 'Lundi' },
    { value: 'mardi', label: 'Mardi' },
    { value: 'mercredi', label: 'Mercredi' },
    { value: 'jeudi', label: 'Jeudi' },
    { value: 'vendredi', label: 'Vendredi' },
    { value: 'samedi', label: 'Samedi' },
    { value: 'dimanche', label: 'Dimanche' }
  ];

  const heures = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
    '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30'
  ];

  const fetchDisponibilites = useCallback(async () => {
    try {
      setLoading(true);
      // Appel API réel pour récupérer les disponibilités
      const response = await axios.get('http://localhost:5000/api/users/disponibilites', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDisponibilites(response.data.disponibilites || []);
      setLoading(false);
    } catch (error) {
      console.error('Erreur lors du chargement des disponibilités:', error);
      showSnackbar('Erreur lors du chargement des disponibilités', 'error');
      setLoading(false);
    }
  }, [token, showSnackbar]);

  useEffect(() => {
    fetchDisponibilites();
  }, [fetchDisponibilites]);

  const handleAjouterDispo = async () => {
    if (!nouvelleDispo.jour || !nouvelleDispo.heureDebut || !nouvelleDispo.heureFin) {
      showSnackbar('Veuillez remplir tous les champs', 'warning');
      return;
    }
    if (nouvelleDispo.heureDebut >= nouvelleDispo.heureFin) {
      showSnackbar('L\'heure de fin doit être après l\'heure de début', 'warning');
      return;
    }
    const existeDeja = disponibilites.some(d => d.jour === nouvelleDispo.jour);
    if (existeDeja) {
      showSnackbar('Une disponibilité existe déjà pour ce jour', 'warning');
      return;
    }
    try {
      const updatedDisponibilites = [...disponibilites, nouvelleDispo];
      await axios.put('http://localhost:5000/api/users/disponibilites', {
        disponibilites: updatedDisponibilites
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await fetchDisponibilites();
      setNouvelleDispo({ jour: '', heureDebut: '', heureFin: '' });
      showSnackbar('Disponibilité ajoutée', 'success');
    } catch (error) {
      showSnackbar('Erreur lors de l\'ajout', 'error');
    }
  };

  const handleAjouterDispoSemaine = async () => {
    if (!dispoSemaine.heureDebut || !dispoSemaine.heureFin || dispoSemaine.joursSelectionnes.length === 0) {
      showSnackbar('Veuillez remplir tous les champs et sélectionner au moins un jour', 'warning');
      return;
    }
    if (dispoSemaine.heureDebut >= dispoSemaine.heureFin) {
      showSnackbar('L\'heure de fin doit être après l\'heure de début', 'warning');
      return;
    }

    try {
      const nouvellesDispos = [];
      const disposExistantes = [...disponibilites];

      // Vérifier les conflits et créer les nouvelles disponibilités
      for (const jour of dispoSemaine.joursSelectionnes) {
        const existeDeja = disposExistantes.some(d => d.jour === jour);
        if (existeDeja) {
          showSnackbar(`Une disponibilité existe déjà pour ${joursSemaine.find(j => j.value === jour)?.label}`, 'warning');
          return;
        }
        nouvellesDispos.push({
          jour,
          heureDebut: dispoSemaine.heureDebut,
          heureFin: dispoSemaine.heureFin
        });
      }

      const updatedDisponibilites = [...disposExistantes, ...nouvellesDispos];
      await axios.put('http://localhost:5000/api/users/disponibilites', {
        disponibilites: updatedDisponibilites
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      await fetchDisponibilites();
      setDispoSemaine({ heureDebut: '', heureFin: '', joursSelectionnes: [] });
      setShowSemaineForm(false);
      showSnackbar(`${nouvellesDispos.length} disponibilité(s) ajoutée(s)`, 'success');
    } catch (error) {
      showSnackbar('Erreur lors de l\'ajout', 'error');
    }
  };

  const handleJourSelection = (jour) => {
    setDispoSemaine(prev => ({
      ...prev,
      joursSelectionnes: prev.joursSelectionnes.includes(jour)
        ? prev.joursSelectionnes.filter(j => j !== jour)
        : [...prev.joursSelectionnes, jour]
    }));
  };

  const handleSupprimerDispo = async (index) => {
    try {
      const nouvellesDispos = disponibilites.filter((_, i) => i !== index);
      
      // Envoyer la liste mise à jour au backend
      await axios.put('http://localhost:5000/api/users/disponibilites', {
        disponibilites: nouvellesDispos
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Recharger les données depuis le backend
      await fetchDisponibilites();
      showSnackbar('Disponibilité supprimée', 'success');
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      showSnackbar('Erreur lors de la suppression', 'error');
    }
  };

  const handleSauvegarder = async () => {
    try {
      setSaving(true);
      
      // Appel API réel pour sauvegarder les disponibilités
      await axios.put('http://localhost:5000/api/users/disponibilites', {
        disponibilites
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      showSnackbar('Disponibilités sauvegardées avec succès', 'success');
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      showSnackbar('Erreur lors de la sauvegarde', 'error');
    } finally {
      setSaving(false);
    }
  };

  const getJourLabel = (jourValue) => {
    const jour = joursSemaine.find(j => j.value === jourValue);
    return jour ? jour.label : jourValue;
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
          Gestion des Disponibilités
        </Typography>
        <Typography variant="h6" sx={{ 
          color: 'rgba(255,255,255,0.9)', 
          fontWeight: 500,
          letterSpacing: 1
        }}>
          Définissez vos horaires de consultation
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {/* Formulaire d'ajout */}
        <Grid item xs={12} md={4}>
          <Card sx={{
            borderRadius: 4,
            bgcolor: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
            height: 'fit-content'
          }}>
            <CardContent>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, color: 'primary.main' }}>
                Ajouter une disponibilité
              </Typography>
              
              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel>Jour</InputLabel>
                <Select
                  value={nouvelleDispo.jour}
                  onChange={(e) => setNouvelleDispo({...nouvelleDispo, jour: e.target.value})}
                  label="Jour"
                >
                  {joursSemaine.map((jour) => (
                    <MenuItem key={jour.value} value={jour.value}>
                      {jour.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel>Heure de début</InputLabel>
                <Select
                  value={nouvelleDispo.heureDebut}
                  onChange={(e) => setNouvelleDispo({...nouvelleDispo, heureDebut: e.target.value})}
                  label="Heure de début"
                >
                  {heures.map((heure) => (
                    <MenuItem key={heure} value={heure}>
                      {heure}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel>Heure de fin</InputLabel>
                <Select
                  value={nouvelleDispo.heureFin}
                  onChange={(e) => setNouvelleDispo({...nouvelleDispo, heureFin: e.target.value})}
                  label="Heure de fin"
                >
                  {heures.map((heure) => (
                    <MenuItem key={heure} value={heure}>
                      {heure}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Button
                variant="contained"
                color="primary"
                fullWidth
                startIcon={<AddIcon />}
                onClick={handleAjouterDispo}
                sx={{ borderRadius: 3, py: 1.5, fontWeight: 600, mb: 2 }}
              >
                Ajouter
              </Button>

              <Button
                variant="outlined"
                color="secondary"
                fullWidth
                startIcon={<CalendarViewWeekIcon />}
                onClick={() => setShowSemaineForm(!showSemaineForm)}
                sx={{ borderRadius: 3, py: 1.5, fontWeight: 600 }}
              >
                {showSemaineForm ? 'Masquer' : 'Ajouter pour la semaine'}
              </Button>
            </CardContent>
          </Card>

          {/* Formulaire pour la semaine */}
          {showSemaineForm && (
            <Card sx={{
              borderRadius: 4,
              bgcolor: 'rgba(255,255,255,0.95)',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
              mt: 2
            }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, color: 'secondary.main' }}>
                  Disponibilités pour la semaine
                </Typography>

                <FormControl fullWidth sx={{ mb: 3 }}>
                  <InputLabel>Heure de début</InputLabel>
                  <Select
                    value={dispoSemaine.heureDebut}
                    onChange={(e) => setDispoSemaine({...dispoSemaine, heureDebut: e.target.value})}
                    label="Heure de début"
                  >
                    {heures.map((heure) => (
                      <MenuItem key={heure} value={heure}>
                        {heure}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl fullWidth sx={{ mb: 3 }}>
                  <InputLabel>Heure de fin</InputLabel>
                  <Select
                    value={dispoSemaine.heureFin}
                    onChange={(e) => setDispoSemaine({...dispoSemaine, heureFin: e.target.value})}
                    label="Heure de fin"
                  >
                    {heures.map((heure) => (
                      <MenuItem key={heure} value={heure}>
                        {heure}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                  Jours de la semaine :
                </Typography>

                <Box sx={{ mb: 3 }}>
                  {joursSemaine.map((jour) => (
                    <FormControlLabel
                      key={jour.value}
                      control={
                        <Checkbox
                          checked={dispoSemaine.joursSelectionnes.includes(jour.value)}
                          onChange={() => handleJourSelection(jour.value)}
                          color="secondary"
                        />
                      }
                      label={jour.label}
                      sx={{ display: 'block', mb: 1 }}
                    />
                  ))}
                </Box>

                <Button
                  variant="contained"
                  color="secondary"
                  fullWidth
                  startIcon={<CalendarViewWeekIcon />}
                  onClick={handleAjouterDispoSemaine}
                  sx={{ borderRadius: 3, py: 1.5, fontWeight: 600 }}
                >
                  Ajouter pour la semaine
                </Button>
              </CardContent>
            </Card>
          )}
        </Grid>

        {/* Liste des disponibilités */}
        <Grid item xs={12} md={8}>
          <Card sx={{
            borderRadius: 4,
            bgcolor: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
            minHeight: 400
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5" sx={{ fontWeight: 700, color: 'primary.main' }}>
                  Vos disponibilités
                </Typography>
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={handleSauvegarder}
                  disabled={saving}
                  startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
                  sx={{ borderRadius: 3, px: 4, fontWeight: 600 }}
                >
                  {saving ? 'Sauvegarde...' : 'Sauvegarder'}
                </Button>
              </Box>

              {disponibilites.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 8 }}>
                  <EventIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                    Aucune disponibilité définie
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Ajoutez vos horaires de consultation pour permettre aux patients de prendre rendez-vous
                  </Typography>
                </Box>
              ) : (
                <Grid container spacing={2}>
                  {disponibilites.map((dispo, index) => (
                    <Grid item xs={12} sm={6} key={index}>
                      <Card sx={{
                        bgcolor: 'rgba(103, 126, 234, 0.1)',
                        border: '1px solid rgba(103, 126, 234, 0.3)',
                        borderRadius: 3,
                        position: 'relative'
                      }}>
                        <CardContent>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Box>
                              <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main', mb: 1 }}>
                                {getJourLabel(dispo.jour)}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {dispo.heureDebut} - {dispo.heureFin}
                              </Typography>
                            </Box>
                            <IconButton
                              color="error"
                              onClick={() => handleSupprimerDispo(index)}
                              sx={{ 
                                bgcolor: 'rgba(244, 67, 54, 0.1)',
                                '&:hover': { bgcolor: 'rgba(244, 67, 54, 0.2)' }
                              }}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DisponibilitesPage; 