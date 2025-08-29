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
import { Link } from 'react-router-dom';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import ScheduleIcon from '@mui/icons-material/Schedule';
import PeopleIcon from '@mui/icons-material/People';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import Chip from '@mui/material/Chip';
import Avatar from '@mui/material/Avatar';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';

const DashboardMedecinPage = () => {
  const { token, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRdv: 0,
    rdvAujourdhui: 0,
    rdvEnAttente: 0,
    rdvConfirmes: 0
  });
  const [rdvRecents, setRdvRecents] = useState([]);
  const { showSnackbar } = useSnackbar();

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      
      console.log('=== DASHBOARD MÉDECIN ===');
      console.log('Token présent:', !!token);
      console.log('Token:', token);
      
      // Appel API réel pour récupérer les RDV du médecin
      const response = await axios.get(`${API_BASE_URL}/api/rdv/mes`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const rdvs = response.data.rdvs || [];
      const aujourdhui = new Date().toISOString().split('T')[0];
      
      const statsData = {
        totalRdv: rdvs.length,
        rdvAujourdhui: rdvs.filter(rdv => 
          new Date(rdv.date).toISOString().split('T')[0] === aujourdhui
        ).length,
        rdvEnAttente: rdvs.filter(rdv => rdv.statut === 'en attente').length,
        rdvConfirmes: rdvs.filter(rdv => rdv.statut === 'confirmé').length
      };

      setStats(statsData);
      setRdvRecents(rdvs.slice(0, 5)); // 5 derniers RDV
      setLoading(false);
    } catch (error) {
      console.error('Erreur lors du chargement du dashboard:', error);
      showSnackbar('Erreur lors du chargement des données', 'error');
      setLoading(false);
    }
  }, [token, showSnackbar]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleConfirmerRdv = async (rdvId) => {
    try {
      await axios.put(`http://localhost:5000/api/rdv/${rdvId}/confirmer`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showSnackbar('Rendez-vous confirmé avec succès', 'success');
      fetchDashboardData();
    } catch (error) {
      showSnackbar('Erreur lors de la confirmation', 'error');
    }
  };

  const handleAnnulerRdv = async (rdvId) => {
    try {
      await axios.put(`http://localhost:5000/api/rdv/${rdvId}/annuler`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showSnackbar('Rendez-vous annulé avec succès', 'success');
      fetchDashboardData();
    } catch (error) {
      showSnackbar('Erreur lors de l\'annulation', 'error');
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
      case 'en attente': return <ScheduleIcon />; // Changed from PendingIcon to ScheduleIcon
      case 'annulé': return <CancelIcon />;
      default: return <ScheduleIcon />;
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
          Dashboard Médecin
        </Typography>
        <Typography variant="h6" sx={{ 
          color: 'rgba(255,255,255,0.9)', 
          fontWeight: 500,
          letterSpacing: 1
        }}>
          Bienvenue, Dr. {user?.nom || 'Médecin'}
        </Typography>
      </Box>

      {/* Statistiques */}
      <Grid container spacing={4} sx={{ mb: 6 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{
            borderRadius: 4,
            bgcolor: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
            transition: 'transform 0.2s',
            '&:hover': { transform: 'translateY(-4px)' }
          }}>
            <CardContent sx={{ textAlign: 'center', py: 3 }}>
              <CalendarTodayIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
              <Typography variant="h4" sx={{ fontWeight: 900, color: 'primary.main', mb: 1 }}>
                {stats.totalRdv}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                Total Rendez-vous
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{
            borderRadius: 4,
            bgcolor: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
            transition: 'transform 0.2s',
            '&:hover': { transform: 'translateY(-4px)' }
          }}>
            <CardContent sx={{ textAlign: 'center', py: 3 }}>
              <ScheduleIcon sx={{ fontSize: 48, color: 'warning.main', mb: 2 }} />
              <Typography variant="h4" sx={{ fontWeight: 900, color: 'warning.main', mb: 1 }}>
                {stats.rdvAujourdhui}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                RDV Aujourd'hui
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{
            borderRadius: 4,
            bgcolor: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
            transition: 'transform 0.2s',
            '&:hover': { transform: 'translateY(-4px)' }
          }}>
            <CardContent sx={{ textAlign: 'center', py: 3 }}>
              <ScheduleIcon sx={{ fontSize: 48, color: 'warning.main', mb: 2 }} />
              <Typography variant="h4" sx={{ fontWeight: 900, color: 'warning.main', mb: 1 }}>
                {stats.rdvEnAttente}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                En Attente
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{
            borderRadius: 4,
            bgcolor: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
            transition: 'transform 0.2s',
            '&:hover': { transform: 'translateY(-4px)' }
          }}>
            <CardContent sx={{ textAlign: 'center', py: 3 }}>
              <CheckCircleIcon sx={{ fontSize: 48, color: 'success.main', mb: 2 }} />
              <Typography variant="h4" sx={{ fontWeight: 900, color: 'success.main', mb: 1 }}>
                {stats.rdvConfirmes}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                Confirmés
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Rendez-vous récents */}
      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          <Card sx={{
            borderRadius: 4,
            bgcolor: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
            minHeight: 400
          }}>
            <CardContent>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, color: 'primary.main' }}>
                Rendez-vous Récents
              </Typography>
              {rdvRecents.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 8 }}>
                  <PeopleIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary">
                    Aucun rendez-vous pour le moment
                  </Typography>
                </Box>
              ) : (
                <List>
                  {rdvRecents.map((rdv) => (
                    <ListItem key={rdv._id} sx={{
                      border: '1px solid #e0e0e0',
                      borderRadius: 2,
                      mb: 2,
                      bgcolor: 'rgba(255,255,255,0.7)'
                    }}>
                      <ListItemAvatar>
                        <Avatar src={rdv.patient?.avatar} sx={{ bgcolor: 'primary.main' }}>
                          {rdv.patient?.nom?.charAt(0) || 'P'}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
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
                          <Typography variant="body2" color="text.secondary">
                            {new Date(rdv.date).toLocaleDateString('fr-FR')} à {rdv.heure}
                            {rdv.motif && ` - ${rdv.motif}`}
                          </Typography>
                        }
                      />
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        {rdv.statut === 'en attente' && (
                          <>
                            <Button
                              size="small"
                              variant="contained"
                              color="success"
                              onClick={() => handleConfirmerRdv(rdv._id)}
                              sx={{ borderRadius: 2 }}
                            >
                              Confirmer
                            </Button>
                            <Button
                              size="small"
                              variant="outlined"
                              color="error"
                              onClick={() => handleAnnulerRdv(rdv._id)}
                              sx={{ borderRadius: 2 }}
                            >
                              Annuler
                            </Button>
                          </>
                        )}
                      </Box>
                    </ListItem>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{
            borderRadius: 4,
            bgcolor: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
            minHeight: 400
          }}>
            <CardContent>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, color: 'primary.main' }}>
                Actions Rapides
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  component={Link}
                  to="/calendrier-medecin"
                  sx={{ borderRadius: 3, py: 1.5, fontWeight: 600 }}
                >
                  Voir Calendrier
                </Button>
                <Button
                  variant="outlined"
                  color="primary"
                  fullWidth
                  component={Link}
                  to="/disponibilites"
                  sx={{ borderRadius: 3, py: 1.5, fontWeight: 600 }}
                >
                  Gérer Disponibilités
                </Button>
                <Button
                  variant="outlined"
                  color="secondary"
                  fullWidth
                  component={Link}
                  to="/gestion-rendezvous"
                  sx={{ borderRadius: 3, py: 1.5, fontWeight: 600 }}
                >
                  Gestion RDV
                </Button>
                <Button
                  variant="outlined"
                  color="info"
                  fullWidth
                  component={Link}
                  to="/messagerie-medecin"
                  sx={{ borderRadius: 3, py: 1.5, fontWeight: 600 }}
                >
                  Messagerie
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardMedecinPage; 