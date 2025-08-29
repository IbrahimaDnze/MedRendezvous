import React, { useEffect, useState } from 'react';
import axios from 'axios';
import API_BASE_URL from '../../../config/api';
import {
  Box,
  Paper,
  Typography,
  Stack,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import CancelIcon from '@mui/icons-material/Cancel';

const statusMeta = {
  'en attente': { label: 'En attente', color: 'warning', icon: <PendingActionsIcon sx={{ fontSize: 18 }} /> },
  'confirmé': { label: 'Confirmé', color: 'success', icon: <CheckCircleIcon sx={{ fontSize: 18 }} /> },
  'annulé': { label: 'Annulé', color: 'error', icon: <CancelIcon sx={{ fontSize: 18 }} /> },
};

const AppointmentsAdminPage = () => {
  const [rdvs, setRdvs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRdvs = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    const res = await axios.get(`${API_BASE_URL}/api/admin/rendezvous`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    setRdvs(res.data.rdvs || []);
    setLoading(false);
  };

  useEffect(() => { fetchRdvs(); }, []);

  const deleteRdv = async (id) => {
    const token = localStorage.getItem('token');
    await axios.delete(`${API_BASE_URL}/api/admin/rendezvous/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    fetchRdvs();
  };

  return (
    <Box>
      {/* Header */}
      <Paper elevation={0} sx={{ p: 2.5, mb: 2.5, borderRadius: 3, border: (t) => `1px solid ${t.palette.divider}` }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'flex-start', sm: 'center' }} justifyContent="space-between">
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>Gestion des rendez-vous</Typography>
            <Typography variant="body2" color="text.secondary">Liste et suppression</Typography>
          </Box>
        </Stack>
      </Paper>

      {/* Table */}
      <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 3, border: (t) => `1px solid ${t.palette.divider}` }}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ bgcolor: 'primary.main', color: 'primary.contrastText', fontWeight: 800 }}>Date</TableCell>
              <TableCell sx={{ bgcolor: 'primary.main', color: 'primary.contrastText', fontWeight: 800 }}>Heure</TableCell>
              <TableCell sx={{ bgcolor: 'primary.main', color: 'primary.contrastText', fontWeight: 800 }}>Patient</TableCell>
              <TableCell sx={{ bgcolor: 'primary.main', color: 'primary.contrastText', fontWeight: 800 }}>Médecin</TableCell>
              <TableCell sx={{ bgcolor: 'primary.main', color: 'primary.contrastText', fontWeight: 800 }}>Statut</TableCell>
              <TableCell align="right" sx={{ bgcolor: 'primary.main', color: 'primary.contrastText', fontWeight: 800 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rdvs.map(r => {
              const meta = statusMeta[r.statut] || { label: r.statut, color: 'default' };
              return (
                <TableRow key={r._id} sx={{ '&:nth-of-type(odd)': { bgcolor: 'action.hover' } }}>
                  <TableCell>{new Date(r.date).toLocaleDateString('fr-FR')}</TableCell>
                  <TableCell>{r.heure}</TableCell>
                  <TableCell>{r.patient?.nom} ({r.patient?.email})</TableCell>
                  <TableCell>{r.medecin?.userId?.nom} ({r.medecin?.userId?.email})</TableCell>
                  <TableCell>
                    <Chip label={meta.label} color={meta.color} size="small" icon={meta.icon || undefined} sx={{ fontWeight: 700 }} />
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Supprimer le rendez-vous">
                      <IconButton color="error" onClick={() => deleteRdv(r._id)}>
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              );
            })}
            {(!rdvs || rdvs.length === 0) && (
              <TableRow>
                <TableCell colSpan={6}>
                  <Box sx={{ py: 4, textAlign: 'center' }}>
                    <Typography color="text.secondary">Aucun rendez-vous</Typography>
                  </Box>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default AppointmentsAdminPage;