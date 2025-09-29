// src/components/Logo/Logo.tsx
import React from 'react';
import { Box } from '@mui/material';
import logo from '../assets/images/GRUPO CANAIMA.png';

interface LogoProps {
  size?: 'small' | 'medium' | 'large' | 'xlarge';
  showText?: boolean;
  color?: 'original' | 'white'; // Nueva prop para controlar el color
}

export const Logo: React.FC<LogoProps> = ({ 
  size = 'medium', 
  showText = true, 
  color = 'original' // Valor por defecto
}) => {
  const getSize = () => {
    switch (size) {
      case 'small': return 50;
      case 'large': return 120;
      case 'xlarge': return 150;
      default: return 100; // medium
    }
  };

  // Determinar el filtro CSS basado en la prop color
  const getFilter = () => {
    return color === 'white' ? 'brightness(0) invert(1)' : 'none';
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      <Box
        component="img"
        src={logo}
        alt="Logo Grupo Canaima"
        sx={{
          width: getSize(),
          height: getSize(),
          objectFit: 'contain',
          filter: getFilter() // Aplicar filtro condicional
        }}
      />
      {showText && (
        <Box 
          component="img" 
          src={logo}
          alt="Grupo Canaima"
          sx={{
            height: getSize() * 0.4,
            objectFit: 'contain',
            display: { xs: 'none', md: 'block' },
            filter: getFilter() // Aplicar filtro condicional al texto también
          }}
        />
      )}
    </Box>
  );
};