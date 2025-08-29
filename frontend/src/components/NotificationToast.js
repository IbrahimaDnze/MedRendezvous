import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Slide from '@mui/material/Slide';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import ErrorIcon from '@mui/icons-material/Error';
import InfoIcon from '@mui/icons-material/Info';
import CloseIcon from '@mui/icons-material/Close';
// import { useNavigate } from 'react-router-dom';

const NotificationToast = ({ notification, onClose, onMarkAsRead, style = {} }) => {
  const [isVisible, setIsVisible] = useState(false);
  // const navigate = useNavigate();

  useEffect(() => {
    // Afficher la notification après un court délai
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const getTypeIcon = (type) => {
    switch (type) {
      case 'rdv_confirmation': return <CheckCircleIcon />;
      case 'rdv_annulation': return <ErrorIcon />;
      case 'rdv_rappelle': return <WarningIcon />;
      case 'message': return <NotificationsActiveIcon />;
      case 'disponibilite': return <InfoIcon />;
      case 'urgence': return <WarningIcon />;
      default: return <NotificationsActiveIcon />;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'rdv_confirmation': return '#4caf50';
      case 'rdv_annulation': return '#f44336';
      case 'rdv_rappelle': return '#ff9800';
      case 'message': return '#2196f3';
      case 'disponibilite': return '#00bcd4';
      case 'urgence': return '#ff9800';
      default: return '#2196f3';
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 'rdv_confirmation': return 'Confirmation RDV';
      case 'rdv_annulation': return 'Annulation RDV';
      case 'rdv_rappelle': return 'Rappel RDV';
      case 'message': return 'Nouveau message';
      case 'disponibilite': return 'Disponibilité';
      case 'urgence': return 'Urgence';
      default: return 'Notification';
    }
  };

  const handleClick = async () => {
    // Marquer comme lue si ce n'est pas déjà fait
    if (notification.statut !== 'lu' && onMarkAsRead) {
      await onMarkAsRead(notification._id);
    }
    onClose(); // Fermer le pop AVANT la redirection
    // Naviguer vers la page appropriée selon le type
    if (notification.type === 'message') {
      window.location.href = '/messagerie';
    } else if (notification.type && notification.type.includes('rdv')) {
      window.location.href = '/notifications';
    } else {
      window.location.href = '/notifications';
    }
  };

  const handleClose = (e) => {
    e.stopPropagation();
    onClose();
  };

  return (
    <Slide direction="left" in={isVisible} mountOnEnter unmountOnExit>
      <Paper
        elevation={8}
        sx={{
          position: 'fixed',
          top: style.top || 20,
          right: style.right || 20,
          width: 350,
          maxWidth: '90vw',
          zIndex: 9999,
          cursor: 'pointer',
          background: `linear-gradient(135deg, ${getTypeColor(notification.type)}15 0%, ${getTypeColor(notification.type)}25 100%)`,
          border: `2px solid ${getTypeColor(notification.type)}`,
          borderRadius: 3,
          overflow: 'hidden',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateX(-5px)',
            boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
          }
        }}
        onClick={handleClick}
      >
        <Box sx={{ p: 2 }}>
          {/* En-tête avec icône et bouton fermer */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box
                sx={{
                  color: getTypeColor(notification.type),
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                {getTypeIcon(notification.type)}
              </Box>
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: 700,
                  color: getTypeColor(notification.type),
                  fontSize: '0.875rem',
                }}
              >
                {getTypeLabel(notification.type)}
              </Typography>
            </Box>
            <IconButton
              size="small"
              onClick={handleClose}
              sx={{
                color: 'text.secondary',
                '&:hover': {
                  color: 'error.main',
                  bgcolor: 'rgba(244, 67, 54, 0.1)',
                }
              }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>

          {/* Contenu de la notification */}
          <Box>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 600,
                color: 'text.primary',
                mb: 0.5,
                lineHeight: 1.4,
              }}
            >
              {notification.titre}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: 'text.secondary',
                display: 'block',
                lineHeight: 1.3,
                mb: 1,
              }}
            >
              {notification.message}
            </Typography>
            
            {/* Indicateur de temps */}
            <Typography
              variant="caption"
              sx={{
                color: 'text.secondary',
                fontSize: '0.7rem',
                fontStyle: 'italic',
              }}
            >
              {new Date(notification.dateCreation).toLocaleTimeString('fr-FR', {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </Typography>
          </Box>

          {/* Barre de progression pour l'auto-fermeture */}
          <Box
            sx={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              height: 3,
              bgcolor: getTypeColor(notification.type),
              animation: 'shrink 5s linear forwards',
              '@keyframes shrink': {
                '0%': { width: '100%' },
                '100%': { width: '0%' }
              }
            }}
          />
        </Box>
      </Paper>
    </Slide>
  );
};

export default NotificationToast; 