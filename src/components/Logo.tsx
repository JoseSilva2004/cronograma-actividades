import React from 'react';
import { Box } from '@mui/material';
import logo from '../assets/images/GRUPO CANAIMA.png';

interface LogoProps {
  size?: 'small' | 'medium' | 'large' | 'xlarge';
  showText?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ size = 'medium', showText = true }) => {
  const getSize = () => {
    switch (size) {
      case 'small': return 50;
      case 'large': return 120;
      case 'xlarge': return 150;
      default: return 100; // medium
    }
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      <Box
        component="img"
        src={logo}
        alt="Logo Soporte Técnico"
        sx={{
          width: getSize(),
          height: getSize(),
          objectFit: 'contain',
          filter: 'brightness(0) invert(1)'
        }}
      />
      {showText && (
        <Box 
          component="img" 
          src={logo}
          alt="Soporte Técnico"
          sx={{
            height: getSize() * 0.4,
            objectFit: 'contain',
            display: { xs: 'none', md: 'block' },
            filter: 'brightness(0) invert(1)'
          }}
        />
      )}
    </Box>
  );
};