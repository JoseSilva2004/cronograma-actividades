import { GlobalStyles as MUIGlobalStyles } from '@mui/material';

export const GlobalStyles = () => (
  <MUIGlobalStyles
    styles={{
      body: {
        backgroundColor: '#f5f5f5',
        margin: 0,
        padding: 0,
        fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
        lineHeight: '1.6',
      },
      '.MuiPaper-root': {
        borderRadius: '8px',
        boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
      },
      '.MuiButton-root': {
        borderRadius: '6px',
        textTransform: 'none',
        fontWeight: '500',
      },
      '.MuiTableCell-root': {
        borderBottom: '1px solid #e0e0e0',
      },
    }}
  />
);