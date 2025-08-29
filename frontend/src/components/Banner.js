import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

const Banner = ({ image, title, alt }) => (
  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
    <img src={image} alt={alt || title} style={{ width: 250, marginBottom: 16 }} />
    <Typography variant="h5" sx={{ mb: 2 }}>{title}</Typography>
  </Box>
);

export default Banner; 