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
  IconButton,
  Select,
  MenuItem,
  Tooltip,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import ShieldIcon from '@mui/icons-material/AdminPanelSettings';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import PersonIcon from '@mui/icons-material/Person';

const roleMeta = {
  admin: { label: 'Admin', color: 'secondary', icon: <ShieldIcon sx={{ fontSize: 18 }} /> },
  medecin: { label: 'Médecin', color: 'info', icon: <LocalHospitalIcon sx={{ fontSize: 18 }} /> },
  patient: { label: 'Patient', color: 'success', icon: <PersonIcon sx={{ fontSize: 18 }} /> },
};

const UsersAdminPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('all');

  const fetchUsers = async (role = 'all') => {
    setLoading(true);
    const token = localStorage.getItem('token');
    const url = role === 'all' ? `${API_BASE_URL}/api/admin/users` : `${API_BASE_URL}/api/admin/users?role=${role}`;
    const res = await axios.get(url, {
      headers: { Authorization: `Bearer ${token}` }
    });
    setUsers((res.data.users || []).filter(u => u.role !== 'admin'));
    setLoading(false);
  };

  useEffect(() => { fetchUsers(roleFilter); }, [roleFilter]);

  const updateRole = async (id, role) => {
    const token = localStorage.getItem('token');
    await axios.put(`${API_BASE_URL}/api/admin/users/${id}/role`, { role }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    fetchUsers(roleFilter);
  };

  const deleteUser = async (id) => {
    const token = localStorage.getItem('token');
    await axios.delete(`${API_BASE_URL}/api/admin/users/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    fetchUsers(roleFilter);
  };

  return (
    <Box>
      {/* Header */}
      <Paper elevation={0} sx={{ p: 2.5, mb: 2.5, borderRadius: 3, border: (t) => `1px solid ${t.palette.divider}` }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'flex-start', sm: 'center' }} justifyContent="space-between">
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>Gestion des utilisateurs</Typography>
            <Typography variant="body2" color="text.secondary">Liste, rôles et suppression</Typography>
          </Box>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Typography variant="body2" color="text.secondary">Filtrer par rôle</Typography>
            <Select
              size="small"
              value={roleFilter}
              onChange={(e) => { setRoleFilter(e.target.value); fetchUsers(e.target.value); }}
              sx={{ minWidth: 160 }}
            >
              <MenuItem value="all">Tous</MenuItem>
              <MenuItem value="patient">Patients</MenuItem>
              <MenuItem value="medecin">Médecins</MenuItem>
              <MenuItem value="admin">Admins</MenuItem>
            </Select>
          </Stack>
        </Stack>
      </Paper>

      {/* Table */}
      <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 3, border: (t) => `1px solid ${t.palette.divider}` }}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ bgcolor: 'primary.main', color: 'primary.contrastText', fontWeight: 800 }}>Utilisateur</TableCell>
              <TableCell sx={{ bgcolor: 'primary.main', color: 'primary.contrastText', fontWeight: 800 }}>Email</TableCell>
              <TableCell sx={{ bgcolor: 'primary.main', color: 'primary.contrastText', fontWeight: 800 }}>Rôle</TableCell>
              <TableCell align="right" sx={{ bgcolor: 'primary.main', color: 'primary.contrastText', fontWeight: 800 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map(u => {
              const meta = roleMeta[u.role] || { label: u.role, color: 'default' };
              return (
                <TableRow key={u._id} sx={{ '&:nth-of-type(odd)': { bgcolor: 'action.hover' } }}>
                  <TableCell>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <Avatar src={u.avatar || undefined} alt={u.nom} sx={{ width: 36, height: 36 }}>
                        {u.nom?.charAt(0)?.toUpperCase()}
                      </Avatar>
                      <Typography sx={{ fontWeight: 600 }}>{u.nom}</Typography>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">{u.email}</Typography>
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Chip
                        label={meta.label}
                        color={meta.color}
                        size="small"
                        icon={meta.icon || undefined}
                        sx={{ fontWeight: 700 }}
                      />
                      <Select
                        size="small"
                        value={u.role}
                        onChange={(e) => updateRole(u._id, e.target.value)}
                        sx={{ minWidth: 140 }}
                      >
                        <MenuItem value="patient">patient</MenuItem>
                        <MenuItem value="medecin">medecin</MenuItem>
                        <MenuItem value="admin">admin</MenuItem>
                      </Select>
                    </Stack>
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Supprimer l'utilisateur">
                      <IconButton color="error" onClick={() => deleteUser(u._id)}>
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              );
            })}
            {(!users || users.length === 0) && (
              <TableRow>
                <TableCell colSpan={4}>
                  <Box sx={{ py: 4, textAlign: 'center' }}>
                    <Typography color="text.secondary">Aucun utilisateur</Typography>
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

export default UsersAdminPage;