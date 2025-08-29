import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';

// Import the fixed pages
import MessagerieMedecinPage from './pages/MessagerieMedecinPage';
import NotificationsMedecinPage from './pages/NotificationsMedecinPage';
import NotificationsPage from './pages/NotificationsPage';
import ProfilMedecinPage from './pages/ProfilMedecinPage';
import RegisterPage from './pages/RegisterPage';
import AppointmentsAdminPage from './pages/admin/appointments/AppointmentsAdminPage';
import DoctorsAdminPage from './pages/admin/doctors/DoctorsAdminPage';
import SpecialitesAdminPage from './pages/admin/specialites/SpecialitesAdminPage';
import UsersAdminPage from './pages/admin/users/UsersAdminPage';

// Create a basic theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
});

// Mock providers for preview
const MockAuthProvider = ({ children }) => children;
const MockSnackbarProvider = ({ children }) => children;

const HomePage = () => (
  <Box sx={{
    minHeight: '100vh',
    background: 'linear-gradient(120deg, #a1c4fd 0%, #c2e9fb 50%, #fbc2eb 100%)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    p: 4
  }}>
    <Typography variant="h2" sx={{ 
      fontWeight: 900, 
      color: '#2a3eb1', 
      mb: 4,
      textAlign: 'center'
    }}>
      Syntax Fixes Preview
    </Typography>
    <Typography variant="h6" sx={{ 
      color: '#4f4f4f', 
      mb: 6,
      textAlign: 'center'
    }}>
      All React syntax errors have been fixed
    </Typography>
    
    <Stack spacing={2} sx={{ maxWidth: 600, width: '100%' }}>
      <Typography variant="h5" sx={{ fontWeight: 700, color: '#1976d2', mb: 2 }}>
        Fixed Pages:
      </Typography>
      
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 2 }}>
        <Button variant="contained" href="/messagerie-medecin" sx={{ py: 1.5 }}>
          Messagerie Médecin
        </Button>
        <Button variant="contained" href="/notifications-medecin" sx={{ py: 1.5 }}>
          Notifications Médecin
        </Button>
        <Button variant="contained" href="/notifications" sx={{ py: 1.5 }}>
          Notifications Patient
        </Button>
        <Button variant="contained" href="/profil-medecin" sx={{ py: 1.5 }}>
          Profil Médecin
        </Button>
        <Button variant="contained" href="/register" sx={{ py: 1.5 }}>
          Inscription
        </Button>
        <Button variant="contained" href="/admin/appointments" sx={{ py: 1.5 }}>
          Admin - RDV
        </Button>
        <Button variant="contained" href="/admin/doctors" sx={{ py: 1.5 }}>
          Admin - Médecins
        </Button>
        <Button variant="contained" href="/admin/specialites" sx={{ py: 1.5 }}>
          Admin - Spécialités
        </Button>
        <Button variant="contained" href="/admin/users" sx={{ py: 1.5 }}>
          Admin - Utilisateurs
        </Button>
      </Box>
      
      <Box sx={{ mt: 4, p: 3, bgcolor: 'rgba(255,255,255,0.9)', borderRadius: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, color: '#2e7d32', mb: 2 }}>
          ✅ Fixed Issues:
        </Typography>
        <Typography variant="body2" component="div" sx={{ color: '#666' }}>
          • Missing closing quotes in template literals (all instances)<br/>
          • Incorrect import paths for API_BASE_URL in admin pages<br/>
          • Malformed conditional expressions<br/>
          • Missing API_BASE_URL import in RegisterPage<br/>
          • Additional template literal fixes in ProfilMedecinPage and SpecialitesAdminPage<br/>
          • All compilation errors resolved
        </Typography>
      </Box>
    </Stack>
  </Box>
);

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <MockAuthProvider>
        <MockSnackbarProvider>
          <Router>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/messagerie-medecin" element={<MessagerieMedecinPage />} />
              <Route path="/notifications-medecin" element={<NotificationsMedecinPage />} />
              <Route path="/notifications" element={<NotificationsPage />} />
              <Route path="/profil-medecin" element={<ProfilMedecinPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/admin/appointments" element={<AppointmentsAdminPage />} />
              <Route path="/admin/doctors" element={<DoctorsAdminPage />} />
              <Route path="/admin/specialites" element={<SpecialitesAdminPage />} />
              <Route path="/admin/users" element={<UsersAdminPage />} />
              <Route path="*" element={<HomePage />} />
            </Routes>
          </Router>
        </MockSnackbarProvider>
      </MockAuthProvider>
    </ThemeProvider>
  );
}

export default App;