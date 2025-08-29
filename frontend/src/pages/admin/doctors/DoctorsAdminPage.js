import React, { useEffect, useState } from 'react';
import axios from 'axios';
import API_BASE_URL from '../../../config/api';
import {
  Box,
  Paper,
  Typography,
  Stack,
  Avatar,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Select,
  MenuItem,
  Switch,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Button,
} from '@mui/material';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingActionsIcon from '@mui/icons-material/PendingActions';

const DoctorsAdminPage = () => {
  const [medecins, setMedecins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);

  const fetchMedecins = async (statut = 'all') => {
    setLoading(true);
    const token = localStorage.getItem('token');
    const url = statut === 'all' ? `${API_BASE_URL}/api/admin/medecins` : `${API_BASE_URL}/api/admin/medecins?statut=${statut}`;
    const res = await axios.get(url, {
      headers: { Authorization: `Bearer ${token}` }
    });
    setMedecins(res.data.medecins || []);
    setLoading(false);
  };

  useEffect(() => { fetchMedecins(statusFilter); }, [statusFilter]);

  const toggleValidation = async (id, checked) => {
    const token = localStorage.getItem('token');
    if (checked) {
      await axios.put(`${API_BASE_URL}/api/admin/medecins/${id}/validate`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
    }
    fetchMedecins(statusFilter);
  };

  const updateStatus = async (id, statut) => {
    const token = localStorage.getItem('token');
    await axios.put(`${API_BASE_URL}/api/admin/medecins/${id}/status`, { statut }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    fetchMedecins(statusFilter);
  };

  return (
    <Box>
      {/* Header */}
      <Paper elevation={0} sx={{ p: 2.5, mb: 2.5, borderRadius: 3, border: (t) => `1px solid ${t.palette.divider}` }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'flex-start', sm: 'center' }} justifyContent="space-between">
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>Gestion des médecins</Typography>
            <Typography variant="body2" color="text.secondary">Validation et statut</Typography>
          </Box>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Typography variant="body2" color="text.secondary">Filtrer par statut</Typography>
            <Select
              size="small"
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); fetchMedecins(e.target.value); }}
              sx={{ minWidth: 160 }}
            >
              <MenuItem value="all">Tous</MenuItem>
              <MenuItem value="actif">Actif</MenuItem>
              <MenuItem value="inactif">Inactif</MenuItem>
              <MenuItem value="en_conge">En congé</MenuItem>
            </Select>
          </Stack>
        </Stack>
      </Paper>

      {/* Table */}
      <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 3, border: (t) => `1px solid ${t.palette.divider}` }}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ bgcolor: 'primary.main', color: 'primary.contrastText', fontWeight: 800 }}>Médecin</TableCell>
              <TableCell sx={{ bgcolor: 'primary.main', color: 'primary.contrastText', fontWeight: 800 }}>Spécialité</TableCell>
              <TableCell sx={{ bgcolor: 'primary.main', color: 'primary.contrastText', fontWeight: 800 }}>Validation</TableCell>
              <TableCell sx={{ bgcolor: 'primary.main', color: 'primary.contrastText', fontWeight: 800 }}>Statut</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {medecins.map(m => (
              <TableRow key={m.id} sx={{ '&:nth-of-type(odd)': { bgcolor: 'action.hover' } }}>
                <TableCell>
                  <Stack 
                    direction="row" 
                    spacing={1.5} 
                    alignItems="center" 
                    sx={{ cursor: 'pointer' }}
                    onClick={() => {
                      setSelectedDoctor(m);
                      setOpenDialog(true);
                    }}
                  >
                    <Avatar src={m.avatar || undefined} alt={m.nom} sx={{ width: 36, height: 36 }}>
                      <LocalHospitalIcon fontSize="small" />
                    </Avatar>
                    <Box>
                      <Typography sx={{ fontWeight: 600 }}>{m.nom || '—'}</Typography>
                      <Typography variant="caption" color="text.secondary">{m.email || '—'}</Typography>
                    </Box>
                  </Stack>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="text.secondary">{m.specialite}</Typography>
                </TableCell>
                <TableCell>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Chip
                      label={m.valide ? 'Validé' : 'En attente'}
                      color={m.valide ? 'success' : 'warning'}
                      size="small"
                      icon={m.valide ? <CheckCircleIcon sx={{ fontSize: 18 }} /> : <PendingActionsIcon sx={{ fontSize: 18 }} />}
                      sx={{ fontWeight: 700 }}
                    />
                    <Tooltip title={m.valide ? 'Déjà validé' : 'Valider'}>
                      <Switch
                        checked={m.valide}
                        onChange={(e) => toggleValidation(m.id, e.target.checked)}
                        color="success"
                      />
                    </Tooltip>
                  </Stack>
                </TableCell>
                <TableCell>
                  <Select size="small" value={m.statut} onChange={(e) => updateStatus(m.id, e.target.value)} sx={{ minWidth: 160 }}>
                    <MenuItem value="actif">actif</MenuItem>
                    <MenuItem value="inactif">inactif</MenuItem>
                    <MenuItem value="en_conge">en_conge</MenuItem>
                  </Select>
                </TableCell>
              </TableRow>
            ))}
            {(!medecins || medecins.length === 0) && (
              <TableRow>
                <TableCell colSpan={4}>
                  <Box sx={{ py: 4, textAlign: 'center' }}>
                    <Typography color="text.secondary">Aucun médecin</Typography>
                  </Box>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <Dialog 
        open={openDialog} 
        onClose={() => setOpenDialog(false)} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: 24
          }
        }}
      >
        {selectedDoctor && (
          <>
            <DialogTitle 
              sx={{ 
                pb: 2,
                background: (theme) => theme.palette.primary.main,
                color: 'white'
              }}
            >
              <Stack direction="row" spacing={2} alignItems="center">
                <Avatar 
                  src={selectedDoctor.avatar || undefined} 
                  alt={selectedDoctor.nom}
                  sx={{ 
                    width: 80, 
                    height: 80,
                    border: '3px solid white',
                    boxShadow: 2
                  }}
                >
                  <LocalHospitalIcon sx={{ fontSize: 40 }} />
                </Avatar>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                    {selectedDoctor.nom}
                  </Typography>
                  <Typography variant="h6" sx={{ opacity: 0.9 }}>
                    {selectedDoctor.specialite}
                  </Typography>
                </Box>
              </Stack>
            </DialogTitle>
            <DialogContent 
              sx={{ 
                py: 4,
                px: 3,
                background: (theme) => theme.palette.background.default
              }}
            >
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Paper 
                    elevation={0} 
                    sx={{ 
                      p: 2, 
                      height: '100%',
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 2
                    }}
                  >
                    <Typography 
                      variant="subtitle2" 
                      color="primary" 
                      sx={{ 
                        mb: 1,
                        fontWeight: 'bold',
                        textTransform: 'uppercase',
                        letterSpacing: 0.5
                      }}
                    >
                      Contact
                    </Typography>
                    <Stack spacing={2}>
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">Email</Typography>
                        <Typography variant="body1">{selectedDoctor.email || '—'}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">Téléphone</Typography>
                        <Typography variant="body1">{selectedDoctor.telephone || '—'}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">Adresse</Typography>
                        <Typography variant="body1">{selectedDoctor.adresse || '—'}</Typography>
                      </Box>
                    </Stack>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Paper 
                    elevation={0} 
                    sx={{ 
                      p: 2, 
                      height: '100%',
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 2
                    }}
                  >
                    <Typography 
                      variant="subtitle2" 
                      color="primary" 
                      sx={{ 
                        mb: 1,
                        fontWeight: 'bold',
                        textTransform: 'uppercase',
                        letterSpacing: 0.5
                      }}
                    >
                      Informations Professionnelles
                    </Typography>
                    <Stack spacing={2}>
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">Numéro RPPS</Typography>
                        <Typography variant="body1">{selectedDoctor.numeroRPPS || '—'}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">Hôpital/Clinique</Typography>
                        <Typography variant="body1">{selectedDoctor.hopital || '—'}</Typography>
                      </Box>
                    </Stack>
                  </Paper>
                </Grid>
                <Grid item xs={12}>
                  <Paper 
                    elevation={0} 
                    sx={{ 
                      p: 2,
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 2
                    }}
                  >
                    <Typography 
                      variant="subtitle2" 
                      color="primary" 
                      sx={{ 
                        mb: 1,
                        fontWeight: 'bold',
                        textTransform: 'uppercase',
                        letterSpacing: 0.5
                      }}
                    >
                      Parcours
                    </Typography>
                    <Stack spacing={2}>
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">Formation</Typography>
                        <Typography variant="body1">{selectedDoctor.formation || '—'}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">Expérience</Typography>
                        <Typography variant="body1">{selectedDoctor.experience || '—'}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">Langues parlées</Typography>
                        <Typography variant="body1">{selectedDoctor.langues?.join(', ') || '—'}</Typography>
                      </Box>
                    </Stack>
                  </Paper>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions sx={{ px: 3, py: 2, bgcolor: 'background.paper' }}>
              <Button 
                onClick={() => setOpenDialog(false)}
                variant="contained"
                sx={{ 
                  px: 4,
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 'bold'
                }}
              >
                Fermer
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default DoctorsAdminPage;