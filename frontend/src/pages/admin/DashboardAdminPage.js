import React, { useEffect, useState } from 'react';
import axios from 'axios';
import API_BASE_URL from '../../config/api';
import {
  Grid,
  Paper,
  Typography,
  Box,
  Avatar,
  Stack,
  Skeleton,
  Divider,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import PeopleIcon from '@mui/icons-material/People';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import EventNoteIcon from '@mui/icons-material/EventNote';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import CancelIcon from '@mui/icons-material/Cancel';

const StatCard = ({ title, value, icon, color = 'primary', subtitle }) => {
  const theme = useTheme();
  const palette = theme.palette[color] || theme.palette.primary;

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        borderRadius: 3,
        position: 'relative',
        overflow: 'hidden',
        bgcolor: 'background.paper',
        border: (t) => `1px solid ${t.palette.divider}`,
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          background: `linear-gradient(135deg, ${palette.light}22 0%, transparent 60%)`,
          pointerEvents: 'none',
        }}
      />
      <Stack direction="row" spacing={2} alignItems="center">
        <Avatar sx={{ bgcolor: palette.main, color: palette.contrastText, width: 48, height: 48 }}>
          {icon}
        </Avatar>
        <Box>
          <Typography variant="body2" color="text.secondary">
            {title}
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 800 }}>
            {value}
          </Typography>
          {subtitle && (
            <Typography variant="caption" color="text.secondary">
              {subtitle}
            </Typography>
          )}
        </Box>
      </Stack>
    </Paper>
  );
};

const DashboardAdminPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const fetchStats = async () => {
      try {
        const r = await axios.get(`${API_BASE_URL}/api/admin/stats`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStats(r.data);
      } catch (e) {
        setStats(null);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const renderSkeleton = () => (
    <Grid container spacing={2}>
      {Array.from({ length: 10 }).map((_, i) => (
        <Grid item xs={12} sm={6} md={3} key={i}>
          <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: (t) => `1px solid ${t.palette.divider}` }}>
            <Stack direction="row" spacing={2} alignItems="center">
              <Skeleton variant="circular" width={48} height={48} />
              <Box sx={{ flexGrow: 1 }}>
                <Skeleton width="40%" />
                <Skeleton width="60%" />
              </Box>
            </Stack>
          </Paper>
        </Grid>
      ))}
    </Grid>
  );

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 800 }}>Tableau de bord</Typography>
        <Typography variant="body2" color="text.secondary">
          Vue d'ensemble des utilisateurs, médecins et rendez-vous
        </Typography>
      </Box>

      {loading || !stats ? (
        renderSkeleton()
      ) : (
        <Stack spacing={3}>
          {/* Utilisateurs */}
          <Box>
            <Typography variant="overline" color="text.secondary">Utilisateurs</Typography>
            <Grid container spacing={2} sx={{ mt: 0.5 }}>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  title="Total utilisateurs"
                  value={stats.users.total}
                  icon={<PeopleIcon />}
                  color="primary"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  title="Patients"
                  value={stats.users.patients}
                  icon={<PeopleIcon />}
                  color="info"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  title="Médecins (comptes)"
                  value={stats.users.medecinsUsers}
                  icon={<LocalHospitalIcon />}
                  color="secondary"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  title="Administrateurs"
                  value={stats.users.admins}
                  icon={<AdminPanelSettingsIcon />}
                  color="primary"
                />
              </Grid>
            </Grid>
          </Box>

          <Divider />

          {/* Médecins */}
          <Box>
            <Typography variant="overline" color="text.secondary">Profils médecins</Typography>
            <Grid container spacing={2} sx={{ mt: 0.5 }}>
              <Grid item xs={12} sm={6} md={4}>
                <StatCard
                  title="Total profils"
                  value={stats.medecins.total}
                  icon={<LocalHospitalIcon />}
                  color="primary"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <StatCard
                  title="Validés"
                  value={stats.medecins.valides}
                  icon={<CheckCircleIcon />}
                  color="success"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <StatCard
                  title="En attente"
                  value={stats.medecins.enAttente}
                  icon={<PendingActionsIcon />}
                  color="warning"
                />
              </Grid>
            </Grid>
          </Box>

          <Divider />

          {/* Rendez-vous */}
          <Box>
            <Typography variant="overline" color="text.secondary">Rendez-vous</Typography>
            <Grid container spacing={2} sx={{ mt: 0.5 }}>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  title="Total RDV"
                  value={stats.rendezvous.total}
                  icon={<EventNoteIcon />}
                  color="info"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  title="En attente"
                  value={stats.rendezvous.enAttente}
                  icon={<PendingActionsIcon />}
                  color="warning"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  title="Confirmés"
                  value={stats.rendezvous.confirmes}
                  icon={<CheckCircleIcon />}
                  color="success"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  title="Annulés"
                  value={stats.rendezvous.annules}
                  icon={<CancelIcon />}
                  color="error"
                />
              </Grid>
            </Grid>
          </Box>
        </Stack>
      )}
    </Box>
  );
};

export default DashboardAdminPage;