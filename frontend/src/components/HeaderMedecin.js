import React, { useState, useEffect } from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Badge from '@mui/material/Badge';
import MenuIcon from '@mui/icons-material/Menu';
import ListAltIcon from '@mui/icons-material/ListAlt';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import HomeIcon from '@mui/icons-material/Home';
import ChatIcon from '@mui/icons-material/Chat';
import ScheduleIcon from '@mui/icons-material/Schedule';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import API_BASE_URL from '../config/api';

const navLinks = [
  { to: '/dashboard-medecin', label: 'Dashboard', icon: <HomeIcon /> },
  { to: '/disponibilites', label: 'Disponibilités', icon: <ScheduleIcon /> },
  { to: '/gestion-rendezvous', label: 'Gestion RDV', icon: <ListAltIcon /> },
  { to: '/messagerie-medecin', label: 'Messagerie', icon: <ChatIcon /> },
  { to: '/notifications-medecin', label: 'Notifications', icon: <NotificationsActiveIcon /> },
  { to: '/profil-medecin', label: 'Profil', icon: <AccountCircleIcon /> },
];

const HeaderMedecin = () => {
  const { logout, token } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const navigate = useNavigate();

  const handleLogoutClick = () => {
    setLogoutDialogOpen(true);
  };

  const handleLogoutConfirm = () => {
    logout();
    navigate('/');
    setLogoutDialogOpen(false);
  };

  const handleLogoutCancel = () => {
    setLogoutDialogOpen(false);
  };

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);

  // Fonction pour récupérer le nombre de messages non lus
  const fetchUnreadMessages = async () => {
    if (!token) return;
    
    try {
      const response = await axios.get(`${API_BASE_URL}/api/notifications/non-lues`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Compter seulement les notifications de type 'message'
      const messageNotifications = response.data.notifications?.filter(n => n.type === 'message') || [];
      setUnreadMessages(messageNotifications.length);
    } catch (error) {
      console.error('Erreur lors de la récupération des messages non lus:', error);
    }
  };

  // Fonction pour récupérer le nombre total de notifications non lues
  const fetchUnreadNotifications = async () => {
    if (!token) return;
    
    try {
      const response = await axios.get(`${API_BASE_URL}/api/notifications/non-lues`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Compter toutes les notifications non lues
      const totalUnread = response.data.notifications?.length || 0;
      setUnreadNotifications(totalUnread);
    } catch (error) {
      console.error('Erreur lors de la récupération des notifications non lues:', error);
    }
  };

  // Polling pour les messages non lus (toutes les 10 secondes)
  useEffect(() => {
    fetchUnreadMessages();
    fetchUnreadNotifications();
    
    const interval = setInterval(() => {
      fetchUnreadMessages();
      fetchUnreadNotifications();
    }, 10000);
    
    return () => clearInterval(interval);
  }, [token]);

  const drawer = (
    <Box sx={{ width: 250 }} role="presentation" onClick={handleDrawerToggle}>
      <List>
        {navLinks.map((link) => (
          <ListItem button key={link.to} component={Link} to={link.to} selected={location.pathname === link.to}>
            <ListItemIcon>
              {link.to === '/messagerie-medecin' ? (
                <Badge badgeContent={unreadMessages} color="error" max={99}>
                  {link.icon}
                </Badge>
              ) : link.to === '/notifications-medecin' ? (
                <Badge badgeContent={unreadNotifications} color="error" max={99}>
                  {link.icon}
                </Badge>
              ) : (
                link.icon
              )}
            </ListItemIcon>
            <ListItemText primary={link.label} />
          </ListItem>
        ))}
        <ListItem button onClick={handleLogoutClick}>
          <ListItemIcon><LogoutIcon /></ListItemIcon>
          <ListItemText primary="Déconnexion" />
        </ListItem>
      </List>
    </Box>
  );

  return (
    <>
      <AppBar position="sticky" color="primary" elevation={4} sx={{ zIndex: 1201 }}>
        <Toolbar>
          {/* Logo ou nom du site */}
          <Typography
            variant="h6"
            component="div"
            sx={{ flexGrow: 1, fontWeight: 900, letterSpacing: 1 }}
          >
            MedRV - Médecin
          </Typography>
          {/* Desktop navigation */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 2 }}>
            {navLinks.map((link) => (
              <Button
                key={link.to}
                component={Link}
                to={link.to}
                startIcon={
                  link.to === '/messagerie-medecin' ? (
                    <Badge badgeContent={unreadMessages} color="error" max={99}>
                      {link.icon}
                    </Badge>
                  ) : link.to === '/notifications-medecin' ? (
                    <Badge badgeContent={unreadNotifications} color="error" max={99}>
                      {link.icon}
                    </Badge>
                  ) : (
                    link.icon
                  )
                }
                color={location.pathname === link.to ? 'secondary' : 'inherit'}
                sx={{
                  fontWeight: 600,
                  borderBottom: location.pathname === link.to ? '2px solid #f50057' : '2px solid transparent',
                  borderRadius: 0,
                  transition: 'border 0.2s',
                  '&:hover': {
                    background: 'rgba(245,0,87,0.08)',
                    borderBottom: '2px solid #f50057',
                  },
                }}
              >
                {link.label}
              </Button>
            ))}
            <Button
              color="inherit"
              startIcon={<LogoutIcon />}
              onClick={handleLogoutClick}
              sx={{ fontWeight: 600, ml: 1 }}
            >
              Déconnexion
            </Button>
          </Box>
          {/* Mobile navigation */}
          <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
            <IconButton color="inherit" edge="start" onClick={handleDrawerToggle}>
              <MenuIcon />
            </IconButton>
          </Box>
          <Drawer
            anchor="left"
            open={mobileOpen}
            onClose={handleDrawerToggle}
            ModalProps={{ keepMounted: true }}
          >
            {drawer}
          </Drawer>
        </Toolbar>
      </AppBar>

      {/* Dialog de confirmation de déconnexion */}
      <Dialog
        open={logoutDialogOpen}
        onClose={handleLogoutCancel}
        aria-labelledby="logout-dialog-title"
        aria-describedby="logout-dialog-description"
        PaperProps={{
          sx: {
            borderRadius: 3,
            minWidth: 400,
            bgcolor: 'rgba(255,255,255,0.98)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
          }
        }}
      >
        <DialogTitle 
          id="logout-dialog-title" 
          sx={{ 
            fontWeight: 700, 
            color: 'primary.main',
            textAlign: 'center',
            fontSize: 24,
            letterSpacing: 1
          }}
        >
          Confirmer la déconnexion
        </DialogTitle>
        <DialogContent>
          <DialogContentText 
            id="logout-dialog-description"
            sx={{ 
              fontSize: 16, 
              color: 'text.secondary',
              textAlign: 'center',
              fontWeight: 500,
              lineHeight: 1.6
            }}
          >
            Êtes-vous sûr de vouloir vous déconnecter ? 
            Vous devrez vous reconnecter pour accéder à votre espace médecin.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 2, justifyContent: 'center' }}>
          <Button 
            onClick={handleLogoutCancel} 
            variant="outlined"
            sx={{ 
              borderRadius: 2, 
              fontWeight: 600,
              px: 4,
              py: 1.2,
              borderColor: 'grey.300',
              color: 'text.secondary',
              '&:hover': {
                borderColor: 'grey.400',
                bgcolor: 'grey.50'
              }
            }}
          >
            Annuler
          </Button>
          <Button 
            onClick={handleLogoutConfirm} 
            variant="contained" 
            color="secondary"
            sx={{ 
              borderRadius: 2, 
              fontWeight: 700,
              px: 4,
              py: 1.2,
              boxShadow: '0 4px 12px 0 rgba(245,0,87,0.3)',
              '&:hover': {
                boxShadow: '0 6px 16px 0 rgba(245,0,87,0.4)',
                transform: 'translateY(-1px)'
              }
            }}
          >
            Se déconnecter
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default HeaderMedecin; 