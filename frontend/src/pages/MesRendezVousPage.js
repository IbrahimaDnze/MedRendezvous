import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import API_BASE_URL from '../config/api';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import AssignmentIcon from '@mui/icons-material/Assignment';
import DeleteIcon from '@mui/icons-material/Delete';
import { useSnackbar } from '../components/GlobalSnackbar';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Avatar from '@mui/material/Avatar';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';

const illustration = (
  <img src="https://storyset.com/illustration/medical-appointment/bro" alt="Liste des rendez-vous" style={{ width: '100%', maxWidth: 350 }} />
);

const MesRendezVousPage = () => {
  const { token } = useAuth();
  const [tab, setTab] = useState(0); // 0 = à venir, 1 = passés
  const [rdvs, setRdvs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [selectedRdv, setSelectedRdv] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [rdvToDelete, setRdvToDelete] = useState(null);
  const { showSnackbar } = useSnackbar();

  const fetchRendezVous = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/rdv/mes', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const rdvsData = response.data.rdvs || [];
      
      // Debug: Afficher les informations des avatars
      rdvsData.forEach((rdv, index) => {
        console.log(`RDV ${index + 1}:`, {
          medecinNom: rdv.medecin?.userId?.nom,
          medecinAvatar: rdv.medecin?.userId?.avatar ? 'Avatar présent (base64)' : 'Pas d\'avatar',
          avatarType: rdv.medecin?.userId?.avatar ? (rdv.medecin.userId.avatar.startsWith('data:') ? 'Base64' : 'URL') : 'Aucun'
        });
      });
      
      setRdvs(rdvsData);
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

  const handleDeleteRdv = async () => {
    if (!rdvToDelete) return;

    try {
      setDeleting(true);
      await axios.delete(`http://localhost:5000/api/rdv/${rdvToDelete._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Supprimer le RDV de la liste locale
      setRdvs(prev => prev.filter(rdv => rdv._id !== rdvToDelete._id));
      showSnackbar('Rendez-vous supprimé avec succès', 'success');
      setDeleteDialogOpen(false);
      setRdvToDelete(null);
    } catch (error) {
      console.error('Erreur lors de la suppression du rendez-vous:', error);
      showSnackbar('Erreur lors de la suppression du rendez-vous', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const openDeleteDialog = (rdv) => {
    setRdvToDelete(rdv);
    setDeleteDialogOpen(true);
  };

  // Filtrer les RDV selon l'onglet
  const rdvsToShow = rdvs.filter(rdv => {
    const rdvDate = new Date(rdv.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (tab === 0) {
      // À venir : RDV aujourd'hui ou dans le futur
      return rdvDate >= today;
    } else {
      // Passés : RDV avant aujourd'hui
      return rdvDate < today;
    }
  });

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
      px: { xs: 2, md: 8 },
      py: 6,
      background: 'linear-gradient(120deg, #a1c4fd 0%, #c2e9fb 50%, #fbc2eb 100%)',
      position: 'relative',
      overflowX: 'hidden',
    }}>
      <Typography variant="h3" sx={{ fontWeight: 900, mb: 1, color: '#2a3eb1', fontSize: { xs: 32, md: 48 }, letterSpacing: 2, textShadow: '0 4px 16px #c2e9fb' }}>
        Mes rendez-vous
      </Typography>
      <Typography variant="body1" sx={{ color: '#4f4f4f', mb: 5, fontSize: 22, fontWeight: 500, letterSpacing: 1, textShadow: '0 2px 8px #fff' }}>
        Gérez vos rendez-vous à venir et passés
      </Typography>
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          sx={{
            background: 'rgba(255,255,255,0.85)',
            borderRadius: 99,
            boxShadow: '0 2px 12px 0 rgba(162, 89, 255, 0.10)',
            minHeight: 48,
            px: 1,
            '& .MuiTabs-indicator': {
              height: 4,
              borderRadius: 2,
              background: 'linear-gradient(90deg, #a259ff 0%, #1976d2 100%)',
              transition: 'all 0.3s',
            },
          }}
          TabIndicatorProps={{ style: { transition: 'all 0.3s' } }}
        >
          <Tab label="À venir" sx={{ fontWeight: 700, fontSize: 18, color: tab === 0 ? '#a259ff' : '#888', minWidth: 120, textTransform: 'none' }} />
          <Tab label="Passés" sx={{ fontWeight: 700, fontSize: 18, color: tab === 1 ? '#a259ff' : '#888', minWidth: 120, textTransform: 'none' }} />
        </Tabs>
      </Box>
      <Typography variant="h6" sx={{ fontWeight: 900, mb: 3, color: '#a259ff', fontSize: 24, letterSpacing: 1, textShadow: '0 2px 12px #fff' }}>
        {tab === 0 ? 'Rendez-vous à venir' : 'Rendez-vous passés'}
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 5, mb: 5 }}>
        {rdvsToShow.length === 0 && (
          <Typography color="text.secondary" sx={{ fontSize: 18, textAlign: 'center', py: 4 }}>Aucun rendez-vous.</Typography>
        )}
        {rdvsToShow.map(rdv => (
          <Box key={rdv._id} sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            bgcolor: 'rgba(255,255,255,0.82)',
            borderRadius: 22,
            boxShadow: '0 12px 48px 0 rgba(162,89,255,0.13)',
            p: 3,
            gap: 3,
            flexWrap: 'wrap',
            backdropFilter: 'blur(10px)',
            border: '1.5px solid #e3f0ff',
            transition: 'transform 0.18s, box-shadow 0.18s, border-color 0.18s',
            '&:hover': {
              transform: 'scale(1.045) translateY(-8px)',
              boxShadow: '0 24px 60px 0 rgba(162,89,255,0.22)',
              borderColor: '#a259ff',
            },
            animation: 'popIn 0.7s',
          }}>
            <Avatar 
              src={rdv.medecin?.userId?.avatar || undefined} 
              alt={rdv.medecin?.userId?.nom} 
              sx={{ 
                width: 80, 
                height: 80, 
                borderRadius: '50%', 
                boxShadow: 4, 
                mr: 2, 
                border: '3px solid #a1c4fd', 
                background: rdv.medecin?.userId?.avatar ? 'transparent' : '#fff',
                bgcolor: rdv.medecin?.userId?.avatar ? 'transparent' : '#a1c4fd'
              }}
            >
              {rdv.medecin?.userId?.nom?.charAt(0) || 'M'}
            </Avatar>
            <Box sx={{ flex: 1, minWidth: 200 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 900, color: '#2a3eb1', fontSize: 20 }}>
                {new Date(rdv.date).toLocaleString('fr-FR', { 
                  month: 'long', 
                  day: 'numeric', 
                  year: 'numeric', 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </Typography>
              <Typography variant="body2" sx={{ color: '#a259ff', fontWeight: 700, mb: 0.5, fontSize: 17 }}>
                {rdv.medecin?.adresse || 'Adresse non disponible'}
              </Typography>
              {rdv.medecin?.hopital && (
                <Typography variant="body2" sx={{ color: '#9c27b0', fontWeight: 600, mb: 0.5, fontSize: 16 }}>
                  🏥 {rdv.medecin.hopital}
                </Typography>
              )}
              <Typography variant="body2" sx={{ color: '#4f4f4f', fontWeight: 600 }}>
                Dr. {rdv.medecin?.userId?.nom || 'Médecin'}, {rdv.medecin?.specialite || 'Spécialité'}
              </Typography>
              <Typography variant="body2" sx={{ color: '#666', fontWeight: 500, mb: 0.5 }}>
                📞 {rdv.medecin?.telephone || 'Téléphone non disponible'}
              </Typography>
              <Typography variant="body2" sx={{ color: '#666', fontWeight: 500 }}>
                Statut: {rdv.statut}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <Button
                variant="contained"
                color="secondary"
                sx={{ fontWeight: 700, fontSize: 16, textTransform: 'none', borderRadius: 99, px: 3, py: 1, boxShadow: '0 2px 8px 0 rgba(245,0,87,0.10)' }}
                onClick={() => { setSelectedRdv(rdv); setOpen(true); }}
              >
                Voir détails
              </Button>
              <Tooltip title="Supprimer le rendez-vous">
                <IconButton
                  onClick={(e) => {
                    e.stopPropagation();
                    openDeleteDialog(rdv);
                  }}
                  sx={{
                    color: '#dc2626',
                    bgcolor: 'rgba(220, 38, 38, 0.08)',
                    '&:hover': {
                      bgcolor: 'rgba(220, 38, 38, 0.15)',
                      transform: 'scale(1.1)'
                    },
                    transition: 'all 0.2s ease'
                  }}
                >
                  <DeleteIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        ))}
      </Box>
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Détails du rendez-vous</DialogTitle>
        <DialogContent sx={{ textAlign: 'center', p: 3 }}>
          {selectedRdv && (
            <>
              <Avatar 
                src={selectedRdv.medecin?.userId?.avatar || undefined} 
                alt={selectedRdv.medecin?.userId?.nom} 
                sx={{ 
                  width: 90, 
                  height: 90, 
                  borderRadius: '50%', 
                  boxShadow: 4, 
                  mx: 'auto', 
                  mb: 2, 
                  border: '3px solid #a1c4fd', 
                  background: selectedRdv.medecin?.userId?.avatar ? 'transparent' : '#fff',
                  bgcolor: selectedRdv.medecin?.userId?.avatar ? 'transparent' : '#a1c4fd'
                }}
              >
                {selectedRdv.medecin?.userId?.nom?.charAt(0) || 'M'}
              </Avatar>
              <Typography variant="h6" sx={{ fontWeight: 900, color: '#2a3eb1', mb: 1 }}>
                Dr. {selectedRdv.medecin?.userId?.nom || 'Médecin'}
              </Typography>
              <Typography variant="body1" sx={{ color: '#a259ff', fontWeight: 700, mb: 1 }}>
                {selectedRdv.medecin?.specialite || 'Spécialité'}
              </Typography>
              <Typography variant="body2" sx={{ color: '#1976d2', fontWeight: 600, mb: 1 }}>
                {selectedRdv.medecin?.adresse || 'Adresse non disponible'}
              </Typography>
              {selectedRdv.medecin?.hopital && (
                <Typography variant="body2" sx={{ color: '#9c27b0', fontWeight: 600, mb: 1 }}>
                  🏥 {selectedRdv.medecin.hopital}
                </Typography>
              )}
              <Typography variant="body2" sx={{ color: '#666', fontWeight: 600, mb: 1 }}>
                📞 {selectedRdv.medecin?.telephone || 'Téléphone non disponible'}
              </Typography>
              <Typography variant="body2" sx={{ color: '#4f4f4f', mb: 1 }}>
                {new Date(selectedRdv.date).toLocaleString('fr-FR', { 
                  month: 'long', 
                  day: 'numeric', 
                  year: 'numeric', 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </Typography>
              {selectedRdv.motif && (
                <Typography variant="body2" sx={{ color: '#666', mb: 1 }}>
                  Motif: {selectedRdv.motif}
                </Typography>
              )}
              <Typography variant="body2" sx={{ color: '#666', mb: 1 }}>
                Statut: {selectedRdv.statut}
              </Typography>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} color="primary" variant="outlined">Fermer</Button>
        </DialogActions>
      </Dialog>

      {/* Dialogue de confirmation de suppression */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ color: '#dc2626', fontWeight: 600 }}>
          Confirmer la suppression
        </DialogTitle>
        <DialogContent sx={{ textAlign: 'center', p: 3 }}>
          {rdvToDelete && (
            <>
              <Typography variant="body1" sx={{ mb: 2, color: '#4f4f4f' }}>
                Êtes-vous sûr de vouloir supprimer ce rendez-vous ?
              </Typography>
              <Typography variant="body2" sx={{ color: '#666', mb: 1 }}>
                <strong>Médecin:</strong> Dr. {rdvToDelete.medecin?.userId?.nom || 'Médecin'}
              </Typography>
              <Typography variant="body2" sx={{ color: '#666', mb: 1 }}>
                <strong>Date:</strong> {new Date(rdvToDelete.date).toLocaleString('fr-FR', { 
                  month: 'long', 
                  day: 'numeric', 
                  year: 'numeric', 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </Typography>
              <Typography variant="body2" sx={{ color: '#dc2626', fontWeight: 600, mt: 2 }}>
                Cette action est irréversible.
              </Typography>
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button 
            onClick={() => setDeleteDialogOpen(false)} 
            variant="outlined" 
            disabled={deleting}
          >
            Annuler
          </Button>
          <Button 
            onClick={handleDeleteRdv} 
            variant="contained" 
            color="error"
            disabled={deleting}
            startIcon={deleting ? <CircularProgress size={16} /> : <DeleteIcon />}
          >
            {deleting ? 'Suppression...' : 'Supprimer'}
          </Button>
        </DialogActions>
      </Dialog>

      <style>{`
        @keyframes popIn {
          0% { opacity: 0; transform: scale(0.92) translateY(30px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </Box>
  );
};

export default MesRendezVousPage; 