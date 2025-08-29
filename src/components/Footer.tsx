import React from 'react';
import { Box, Container, Typography } from '@mui/material';
import { Logo } from './Logo';
import diaLoco from '../assets/images/DIA LOCO.png';
import foreverLogo from '../assets/images/FOREVER.png';
import ilahuiLogo from '../assets/images/ILAHUI.png';
import motarroLogo from '../assets/images/MOTARRO.png';
import mrpLogo from '../assets/images/MRP.png';
import ohWowLogo from '../assets/images/OH WOW.png';
import sbLogo from '../assets/images/SB.png';
import shoeBoxLogo from '../assets/images/SHOE BOX.png';

export const Footer: React.FC = () => {
  const storeLogos = [
    {image: diaLoco },
    {image: foreverLogo },
    {image: ilahuiLogo },
    {image: motarroLogo },
    {image: mrpLogo },
    {image: ohWowLogo },
    {image: sbLogo },
    {image: shoeBoxLogo }
  ];

  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: '#1976d2',
        backgroundImage: 'linear-gradient(45deg, #1976d2 0%, #1a1a1a 100%)',
        color: 'white',
        py: 4,
        mt: 'auto'
      }}
    >
      <Container maxWidth="lg">
        {/* Logos de tiendas */}
        <Box sx={{ mb: 4 }}>
          <Typography 
            variant="h6" 
            align="center" 
            sx={{ 
              fontWeight: 'bold', 
              mb: 3,
              color: 'white'
            }}
          >
            Nuestras Tiendas
          </Typography>
          
          <Box 
            sx={{ 
              display: 'grid',
              gridTemplateColumns: {
                xs: 'repeat(2, 1fr)',
                sm: 'repeat(4, 1fr)',
                md: 'repeat(8, 1fr)'
              },
              gap: 3,
              justifyContent: 'center',
              alignItems: 'center'
            }}
          >
            {storeLogos.map((store, index) => (
              <Box key={index} sx={{ textAlign: 'center' }}>
                <Box
                  component="img"
                  src={store.image}
                  sx={{
                    height: { xs: 50, sm: 60, md: 70 },
                    width: 'auto',
                    maxWidth: '100%',
                    objectFit: 'contain',
                    filter: 'brightness(0) invert(1)',
                    opacity: 0.9,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      opacity: 1,
                      transform: 'scale(1.05)',
                      filter: 'brightness(0) invert(1) drop-shadow(0 0 8px rgba(255,255,255,0.5))'
                    }
                  }}
                />
                <Typography 
                  variant="caption" 
                  sx={{ 
                    display: 'block', 
                    mt: 1, 
                    color: 'rgba(255,255,255,0.8)',
                    fontSize: { xs: '0.7rem', sm: '0.75rem' }
                  }}
                >
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>

        {/* Información de la empresa */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2,
            pt: 3,
            borderTop: '1px solid rgba(255,255,255,0.1)'
          }}
        >
          <Logo size="medium" showText={false} />
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1, color: 'white' }}>
              GRUPO CANAIMA C.A
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9, color: 'rgba(255,255,255,0.8)' }}>
              © 2025 GRUPO CANAIMA C.A Todos los derechos reservados.
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.7, color: 'rgba(255,255,255,0.6)' }}>
              Soporte Técnico
            </Typography>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};