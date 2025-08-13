import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Container, Typography, AppBar, Toolbar, Box } from '@mui/material';
import ActivityList from './components/ActivityList';
import { lightTheme } from './styles/theme';
import { GlobalStyles } from './styles/globalStyles';

const App: React.FC = () => {
  // Ya no necesitamos manejar el estado aquí, ActivityList lo maneja internamente
  return (
    <ThemeProvider theme={lightTheme}>
      <CssBaseline />
      <GlobalStyles />
      <AppBar position="static" color="primary" elevation={1}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, color: '#fff' }}>
            📋 Cronograma de Actividades - Soporte Técnico
          </Typography>
        </Toolbar>
      </AppBar>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ 
          bgcolor: 'background.paper', 
          p: 3, 
          borderRadius: 2, 
          boxShadow: 1,
          border: '1px solid #e0e0e0'
        }}>
          {/* Ahora ActivityList maneja su propio estado */}
          <ActivityList />
        </Box>
      </Container>
    </ThemeProvider>
  );
};

export default App;