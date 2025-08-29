import React, { useEffect, useState } from 'react';
import axios from 'axios';
import API_BASE_URL from '../config/api';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CircularProgress from '@mui/material/CircularProgress';
import Avatar from '@mui/material/Avatar';
import Grid from '@mui/material/Grid';
import { useAuth } from '../contexts/AuthContext';
import { useSnackbar } from '../components/GlobalSnackbar';

const ValidationMedecinsPage = () => {
  const { token } = useAuth();
  const { showSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(true);
  const [medecins, setMedecins] = useState([]);
  const [validatingId, setValidatingId] = useState(null);
  const [error, setError] = useState(null);

  const fetchMedecins = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${API_BASE_URL}/admin/medecins/non-valides', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMedecins(res.data.medecins || []);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Erreur inconnue');
      showSnackbar('Erreur lors du chargement des médecins à valider', 'error');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchMedecins();
    // eslint-disable-next-line
  }, []);

  const handleValidate = async (id) => {
    setValidatingId(id);
    try {
      await axios.put(`${API_BASE_URL}/admin/medecins/${id}/validate`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showSnackbar('Médecin validé avec succès', 'success');
      setMedecins(medecins.filter(m => m._id !== id));
    } catch (err) {
      showSnackbar('Erreur lors de la validation', 'error');
    }
    setValidatingId(null);
  };

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 700 }}>
        Médecins en attente de validation
      </Typography>
      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          Erreur détaillée : {error}
        </Typography>
      )}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
          <CircularProgress />
        </Box>
      ) : medecins.length === 0 ? (
        <Typography color="text.secondary" sx={{ textAlign: 'center', mt: 6 }}>
          Aucun médecin en attente de validation.
        </Typography>
      ) : (
        <Grid container spacing={3}>
          {medecins.map((medecin) => (
            <Grid item xs={12} md={6} lg={4} key={medecin._id}>
              <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ width: 56, height: 56, mr: 2 }} src={medecin.avatar}>
                      {medecin.userId?.nom?.charAt(0)}
                    </Avatar>
                    <Box>
                      <Typography variant="h6" fontWeight={700}>
                        Dr. {medecin.userId?.nom}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {medecin.specialite}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {medecin.userId?.email}
                      </Typography>
                    </Box>
                  </Box>
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    <b>Adresse:</b> {medecin.adresse}<br />
                    <b>Hôpital:</b> {medecin.hopital}<br />
                    <b>Téléphone:</b> {medecin.telephone}
                  </Typography>
                  <Button
                    variant="contained"
                    color="primary"
                    disabled={validatingId === medecin._id}
                    onClick={() => handleValidate(medecin._id)}
                  >
                    {validatingId === medecin._id ? <CircularProgress size={20} color="inherit" /> : 'Valider'}
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default ValidationMedecinsPage;
