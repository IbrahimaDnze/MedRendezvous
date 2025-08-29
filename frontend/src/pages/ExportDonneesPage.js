import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import API_BASE_URL from '../config/api';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import CircularProgress from '@mui/material/CircularProgress';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import TableChartIcon from '@mui/icons-material/TableChart';
import DownloadIcon from '@mui/icons-material/Download';
import DateRangeIcon from '@mui/icons-material/DateRange';
import FilterListIcon from '@mui/icons-material/FilterList';
import { useSnackbar } from '../components/GlobalSnackbar';

const ExportDonneesPage = () => {
  const { token, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [data, setData] = useState({
    rdvs: [],
    patients: [],
    disponibilites: []
  });
  const [filters, setFilters] = useState({
    type: 'rdvs',
    dateDebut: '',
    dateFin: '',
    statut: 'tous',
    format: 'pdf'
  });
  const [selectedItems, setSelectedItems] = useState([]);
  const [showPreview, setShowPreview] = useState(false);
  const { showSnackbar } = useSnackbar();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Récupérer les données réelles du médecin
      const [rdvsResponse, patientsResponse, disposResponse] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/rdv/mes`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API_BASE_URL}/api/patients`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API_BASE_URL}/api/disponibilites`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);
      
      setData({
        rdvs: rdvsResponse.data.rdvs || [],
        patients: patientsResponse.data.patients || [],
        disponibilites: disposResponse.data.disponibilites || []
      });
      setLoading(false);
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      showSnackbar('Erreur lors du chargement des données', 'error');
      setLoading(false);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleSelectItem = (itemId) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleSelectAll = () => {
    const currentData = getFilteredData();
    if (selectedItems.length === currentData.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(currentData.map(item => item._id || item.id));
    }
  };

  const getFilteredData = () => {
    let filtered = data[filters.type] || [];

    // Filtre par date
    if (filters.dateDebut) {
      filtered = filtered.filter(item => 
        new Date(item.date || item.derniereVisite) >= new Date(filters.dateDebut)
      );
    }
    if (filters.dateFin) {
      filtered = filtered.filter(item => 
        new Date(item.date || item.derniereVisite) <= new Date(filters.dateFin)
      );
    }

    // Filtre par statut (pour les RDV)
    if (filters.type === 'rdvs' && filters.statut !== 'tous') {
      filtered = filtered.filter(item => item.statut === filters.statut);
    }

    return filtered;
  };

  const handleExport = async () => {
    try {
      setExporting(true);
      const itemsToExport = selectedItems.length > 0 
        ? getFilteredData().filter(item => selectedItems.includes(item._id || item.id))
        : getFilteredData();

      if (itemsToExport.length === 0) {
        showSnackbar('Aucune donnée à exporter', 'warning');
        return;
      }

      // Simulation d'export
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const fileName = `export_${filters.type}_${new Date().toISOString().split('T')[0]}.${filters.format}`;
      
      showSnackbar(`Export ${filters.format.toUpperCase()} réussi: ${fileName}`, 'success');
      setExporting(false);
    } catch (error) {
      console.error('Erreur lors de l\'export:', error);
      showSnackbar('Erreur lors de l\'export', 'error');
      setExporting(false);
    }
  };

  const handlePreview = () => {
    setShowPreview(true);
  };

  const getTableHeaders = () => {
    switch (filters.type) {
      case 'rdvs':
        return ['Patient', 'Date', 'Heure', 'Statut', 'Motif'];
      case 'patients':
        return ['Nom', 'Email', 'Téléphone', 'Dernière visite'];
      case 'disponibilites':
        return ['Jour', 'Heure début', 'Heure fin'];
      default:
        return [];
    }
  };

  const getTableData = () => {
    const filteredData = getFilteredData();
    return filteredData.map(item => {
      switch (filters.type) {
        case 'rdvs':
          return [
            item.patient?.nom || 'N/A',
            new Date(item.date).toLocaleDateString('fr-FR'),
            item.heure,
            item.statut,
            item.motif
          ];
        case 'patients':
          return [
            item.nom,
            item.email,
            item.telephone,
            new Date(item.derniereVisite).toLocaleDateString('fr-FR')
          ];
        case 'disponibilites':
          return [
            item.jour,
            item.heureDebut,
            item.heureFin
          ];
        default:
          return [];
      }
    });
  };

  if (loading) {
    return (
      <Box sx={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress color="primary" />
      </Box>
    );
  }

  return (
    <Box sx={{
      minHeight: '100vh',
      px: { xs: 2, md: 8 },
      py: 6,
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      position: 'relative',
      overflowX: 'hidden',
    }}>
      {/* En-tête */}
      <Box sx={{ mb: 6, textAlign: 'center' }}>
        <Typography variant="h3" sx={{ 
          fontWeight: 900, 
          color: 'white', 
          fontSize: { xs: 28, md: 42 }, 
          letterSpacing: 2,
          textShadow: '0 4px 16px rgba(0,0,0,0.3)',
          mb: 2
        }}>
          Export de Données
        </Typography>
        <Typography variant="h6" sx={{ 
          color: 'rgba(255,255,255,0.9)', 
          fontWeight: 500,
          letterSpacing: 1
        }}>
          Exportez vos données en PDF ou Excel
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {/* Filtres et options */}
        <Grid item xs={12}>
          <Card sx={{
            borderRadius: 4,
            bgcolor: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
            mb: 4
          }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, color: 'primary.main' }}>
                Options d'export
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={3}>
                  <FormControl fullWidth>
                    <InputLabel>Type de données</InputLabel>
                    <Select
                      value={filters.type}
                      onChange={(e) => handleFilterChange('type', e.target.value)}
                      label="Type de données"
                    >
                      <MenuItem value="rdvs">Rendez-vous</MenuItem>
                      <MenuItem value="patients">Patients</MenuItem>
                      <MenuItem value="disponibilites">Disponibilités</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={3}>
                  <FormControl fullWidth>
                    <InputLabel>Format d'export</InputLabel>
                    <Select
                      value={filters.format}
                      onChange={(e) => handleFilterChange('format', e.target.value)}
                      label="Format d'export"
                    >
                      <MenuItem value="pdf">PDF</MenuItem>
                      <MenuItem value="excel">Excel</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={2}>
                  <TextField
                    fullWidth
                    type="date"
                    label="Date début"
                    value={filters.dateDebut}
                    onChange={(e) => handleFilterChange('dateDebut', e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} md={2}>
                  <TextField
                    fullWidth
                    type="date"
                    label="Date fin"
                    value={filters.dateFin}
                    onChange={(e) => handleFilterChange('dateFin', e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                {filters.type === 'rdvs' && (
                  <Grid item xs={12} md={2}>
                    <FormControl fullWidth>
                      <InputLabel>Statut</InputLabel>
                      <Select
                        value={filters.statut}
                        onChange={(e) => handleFilterChange('statut', e.target.value)}
                        label="Statut"
                      >
                        <MenuItem value="tous">Tous</MenuItem>
                        <MenuItem value="confirmé">Confirmés</MenuItem>
                        <MenuItem value="en attente">En attente</MenuItem>
                        <MenuItem value="annulé">Annulés</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                )}
              </Grid>

              <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
                <Button
                  variant="outlined"
                  startIcon={<FilterListIcon />}
                  onClick={() => {
                    setFilters({
                      type: 'rdvs',
                      dateDebut: '',
                      dateFin: '',
                      statut: 'tous',
                      format: 'pdf'
                    });
                    setSelectedItems([]);
                  }}
                  sx={{ borderRadius: 3, fontWeight: 600 }}
                >
                  Réinitialiser
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<DateRangeIcon />}
                  onClick={handlePreview}
                  sx={{ borderRadius: 3, fontWeight: 600 }}
                >
                  Aperçu
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Statistiques */}
        <Grid item xs={12} md={4}>
          <Card sx={{
            borderRadius: 4,
            bgcolor: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
          }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, color: 'primary.main' }}>
                Statistiques d'export
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'primary.light', color: 'white' }}>
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                      {getFilteredData().length}
                    </Typography>
                    <Typography variant="body2">Éléments trouvés</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6}>
                  <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'success.light', color: 'white' }}>
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                      {selectedItems.length}
                    </Typography>
                    <Typography variant="body2">Sélectionnés</Typography>
                  </Paper>
                </Grid>
              </Grid>

              <Box sx={{ mt: 3 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Format d'export : <Chip label={filters.format.toUpperCase()} color="primary" size="small" />
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Type de données : <Chip label={filters.type} color="secondary" size="small" />
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Liste des données */}
        <Grid item xs={12} md={8}>
          <Card sx={{
            borderRadius: 4,
            bgcolor: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
                  Données à exporter
                </Typography>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={selectedItems.length === getFilteredData().length && getFilteredData().length > 0}
                      indeterminate={selectedItems.length > 0 && selectedItems.length < getFilteredData().length}
                      onChange={handleSelectAll}
                    />
                  }
                  label="Tout sélectionner"
                />
              </Box>

              <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={selectedItems.length === getFilteredData().length && getFilteredData().length > 0}
                          indeterminate={selectedItems.length > 0 && selectedItems.length < getFilteredData().length}
                          onChange={handleSelectAll}
                        />
                      </TableCell>
                      {getTableHeaders().map((header, index) => (
                        <TableCell key={index} sx={{ fontWeight: 600 }}>
                          {header}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {getFilteredData().map((item, index) => (
                      <TableRow key={item._id || item.id || index}>
                        <TableCell padding="checkbox">
                          <Checkbox
                            checked={selectedItems.includes(item._id || item.id)}
                            onChange={() => handleSelectItem(item._id || item.id)}
                          />
                        </TableCell>
                        {getTableData()[index].map((cell, cellIndex) => (
                          <TableCell key={cellIndex}>
                            {cell}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={exporting ? <CircularProgress size={20} /> : <DownloadIcon />}
                  onClick={handleExport}
                  disabled={exporting || getFilteredData().length === 0}
                  sx={{ borderRadius: 3, py: 1.5, fontWeight: 600 }}
                >
                  {exporting ? 'Export en cours...' : `Exporter en ${filters.format.toUpperCase()}`}
                </Button>
                <Button
                  variant="outlined"
                  color="secondary"
                  startIcon={filters.format === 'pdf' ? <PictureAsPdfIcon /> : <TableChartIcon />}
                  onClick={handlePreview}
                  sx={{ borderRadius: 3, py: 1.5, fontWeight: 600 }}
                >
                  Aperçu
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Dialog Aperçu */}
      <Dialog open={showPreview} onClose={() => setShowPreview(false)} maxWidth="lg" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {filters.format === 'pdf' ? <PictureAsPdfIcon color="primary" /> : <TableChartIcon color="primary" />}
            <Typography variant="h6">Aperçu de l'export</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ p: 2, bgcolor: 'grey.100', borderRadius: 2, mb: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
              Informations d'export
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Format : {filters.format.toUpperCase()} | Type : {filters.type} | 
              Éléments : {selectedItems.length > 0 ? selectedItems.length : getFilteredData().length}
            </Typography>
          </Box>
          
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  {getTableHeaders().map((header, index) => (
                    <TableCell key={index} sx={{ fontWeight: 600 }}>
                      {header}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {(selectedItems.length > 0 
                  ? getFilteredData().filter(item => selectedItems.includes(item._id || item.id))
                  : getFilteredData()
                ).slice(0, 10).map((item, index) => (
                  <TableRow key={item._id || item.id || index}>
                    {getTableData()[index].map((cell, cellIndex) => (
                      <TableCell key={cellIndex}>
                        {cell}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          
          {getFilteredData().length > 10 && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2, textAlign: 'center' }}>
              ... et {getFilteredData().length - 10} autres éléments
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowPreview(false)}>
            Fermer
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              setShowPreview(false);
              handleExport();
            }}
          >
            Exporter
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ExportDonneesPage; 