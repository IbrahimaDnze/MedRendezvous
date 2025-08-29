import React, { useEffect, useState } from 'react';
import axios from 'axios';
import API_BASE_URL from '../../../config/api';
import {
  Box,
  Paper,
  Typography,
  Stack,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Switch,
  Tooltip,
  Chip,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';

const SpecialitesAdminPage = () => {
  const [items, setItems] = useState([]);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(true);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [description, setDescription] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all | active | inactive
  const [query, setQuery] = useState('');
  const token = localStorage.getItem('token');
  const [editOpen, setEditOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editFile, setEditFile] = useState(null);
  const [editPreview, setEditPreview] = useState('');

  const fetchAll = async () => {
    setLoading(true);
    const res = await axios.get(`${API_BASE_URL}/api/admin/specialites`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setItems(res.data.specialites || []);
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const add = async () => {
    if (!name.trim()) return;
    const form = new FormData();
    form.append('name', name);
    if (file) form.append('image', file);
    if (description) form.append('description', description);
    await axios.post(`${API_BASE_URL}/api/admin/specialites`, form, {
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
    });
    setName('');
    setFile(null);
    setPreview('');
    setDescription('');
    fetchAll();
  };

  const toggleActive = async (id, active) => {
    await axios.put(`${API_BASE_URL}/api/admin/specialites/${id}/active`, { active }, {
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchAll();
  };

  const remove = async (id) => {
    await axios.delete(`${API_BASE_URL}/api/admin/specialites/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchAll();
  };

  const openEdit = (item) => {
    setEditItem(item);
    setEditName(item.name);
    setEditDesc(item.description || '');
    setEditPreview(item.image ? `${API_BASE_URL}${item.image}` : '');
    setEditFile(null);
    setEditOpen(true);
  };

  const submitEdit = async () => {
    if (!editItem) return;
    const form = new FormData();
    if (editName) form.append('name', editName);
    form.append('description', editDesc || '');
    if (editFile) form.append('image', editFile);
    await axios.put(`${API_BASE_URL}/api/admin/specialites/${editItem._id}`, form, {
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
    });
    setEditOpen(false);
    setEditItem(null);
    setEditName('');
    setEditDesc('');
    setEditFile(null);
    setEditPreview('');
    fetchAll();
  };

  // Filtrage des éléments visibles (côté admin)
  const filteredItems = items.filter((s) => {
    const matchStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && s.active) ||
      (statusFilter === 'inactive' && !s.active);
    const q = query.trim().toLowerCase();
    const matchQuery =
      !q ||
      s.name.toLowerCase().includes(q) ||
      (s.description || '').toLowerCase().includes(q) ||
      (s.slug || '').toLowerCase().includes(q);
    return matchStatus && matchQuery;
  });

  return (
    <Box>
      {/* Header */}
      <Paper elevation={0} sx={{ p: 2.5, mb: 2.5, borderRadius: 3, border: (t) => `1px solid ${t.palette.divider}` }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'flex-start', sm: 'center' }} justifyContent="space-between">
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>Gestion des spécialités</Typography>
            <Typography variant="body2" color="text.secondary">Ajouter, activer/désactiver, supprimer</Typography>
          </Box>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems="center" sx={{ flexWrap: 'wrap', gap: 1, rowGap: 1, columnGap: 1, width: '100%' }}>
            <TextField size="small" label="Nouvelle spécialité" value={name} onChange={(e) => setName(e.target.value)} />
            <TextField size="small" label="Description" value={description} onChange={(e) => setDescription(e.target.value)} sx={{ minWidth: 260 }} />
            <Button component="label" variant="outlined">
              Choisir une image
              <input hidden type="file" accept="image/*" onChange={(e) => {
                const f = e.target.files && e.target.files[0];
                if (f) {
                  setFile(f);
                  const url = URL.createObjectURL(f);
                  setPreview(url);
                }
              }} />
            </Button>
            <Select size="small" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} sx={{ minWidth: 140 }}>
              <MenuItem value="all">Toutes</MenuItem>
              <MenuItem value="active">Visibles</MenuItem>
              <MenuItem value="inactive">Masquées</MenuItem>
            </Select>
            <TextField size="small" label="Rechercher" value={query} onChange={(e) => setQuery(e.target.value)} />
            <Button variant="contained" color="secondary" startIcon={<AddIcon />} onClick={add}>
              Ajouter
            </Button>
          </Stack>
        </Stack>
      </Paper>

      {/* Table */}
      <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 3, border: (t) => `1px solid ${t.palette.divider}` }}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ bgcolor: 'primary.main', color: 'primary.contrastText', fontWeight: 800 }}>Image</TableCell>
              <TableCell sx={{ bgcolor: 'primary.main', color: 'primary.contrastText', fontWeight: 800 }}>Nom</TableCell>
              <TableCell sx={{ bgcolor: 'primary.main', color: 'primary.contrastText', fontWeight: 800 }}>Slug</TableCell>
              <TableCell sx={{ bgcolor: 'primary.main', color: 'primary.contrastText', fontWeight: 800 }}>Description</TableCell>
              <TableCell sx={{ bgcolor: 'primary.main', color: 'primary.contrastText', fontWeight: 800 }}>Statut</TableCell>
              <TableCell align="right" sx={{ bgcolor: 'primary.main', color: 'primary.contrastText', fontWeight: 800 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredItems.map((s) => (
              <TableRow key={s._id} sx={{ '&:nth-of-type(odd)': { bgcolor: 'action.hover' } }}>
                <TableCell>
                  {s.image ? (
                    <Box component="img" src={`${API_BASE_URL}${s.image}`} alt={s.name} sx={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 1 }} />
                  ) : (
                    <Box sx={{ width: 48, height: 48, bgcolor: 'action.hover', borderRadius: 1 }} />
                  )}
                </TableCell>
                <TableCell>
                  <Typography sx={{ fontWeight: 600 }}>{s.name}</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="text.secondary">{s.slug}</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="text.secondary">{s.description || ''}</Typography>
                </TableCell>
                <TableCell>
                  <Chip label={s.active ? 'Active' : 'Inactive'} color={s.active ? 'success' : 'default'} size="small" sx={{ mr: 1 }} />
                  <Switch checked={!!s.active} onChange={(e) => toggleActive(s._id, e.target.checked)} color="success" />
                </TableCell>
                <TableCell align="right">
                  <Tooltip title="Modifier">
                    <IconButton color="primary" onClick={() => openEdit(s)}>
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Supprimer">
                    <IconButton color="error" onClick={() => remove(s._id)}>
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
            {(!items || items.length === 0) && (
              <TableRow>
                <TableCell colSpan={4}>
                  <Box sx={{ py: 4, textAlign: 'center' }}>
                    <Typography color="text.secondary">Aucune spécialité</Typography>
                  </Box>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    {preview && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="caption" color="text.secondary">Aperçu</Typography>
          <Box component="img" src={preview} alt="aperçu" sx={{ display: 'block', mt: 1, width: 72, height: 72, objectFit: 'cover', borderRadius: 1, border: (t) => `1px solid ${t.palette.divider}` }} />
        </Box>
      )}
    {/* Dialog d'édition */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Modifier la spécialité</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Nom" value={editName} onChange={(e) => setEditName(e.target.value)} fullWidth />
            <TextField label="Description" value={editDesc} onChange={(e) => setEditDesc(e.target.value)} fullWidth multiline rows={3} />
            <Button component="label" variant="outlined">
              Modifier l'image
              <input hidden type="file" accept="image/*" onChange={(e) => {
                const f = e.target.files && e.target.files[0];
                if (f) {
                  setEditFile(f);
                  setEditPreview(URL.createObjectURL(f));
                }
              }} />
            </Button>
            {editPreview && (
              <Box component="img" src={editPreview} alt="aperçu" sx={{ width: 96, height: 96, objectFit: 'cover', borderRadius: 1, border: (t) => `1px solid ${t.palette.divider}` }} />
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)}>Annuler</Button>
          <Button onClick={submitEdit} variant="contained">Enregistrer</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SpecialitesAdminPage;