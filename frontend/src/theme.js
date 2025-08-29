import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#2a3eb1',
      light: '#5b6fd6',
      dark: '#1e2e8a',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#f50057',
      light: '#ff5983',
      dark: '#bb003f',
      contrastText: '#ffffff',
    },
    info: {
      main: '#00bcd4',
      light: '#62e7f5',
      dark: '#0097a7',
      contrastText: '#ffffff',
    },
    success: { main: '#2e7d32' },
    warning: { main: '#f59e0b' },
    error: { main: '#d32f2f' },
    background: {
      default: '#f5f9ff',
      paper: '#ffffff',
    },
    divider: '#e6eaf2',
    text: {
      primary: '#0f172a',
      secondary: '#475569',
    },
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
    h1: { fontWeight: 800 },
    h2: { fontWeight: 800 },
    h3: { fontWeight: 800 },
    h4: { fontWeight: 800 },
    h5: { fontWeight: 700 },
    h6: { fontWeight: 700 },
    button: { textTransform: 'none', fontWeight: 700 },
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        colorDefault: {
          backgroundColor: 'rgba(255,255,255,0.9)',
          backdropFilter: 'saturate(180%) blur(8px)',
          borderBottom: '1px solid #e6eaf2',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: 999, fontWeight: 800 },
        containedPrimary: {
          backgroundImage: 'linear-gradient(90deg, #2a3eb1 0%, #5b6fd6 100%)',
        },
        containedSecondary: {
          backgroundImage: 'linear-gradient(90deg, #f50057 0%, #ff5983 100%)',
        },
      },
    },
  },
});

export default theme; 