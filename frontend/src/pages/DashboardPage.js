import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import SearchIcon from '@mui/icons-material/Search';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardMedia from '@mui/material/CardMedia';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import API_BASE_URL from '../config/api';
import Chip from '@mui/material/Chip';
import PersonIcon from '@mui/icons-material/Person';

// Images locales disponibles


const DashboardPage = () => {
  const [search, setSearch] = useState('');
  const [medecinsCount, setMedecinsCount] = useState({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { token } = useAuth();
  const [apiSpecialites, setApiSpecialites] = useState([]);

  useEffect(() => {
    const fetchSpecialites = async () => {
      try {
        const r = await axios.get(`${API_BASE_URL}/api/specialites`);
        setApiSpecialites(r.data.specialites || []);
      } catch (e) {
        setApiSpecialites([]);
      }
    };
    fetchSpecialites();
  }, []);
  
  // Récupérer le nombre de médecins par spécialité
  useEffect(() => {
    const fetchMedecinsCount = async () => {
      try {
        setLoading(true);
        const counts = {};
        
        const specs = apiSpecialites.map(s => ({ titre: s.name }));
        // Récupérer le nombre de médecins pour chaque spécialité
        for (const specialite of specs) {
          try {
            const response = await axios.get(
              `http://localhost:5000/api/users/medecins/specialite/${encodeURIComponent(specialite.titre)}`,
              { headers: { Authorization: `Bearer ${token}` } }
            );
            counts[specialite.titre] = response.data.medecins?.length || 0;
          } catch (error) {
            console.error(`Erreur pour ${specialite.titre}:`, error);
            counts[specialite.titre] = 0;
          }
        }
        
        setMedecinsCount(counts);
        setLoading(false);
      } catch (error) {
        console.error('Erreur lors de la récupération des compteurs:', error);
        setLoading(false);
      }
    };

    if (token !== undefined) {
      fetchMedecinsCount();
    }
  }, [token, apiSpecialites]);
  
  const specs = apiSpecialites.map(s => ({ titre: s.name, image: s.image ? `http://localhost:5000${s.image}` : null, description: s.description || '' }));

  const filteredSpecialites = specs.filter(s =>
    s.titre.toLowerCase().includes(search.toLowerCase()) ||
    s.description.toLowerCase().includes(search.toLowerCase())
  );

  const handleSpecialiteClick = (specialite) => {
    navigate(`/medecins/${encodeURIComponent(specialite)}`);
  };

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(120deg, #a1c4fd 0%, #c2e9fb 50%, #fbc2eb 100%)', 
      px: { xs: 1, sm: 2, md: 6, lg: 10 }, 
      py: { xs: 3, sm: 4, md: 6 },
      position: 'relative',
      overflowX: 'hidden',
    }}>
      <Typography variant="h3" sx={{ 
        fontWeight: 900, 
        color: '#2a3eb1', 
        mb: { xs: 2, md: 3 }, 
        textAlign: 'center', 
        letterSpacing: 2,
        textShadow: '0 4px 16px #c2e9fb',
        fontSize: { xs: 24, sm: 32, md: 40, lg: 48 }
      }}>
        Trouver un spécialiste
      </Typography>
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: { xs: 3, md: 5 } }}>
        <TextField
          placeholder="Rechercher une spécialité..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          fullWidth
          sx={{
            maxWidth: { xs: '100%', sm: 420 },
            bgcolor: '#fff',
            borderRadius: 99,
            boxShadow: '0 4px 24px 0 rgba(162,89,255,0.10)',
            '& .MuiOutlinedInput-root': {
              borderRadius: 99,
              fontWeight: 600,
              fontSize: { xs: 15, sm: 18 },
              background: 'rgba(255,255,255,0.95)',
              border: '2px solid #a1c4fd',
              boxShadow: '0 2px 8px 0 rgba(162,89,255,0.04)',
              transition: 'box-shadow 0.2s',
              '&:hover': {
                borderColor: '#2a3eb1',
                boxShadow: '0 4px 24px 0 rgba(162,89,255,0.13)',
              },
              '&.Mui-focused': {
                borderColor: '#2a3eb1',
                boxShadow: '0 0 0 2px rgba(42, 62, 177, 0.2)',
              },
            },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: '#2a3eb1' }} />
              </InputAdornment>
            ),
          }}
        />
      </Box>
      <Grid container spacing={4} justifyContent="center">
        {filteredSpecialites.length === 0 && (
          <Grid item xs={12}>
            <Typography color="text.secondary" sx={{ textAlign: 'center', fontSize: 18, mt: 4 }}>
              Aucune spécialité trouvée.
            </Typography>
          </Grid>
        )}
        {filteredSpecialites.map((s, idx) => (
          <Grid item xs={12} sm={6} md={4} key={s.titre + '-' + idx}>
            <Card 
              onClick={() => handleSpecialiteClick(s.titre)}
              sx={{
                borderRadius: 6,
                boxShadow: '0 8px 32px 0 rgba(31,38,135,0.10)',
                bgcolor: 'rgba(255,255,255,0.85)',
                backdropFilter: 'blur(6px)',
                transition: 'box-shadow 0.18s, transform 0.18s',
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden',
                '&:hover': {
                  boxShadow: '0 16px 48px 0 rgba(25,118,210,0.18)',
                  transform: 'translateY(-2px) scale(1.035)',
                  '& .specialite-overlay': {
                    opacity: 1,
                  },
                  '& .specialite-icon': {
                    transform: 'translateX(4px)',
                  },
                },
              }}
            >
              <Box sx={{ position: 'relative' }}>
                {s.image ? (
                  <CardMedia
                    component="img"
                    height="170"
                    image={s.image}
                    alt={s.titre}
                    sx={{ objectFit: 'cover', borderTopLeftRadius: 24, borderTopRightRadius: 24 }}
                  />
                ) : (
                  <Box sx={{ height: 170, borderTopLeftRadius: 24, borderTopRightRadius: 24, background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }} />
                )}
                {/* Compteur de médecins */}
                <Box sx={{
                  position: 'absolute',
                  top: 12,
                  right: 12,
                  zIndex: 2, // Ajoute une valeur numérique ici
                }}>
                  <Chip
                    icon={<PersonIcon />}
                    label={loading ? '...' : `${medecinsCount[s.titre] || 0} médecin${medecinsCount[s.titre] !== 1 ? 's' : ''}`}
                    sx={{
                      bgcolor: 'rgba(255,255,255,0.95)',
                      color: '#2a3eb1',
                      fontWeight: 700,
                      fontSize: '0.8rem',
                      backdropFilter: 'blur(10px)',
                      border: '2px solid rgba(42, 62, 177, 0.3)',
                      '& .MuiChip-icon': {
                        color: '#2a3eb1',
                      },
                      '& .MuiChip-label': {
                        px: 1,
                      },
                    }}
                  />
                </Box>
              </Box>
              <CardContent sx={{ position: 'relative' }}>
                <Typography variant="h6" sx={{ fontWeight: 900, color: '#2a3eb1', mb: 1, letterSpacing: 1 }}>{s.titre}</Typography>
                <Typography variant="body2" sx={{ color: '#4f4f4f', mb: 2, fontSize: 16 }}>{s.description}</Typography>
                
                {/* Overlay au survol */}
                                  <Box
                    className="specialite-overlay"
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      bgcolor: 'rgba(162,89,255,0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      opacity: 0,
                      transition: 'opacity 0.2s',
                      borderRadius: 6,
                    }}
                  >
                  <IconButton
                    className="specialite-icon"
                    sx={{
                      bgcolor: '#2a3eb1',
                      color: 'white',
                      transition: 'transform 0.2s',
                      '&:hover': {
                        bgcolor: '#1a2b91',
                      },
                    }}
                  >
                    <ArrowForwardIcon />
                  </IconButton>
                </Box>
                
                <Button 
                  variant="contained" 
                  sx={{ 
                    borderRadius: 99, 
                    fontWeight: 700, 
                    fontSize: 17, 
                    py: 1.2, 
                    boxShadow: '0 2px 8px 0 rgba(162,89,255,0.10)', 
                    letterSpacing: 1,
                    position: 'relative',
                    zIndex: 1,
                    bgcolor: '#a259ff',
                    color: 'white',
                    '&:hover': {
                      bgcolor: '#8a4fd8',
                    },
                  }}
                >
                  Voir les médecins
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default DashboardPage;