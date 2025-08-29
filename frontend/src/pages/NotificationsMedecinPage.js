import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import API_BASE_URL from '../config/api';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import DeleteIcon from '@mui/icons-material/Delete';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import { useAuth } from '../contexts/AuthContext';
// import { useSnackbar } from '../components/GlobalSnackbar';
// Ajoutez ici les autres imports Material UI nécessaires selon votre JSX (Button, Dialog, etc.)
// import useAuth from '../hooks/useAuth';
// import useSnackbar from '../hooks/useSnackbar';

const NotificationsMedecinPage = () => {
  const { token } = useAuth(); // ou récupérez le token selon votre logique
  // const { showSnackbar } = useSnackbar();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [notificationToDelete, setNotificationToDelete] = useState(null);

  // Remplacez l'URL et l'en-tête d'authentification selon votre API
  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/medecins/notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(response.data.notifications || []);
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const markAsRead = async (id) => {
    try {
      await axios.put(
        `${API_BASE_URL}/api/medecins/notifications/${id}/read`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNotifications(notifications.map(notif =>
        notif._id === id ? { ...notif, statut: 'lu' } : notif
      ));
    } catch (error) {}
  };

  const handleDeleteNotification = async () => {
    if (!notificationToDelete) return;
    try {
      setDeleting(true);
      await axios.delete(
        `${API_BASE_URL}/api/medecins/notifications/${notificationToDelete._id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNotifications(prev => prev.filter(notif => notif._id !== notificationToDelete._id));
      setDeleteDialogOpen(false);
      setNotificationToDelete(null);
    } catch (error) {
    } finally {
      setDeleting(false);
    }
  };

  const openDeleteDialog = (notification) => {
    setNotificationToDelete(notification);
    setDeleteDialogOpen(true);
  };

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

  const filteredNotifications = notifications.filter(notif => notif.type !== 'message');

  return (
    <Box sx={{
      minHeight: '100vh',
      background: 'linear-gradient(120deg, #a1c4fd 0%, #c2e9fb 50%, #fbc2eb 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      py: 6,
      px: 2,
    }}>
      <Box sx={{
        width: '100%',
        maxWidth: 420,
        mx: 'auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        borderRadius: 7,
        boxShadow: '0 8px 32px 0 rgba(25,118,210,0.10)',
        p: { xs: 2, md: 5 },
        minWidth: 320,
        border: '1.5px solid #b3d1fa',
      }}>
        <NotificationsActiveIcon color="primary" sx={{ fontSize: 44, mb: 1 }} />
        <Typography component="h1" variant="h4" sx={{ mb: 2, fontWeight: 900, color: 'primary.main', letterSpacing: 1 }}>
          Notifications
        </Typography>
        <Box sx={{ width: '100%' }}>
          {filteredNotifications.length === 0 ? (
            <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
              Aucune notification pour le moment
            </Typography>
          ) : (
            filteredNotifications.map(notif => (
              <Paper key={notif._id} sx={{
                p: 2.5,
                mb: 2.5,
                bgcolor: notif.statut === 'lu' ? 'grey.100' : 'rgba(162, 89, 255, 0.10)',
                borderRadius: 5,
                boxShadow: notif.statut === 'lu' ? '0 2px 8px 0 rgba(25,118,210,0.04)' : '0 4px 16px 0 rgba(245,0,87,0.10)',
                border: notif.statut === 'lu' ? '1.2px solid #e3f0ff' : '1.5px solid #b3d1fa',
                transition: 'box-shadow 0.2s',
                position: 'relative',
              }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                  <Typography variant="body1" sx={{ 
                    fontWeight: 600, 
                    color: notif.statut === 'lu' ? '#22336b' : 'secondary.main',
                    flex: 1
                  }}>
                    {notif.message}
                  </Typography>
                  <Tooltip title="Supprimer la notification">
                    <IconButton
                      size="small"
                      onClick={() => openDeleteDialog(notif)}
                      sx={{
                        color: '#dc2626',
                        bgcolor: 'rgba(220, 38, 38, 0.08)',
                        '&:hover': {
                          bgcolor: 'rgba(220, 38, 38, 0.15)',
                          transform: 'scale(1.1)'
                        },
                        transition: 'all 0.2s ease',
                        ml: 1
                      }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
                <Typography variant="caption" color="text.secondary">
                  {new Date(notif.dateCreation).toLocaleString('fr-FR')}
                </Typography>
                {notif.statut !== 'lu' && (
                  <Button 
                    size="small" 
                    sx={{ ml: 2, borderRadius: 99, textTransform: 'none', fontWeight: 700 }} 
                    onClick={() => markAsRead(notif._id)}
                  >
                    Marquer comme lue
                  </Button>
                )}
              </Paper>
            ))
          )}
        </Box>
      </Box>
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ color: '#dc2626', fontWeight: 600 }}>
          Confirmer la suppression
        </DialogTitle>
        <DialogContent sx={{ textAlign: 'center', p: 3 }}>
          {notificationToDelete && (
            <>
              <Typography variant="body1" sx={{ mb: 2, color: '#4f4f4f' }}>
                Êtes-vous sûr de vouloir supprimer cette notification ?
              </Typography>
              <Typography variant="body2" sx={{ color: '#666', mb: 1 }}>
                <strong>Message:</strong> {notificationToDelete.message}
              </Typography>
              <Typography variant="body2" sx={{ color: '#666', mb: 1 }}>
                <strong>Date:</strong> {new Date(notificationToDelete.dateCreation).toLocaleString('fr-FR')}
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
            onClick={handleDeleteNotification} 
            variant="contained" 
            color="error"
            disabled={deleting}
            startIcon={deleting ? <CircularProgress size={16} /> : <DeleteIcon />}
          >
            {deleting ? 'Suppression...' : 'Supprimer'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default NotificationsMedecinPage;