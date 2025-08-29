import React, { useEffect, useState } from 'react';
import axios from 'axios';
import API_BASE_URL from '../../config/api';
import {
  Box,
  Paper,
  Typography,
  Stack,
  TextField,
  Button,
  Avatar,
  CircularProgress,
} from '@mui/material';
import { useSnackbar } from '../../components/GlobalSnackbar';

const ProfileAdminPage = () => {
  const { showSnackbar } = useSnackbar();
  const token = localStorage.getItem('token');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ nom: '', email: '', avatar: null });
  const [preview, setPreview] = useState('');

  const fetchProfil = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/api/users/profil`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const user = res.data?.user || {};
      setForm({ nom: user.nom || '', email: user.email || '', avatar: user.avatar || null });
      setPreview(user.avatar || '');
    } catch (e) {
      showSnackbar("Erreur lors du chargement du profil", 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProfil(); }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleAvatar = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    // Convertir en base64 pour PUT /profil (le backend accepte data:image/...)
    const reader = new FileReader();
    reader.onloadend = () => {
      setForm((f) => ({ ...f, avatar: reader.result }));
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const payload = { nom: form.nom, email: form.email };
      // N'envoyer avatar que si défini (null pour supprimer / data:image/... pour définir)
      if (form.avatar !== undefined) {
        payload.avatar = form.avatar;
      }
      await axios.put(`${API_BASE_URL}/api/users/profil`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showSnackbar('Profil mis à jour', 'success');
      // Recharger l’affichage
      fetchProfil();
    } catch (e) {
      const msg = e.response?.data?.message || 'Erreur lors de la mise à jour';
      showSnackbar(msg, 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Paper elevation={0} sx={{ p: 3, mb: 2, borderRadius: 3, border: (t) => `1px solid ${t.palette.divider}` }}>
        <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>Mon profil administrateur</Typography>
        <Typography variant="body2" color="text.secondary">Modifiez vos informations personnelles</Typography>
      </Paper>

      <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: (t) => `1px solid ${t.palette.divider}` }}>
        <Stack spacing={3}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Avatar src={preview || undefined} sx={{ width: 72, height: 72 }} />
            <Button component="label" variant="outlined">
              Changer l'avatar
              <input hidden type="file" accept="image/*" onChange={handleAvatar} />
            </Button>
            {preview && (
              <Button variant="text" color="error" onClick={() => { setForm((f) => ({ ...f, avatar: null })); setPreview(''); }}>
                Supprimer l'avatar
              </Button>
            )}
          </Stack>

          <TextField
            label="Nom"
            name="nom"
            value={form.nom}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            label="Email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            fullWidth
          />

          <Stack direction="row" spacing={2}>
            <Button variant="contained" onClick={handleSave} disabled={saving}>
              {saving ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
            <Button variant="outlined" onClick={fetchProfil} disabled={saving}>
              Réinitialiser
            </Button>
          </Stack>
        </Stack>
      </Paper>
    </Box>
  );
};

export default ProfileAdminPage;