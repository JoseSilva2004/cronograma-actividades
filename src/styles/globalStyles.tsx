// src/styles/globalStyles.tsx
import { GlobalStyles as MUIGlobalStyles } from '@mui/material';

export const GlobalStyles = () => (
  <MUIGlobalStyles
    styles={(theme) => ({
      ':root': {
        '--mobile-breakpoint': '768px',
        '--tablet-breakpoint': '1024px',
      },
      
      '*, *::before, *::after': {
        boxSizing: 'border-box',
        margin: 0,
        padding: 0,
      },
      
      'html, body': {
        margin: 0,
        padding: 0,
        fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
        lineHeight: 1.6,
        backgroundColor: '#f5f5f5',
        fontSize: '14px',
        scrollBehavior: 'smooth',
        WebkitFontSmoothing: 'antialiased',
        MozOsxFontSmoothing: 'grayscale',
        
        [theme.breakpoints.up('sm')]: {
          fontSize: '15px',
        },
        
        [theme.breakpoints.up('md')]: {
          fontSize: '16px',
        },
      },
      
      '#root': {
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
      },
      
      /* Scrollbar personalizado */
      '::-webkit-scrollbar': {
        width: '8px',
        height: '8px',
      },
      
      '::-webkit-scrollbar-track': {
        background: '#f1f1f1',
        borderRadius: '4px',
      },
      
      '::-webkit-scrollbar-thumb': {
        background: '#c1c1c1',
        borderRadius: '4px',
        '&:hover': {
          background: '#a8a8a8',
        },
      },
      
      /* Mejoras para elementos MUI */
      '.MuiContainer-root': {
        paddingLeft: '8px !important',
        paddingRight: '8px !important',
        
        [theme.breakpoints.up('sm')]: {
          paddingLeft: '16px !important',
          paddingRight: '16px !important',
        },
        
        [theme.breakpoints.up('md')]: {
          paddingLeft: '24px !important',
          paddingRight: '24px !important',
        },
      },
      
      '.MuiPaper-root': {
        borderRadius: '8px',
        boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
        
        [theme.breakpoints.up('sm')]: {
          borderRadius: '12px',
          boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
        },
      },
      
      '.MuiButton-root': {
        borderRadius: '6px',
        textTransform: 'none',
        fontWeight: '500',
        fontSize: '0.875rem',
        
        [theme.breakpoints.up('sm')]: {
          fontSize: '0.9rem',
          borderRadius: '8px',
        },
        
        '&.MuiButton-sizeSmall': {
          fontSize: '0.8rem',
          padding: '4px 12px',
          
          [theme.breakpoints.up('sm')]: {
            fontSize: '0.85rem',
            padding: '6px 16px',
          },
        },
      },
      
      '.MuiTableCell-root': {
        borderBottom: '1px solid #e0e0e0',
        padding: '12px 16px',
        
        [theme.breakpoints.down('sm')]: {
          padding: '8px 12px',
          fontSize: '0.8rem',
        },
      },
      
      '.MuiTypography-h1': {
        fontSize: '2rem',
        
        [theme.breakpoints.down('sm')]: {
          fontSize: '1.75rem',
        },
      },
      
      '.MuiTypography-h2': {
        fontSize: '1.75rem',
        
        [theme.breakpoints.down('sm')]: {
          fontSize: '1.5rem',
        },
      },
      
      '.MuiTypography-h3': {
        fontSize: '1.5rem',
        
        [theme.breakpoints.down('sm')]: {
          fontSize: '1.25rem',
        },
      },
      
      '.MuiTypography-h4': {
        fontSize: '1.25rem',
        
        [theme.breakpoints.down('sm')]: {
          fontSize: '1.1rem',
        },
      },
      
      '.MuiTypography-h5': {
        fontSize: '1.1rem',
        
        [theme.breakpoints.down('sm')]: {
          fontSize: '1rem',
        },
      },
      
      '.MuiTypography-h6': {
        fontSize: '1rem',
        
        [theme.breakpoints.down('sm')]: {
          fontSize: '0.9rem',
        },
      },
      
      '.MuiTextField-root, .MuiFormControl-root': {
        '& .MuiInputLabel-root': {
          fontSize: '0.9rem',
          
          [theme.breakpoints.down('sm')]: {
            fontSize: '0.85rem',
          },
        },
        
        '& .MuiInputBase-root': {
          fontSize: '0.9rem',
          
          [theme.breakpoints.down('sm')]: {
            fontSize: '0.85rem',
          },
        },
      },
      
      /* Mejoras para tarjetas en móviles */
      '.MuiCard-root': {
        transition: 'all 0.3s ease-in-out',
        
        '&:hover': {
          transform: 'translateY(-2px)',
        },
      },
      
      /* Animaciones suaves */
      '.Mui-fadeIn': {
        animation: 'fadeIn 0.5s ease-in-out',
      },
      
      '@keyframes fadeIn': {
        from: {
          opacity: 0,
          transform: 'translateY(20px)',
        },
        to: {
          opacity: 1,
          transform: 'translateY(0)',
        },
      },
      
      /* Mejoras para tablas responsivas */
      '.table-responsive': {
        overflowX: 'auto',
        WebkitOverflowScrolling: 'touch',
        
        '& table': {
          minWidth: '600px',
        },
      },
      
      /* Estados de carga */
      '.loading-skeleton': {
        background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
        backgroundSize: '200% 100%',
        animation: 'loading 1.5s infinite',
      },
      
      '@keyframes loading': {
        '0%': {
          backgroundPosition: '200% 0',
        },
        '100%': {
          backgroundPosition: '-200% 0',
        },
      },
      
      /* Mejoras para modales y diálogos */
      '.MuiDialog-paper': {
        margin: '16px',
        
        [theme.breakpoints.down('sm')]: {
          margin: '8px',
          width: 'calc(100% - 16px) !important',
        },
      },
      
      /* Estados de focus mejorados para accesibilidad */
      '*:focus-visible': {
        outline: `2px solid ${theme.palette.primary.main}`,
        outlineOffset: '2px',
      },
      
      /* Mejoras para imágenes responsivas */
      'img': {
        maxWidth: '100%',
        height: 'auto',
      },
    })}
  />
);