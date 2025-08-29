import React from 'react';
import { Box, Typography, Avatar, IconButton, Tooltip } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PersonIcon from '@mui/icons-material/Person';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

const MessageNotification = ({ notification, onClose, onMarkAsRead }) => {
  
  const handleArrowClick = async (e) => {
    e.stopPropagation();
    await onMarkAsRead(notification._id);
    onClose();
    // Rediriger vers la messagerie si c'est un message
    if (notification.type === 'message' && notification.donnees?.conversationId) {
      window.location.href = `/messagerie?conversation=${notification.donnees.conversationId}`;
    }
  };

  const handleCloseClick = async () => {
    await onMarkAsRead(notification._id);
    onClose();
  };

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 20,
        right: 20,
        zIndex: 9999,
        bgcolor: 'white',
        borderRadius: 3,
        boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
        border: '1px solid rgba(0,0,0,0.08)',
        maxWidth: 350,
        minWidth: 300,
        p: 2,
        animation: 'slideIn 0.3s ease-out',
        '@keyframes slideIn': {
          '0%': {
            transform: 'translateX(100%)',
            opacity: 0
          },
          '100%': {
            transform: 'translateX(0)',
            opacity: 1
          }
        }
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
        <Avatar 
          src={notification.expediteur?.avatar}
          sx={{ 
            width: 40, 
            height: 40,
            bgcolor: '#3b82f6'
          }}
        >
          {notification.expediteur?.nom?.charAt(0) || <PersonIcon />}
        </Avatar>
        
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#1a1a1a' }}>
              {notification.titre}
            </Typography>
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              {notification.type === 'message' && (
                <Tooltip title="Aller à la conversation">
                  <IconButton
                    size="small"
                    onClick={handleArrowClick}
                    sx={{ 
                      color: '#3b82f6',
                      bgcolor: 'rgba(59, 130, 246, 0.1)',
                      '&:hover': { 
                        bgcolor: 'rgba(59, 130, 246, 0.2)',
                        transform: 'scale(1.1)'
                      },
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <ArrowForwardIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
              <Tooltip title="Fermer la notification">
                <IconButton
                  size="small"
                  onClick={handleCloseClick}
                  sx={{ 
                    color: '#999',
                    '&:hover': { 
                      color: '#666',
                      bgcolor: 'rgba(0,0,0,0.05)'
                    },
                    transition: 'all 0.2s ease'
                  }}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
          
          <Typography 
            variant="body2" 
            sx={{ 
              color: '#666',
              mb: 1
            }}
          >
            {notification.message}
          </Typography>
          
          <Typography variant="caption" sx={{ color: '#999' }}>
            {new Date(notification.dateCreation).toLocaleTimeString('fr-FR', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default MessageNotification; 