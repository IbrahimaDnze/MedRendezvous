import React from 'react';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import HeaderMedecin from './HeaderMedecin';
import { useLocation } from 'react-router-dom';

const LayoutMedecin = ({ children }) => {
  const location = useLocation();
  const isAccueil = location.pathname === '/';

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {!isAccueil && <HeaderMedecin />}
      <Container maxWidth="md" sx={{ py: 4 }}>
        {children}
      </Container>
      <Box component="footer" sx={{ py: 2, textAlign: 'center', bgcolor: 'background.default', color: 'text.secondary' }}>
        <Typography variant="body2">&copy; {new Date().getFullYear()} MedRendezVous - Espace Médecin</Typography>
      </Box>
    </Box>
  );
};

export default LayoutMedecin; 