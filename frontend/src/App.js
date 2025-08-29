import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './theme';
import Layout from './components/Layout';
import LayoutMedecin from './components/LayoutMedecin';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import DashboardMedecinPage from './pages/DashboardMedecinPage';
import DisponibilitesPage from './pages/DisponibilitesPage';
import GestionRendezVousPage from './pages/GestionRendezVousPage';
import ProfilMedecinPage from './pages/ProfilMedecinPage';
import ProfilePage from './pages/ProfilePage';
import RendezVousPage from './pages/RendezVousPage';
import MesRendezVousPage from './pages/MesRendezVousPage';
import NotificationsPage from './pages/NotificationsPage';
import AccueilPage from './pages/AccueilPage';
import MessageriePage from './pages/MessageriePage';
import MessagerieMedecinPage from './pages/MessagerieMedecinPage';
import CalendrierMedecinPage from './pages/CalendrierMedecinPage';
import NotificationsMedecinPage from './pages/NotificationsMedecinPage';
import ExportDonneesPage from './pages/ExportDonneesPage';
import MedecinsParSpecialitePage from './pages/MedecinsParSpecialitePage';
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './routes/PrivateRoute';
import PrivateRouteMedecin from './routes/PrivateRouteMedecin';
import PrivateRouteAdmin from './routes/PrivateRouteAdmin';
import { GlobalSnackbarProvider } from './components/GlobalSnackbar';
import NotificationProvider from './components/NotificationProvider';
import ArticleDetailPage from './pages/ArticleDetailPage';
import AuthCallback from './pages/AuthCallback';
import LayoutAdmin from './components/LayoutAdmin';
import DashboardAdminPage from './pages/admin/DashboardAdminPage';
import UsersAdminPage from './pages/admin/users/UsersAdminPage';
import DoctorsAdminPage from './pages/admin/doctors/DoctorsAdminPage';
import AppointmentsAdminPage from './pages/admin/appointments/AppointmentsAdminPage';
import SpecialitesAdminPage from './pages/admin/specialites/SpecialitesAdminPage';
import ProfileAdminPage from './pages/admin/ProfileAdminPage';


function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <GlobalSnackbarProvider>
        <AuthProvider>
          <NotificationProvider>
            <Router>
              <Routes>
                {/* Routes publiques */}
                <Route path="/" element={<Layout><AccueilPage /></Layout>} />
                <Route path="/register" element={<Layout><RegisterPage /></Layout>} />
                <Route path="/auth-callback" element={<AuthCallback />} />
                
                {/* Routes patient */}
                <Route path="/dashboard" element={<Layout><PrivateRoute><DashboardPage /></PrivateRoute></Layout>} />
                <Route path="/medecins/:specialite" element={<Layout><PrivateRoute><MedecinsParSpecialitePage /></PrivateRoute></Layout>} />
                <Route path="/profil" element={<Layout><PrivateRoute><ProfilePage /></PrivateRoute></Layout>} />
                <Route path="/rendezvous" element={<Layout><PrivateRoute><RendezVousPage /></PrivateRoute></Layout>} />
                <Route path="/mes-rendezvous" element={<Layout><PrivateRoute><MesRendezVousPage /></PrivateRoute></Layout>} />
                <Route path="/notifications" element={<Layout><PrivateRoute><NotificationsPage /></PrivateRoute></Layout>} />
                <Route path="/messagerie" element={<Layout><PrivateRoute><MessageriePage /></PrivateRoute></Layout>} />
                
                {/* Routes médecin */}
                <Route path="/dashboard-medecin" element={<LayoutMedecin><PrivateRouteMedecin><DashboardMedecinPage /></PrivateRouteMedecin></LayoutMedecin>} />
                <Route path="/calendrier-medecin" element={<LayoutMedecin><PrivateRouteMedecin><CalendrierMedecinPage /></PrivateRouteMedecin></LayoutMedecin>} />
                <Route path="/disponibilites" element={<LayoutMedecin><PrivateRouteMedecin><DisponibilitesPage /></PrivateRouteMedecin></LayoutMedecin>} />
                <Route path="/gestion-rendezvous" element={<LayoutMedecin><PrivateRouteMedecin><GestionRendezVousPage /></PrivateRouteMedecin></LayoutMedecin>} />
                <Route path="/messagerie-medecin" element={<LayoutMedecin><PrivateRouteMedecin><MessagerieMedecinPage /></PrivateRouteMedecin></LayoutMedecin>} />
                <Route path="/notifications-medecin" element={<LayoutMedecin><PrivateRouteMedecin><NotificationsMedecinPage /></PrivateRouteMedecin></LayoutMedecin>} />
                <Route path="/profil-medecin" element={<LayoutMedecin><PrivateRouteMedecin><ProfilMedecinPage /></PrivateRouteMedecin></LayoutMedecin>} />
                <Route path="/export-donnees" element={<LayoutMedecin><PrivateRouteMedecin><ExportDonneesPage /></PrivateRouteMedecin></LayoutMedecin>} />
                <Route path="/medecins-par-specialite" element={<LayoutMedecin><PrivateRouteMedecin><MedecinsParSpecialitePage /></PrivateRouteMedecin></LayoutMedecin>} />
                <Route path="/article/:id" element={<Layout><ArticleDetailPage /></Layout>} />

                {/* Routes admin */}
                <Route path="/admin" element={<LayoutAdmin><PrivateRouteAdmin><DashboardAdminPage /></PrivateRouteAdmin></LayoutAdmin>} />
                <Route path="/admin/users" element={<LayoutAdmin><PrivateRouteAdmin><UsersAdminPage /></PrivateRouteAdmin></LayoutAdmin>} />
                <Route path="/admin/doctors" element={<LayoutAdmin><PrivateRouteAdmin><DoctorsAdminPage /></PrivateRouteAdmin></LayoutAdmin>} />
                <Route path="/admin/appointments" element={<LayoutAdmin><PrivateRouteAdmin><AppointmentsAdminPage /></PrivateRouteAdmin></LayoutAdmin>} />
                <Route path="/admin/specialites" element={<LayoutAdmin><PrivateRouteAdmin><SpecialitesAdminPage /></PrivateRouteAdmin></LayoutAdmin>} />
                <Route path="/admin/mon-profil" element={<LayoutAdmin><PrivateRouteAdmin><ProfileAdminPage /></PrivateRouteAdmin></LayoutAdmin>} />
              </Routes>
            </Router>
          </NotificationProvider>
        </AuthProvider>
      </GlobalSnackbarProvider>
    </ThemeProvider>
  );
}

export default App;
