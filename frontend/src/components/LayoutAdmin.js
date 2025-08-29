import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Container,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Avatar,
  IconButton,
  Tooltip,
  useMediaQuery,
  Paper,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import EventNoteIcon from '@mui/icons-material/EventNote';
import HomeIcon from '@mui/icons-material/Home';
import LogoutIcon from '@mui/icons-material/Logout';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import { useAuth } from '../contexts/AuthContext';

const drawerWidth = 260;

const LayoutAdmin = ({ children }) => {
  const theme = useTheme();
  const isUpMd = useMediaQuery(theme.breakpoints.up('md'));
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const navItems = [
    { label: 'Dashboard', to: '/admin', icon: <DashboardIcon /> },
    { label: 'Utilisateurs', to: '/admin/users', icon: <PeopleIcon /> },
    { label: 'Médecins', to: '/admin/doctors', icon: <LocalHospitalIcon /> },
    { label: 'Rendez-vous', to: '/admin/appointments', icon: <EventNoteIcon /> },
    { label: 'Spécialités', to: '/admin/specialites', icon: <LocalHospitalIcon /> },
  ];

  const DrawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', color: 'common.white' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 2, py: 2 }}>
        <Avatar sx={{ bgcolor: 'primary.main', width: 40, height: 40 }}>
          <AdminPanelSettingsIcon />
        </Avatar>
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 800, lineHeight: 1.1 }}>
            Admin Panel
          </Typography>
          <Typography variant="caption" color="text.secondary">
            MedRendezVous
          </Typography>
        </Box>
      </Box>
      <Divider />

      <List sx={{ px: 1, py: 1 }}>
        {navItems.map((item) => {
          const selected = location.pathname === item.to;
          return (
            <ListItemButton
              key={item.to}
              component={Link}
              to={item.to}
              selected={selected}
              sx={{
                mb: 0.5,
                borderRadius: 2,
                color: 'rgba(255,255,255,0.9)',
                '&.Mui-selected': {
                  bgcolor: 'rgba(255,255,255,0.18)',
                  color: '#ffffff',
                  '& .MuiListItemIcon-root': { color: '#ffffff' },
                },
                '&:hover': {
                  bgcolor: 'rgba(255,255,255,0.12)',
                },
              }}
            >
              <ListItemIcon sx={{ color: selected ? '#ffffff' : 'rgba(255,255,255,0.8)' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.label} primaryTypographyProps={{ fontWeight: selected ? 700 : 500 }} />
            </ListItemButton>
          );
        })}
      </List>

      <Box sx={{ flexGrow: 1 }} />
      <Divider />

      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Avatar
          alt={user?.nom}
          src={user?.avatar || undefined}
          sx={{ width: 40, height: 40, cursor: 'pointer' }}
          onClick={() => navigate('/admin/mon-profil')}
        />
        <Box sx={{ minWidth: 0 }}>
          <Typography noWrap variant="body2" sx={{ fontWeight: 700 }}>
            {user?.nom || 'Administrateur'}
          </Typography>
          <Typography noWrap variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
            {user?.email}
          </Typography>
        </Box>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default', overflowX: 'hidden' }}>
      {/* AppBar */}
      <AppBar
        position="fixed"
        elevation={0}
        color="primary"
        sx={{
          ml: { md: `${drawerWidth}px` },
          width: { md: `calc(100% - ${drawerWidth}px)` },
          backgroundImage: 'linear-gradient(90deg, #2a3eb1 0%, #5b6fd6 100%)',
          color: 'primary.contrastText',
        }}
      >
        <Toolbar sx={{ minHeight: 72 }}>
          <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: 0.5, flexGrow: 1 }}>
            MedRendezVous — Administration
          </Typography>
          <Tooltip title="Aller au site public">
            <IconButton color="inherit" component={Link} to="/" sx={{ '&:hover': { backgroundColor: 'rgba(255,255,255,0.12)' } }}>
              <HomeIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Se déconnecter">
            <IconButton
              color="error"
              onClick={() => {
                logout();
                navigate('/');
              }}
            >
              <LogoutIcon />
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>

      {/* Drawer */}
      {isUpMd ? (
        <Drawer
          variant="permanent"
          open
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              boxSizing: 'border-box',
              backgroundImage: 'linear-gradient(180deg, #2a3eb1 0%, #5b6fd6 50%, #ff5983 100%)',
              color: '#ffffff',
            },
          }}
        >
          {DrawerContent}
        </Drawer>
      ) : (
        <Drawer
          variant="temporary"
          open
          sx={{
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              backgroundImage: 'linear-gradient(180deg, #2a3eb1 0%, #5b6fd6 50%, #ff5983 100%)',
              color: '#ffffff',
            },
          }}
        >
          {DrawerContent}
        </Drawer>
      )}

      {/* Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          ml: { md: `${drawerWidth}px` },
          width: { xs: '100vw', md: `calc(100vw - ${drawerWidth}px)` },
          pt: { xs: 10, md: 12 },
          pb: 6,
          minHeight: '100vh',
          overflowX: 'hidden',
          background: (theme) =>
            theme.palette.mode === 'light'
              ? 'linear-gradient(135deg, #f5f9ff 0%, #eef3fb 50%, #fdfdff 100%)'
              : 'linear-gradient(135deg, #0f1115 0%, #0b0d10 50%, #0a0b0d 100%)',
        }}
      >
        <Container maxWidth={false} disableGutters sx={{ px: 0 }}>
          <Paper elevation={0} sx={{ p: 0, borderRadius: 0, border: 'none', boxShadow: 'none', backgroundColor: 'background.paper', width: '100%' }}>
            {children}
          </Paper>
        </Container>
      </Box>
    </Box>
  );
};

export default LayoutAdmin;
