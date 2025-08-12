// src/styles/globalStyles.ts
import { GlobalStyles as MUIGlobalStyles } from '@mui/material';

export const GlobalStyles = () => (
  <MUIGlobalStyles
    styles={{
      body: {
        backgroundColor: '#f9f9f9',
        margin: 0,
        padding: 0,
        fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
      },
      '.MuiPaper-root': {
        boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.05)',
      },
    }}
  />
);