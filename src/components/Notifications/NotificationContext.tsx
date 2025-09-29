// src/components/Notifications/NotificationContext.tsx
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { AlertColor } from '@mui/material';
import { NotificationSnackbar } from './NotificationSnackbar';

interface Notification {
  message: string;
  severity: AlertColor;
}

interface NotificationContextType {
  showNotification: (message: string, severity?: AlertColor) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification debe usarse dentro de un NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notification, setNotification] = useState<Notification | null>(null);
  const [open, setOpen] = useState(false);

  const showNotification = (message: string, severity: AlertColor = 'success') => {
    setNotification({ message, severity });
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setNotification(null);
  };

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      {notification && (
        <NotificationSnackbar
          open={open}
          message={notification.message}
          severity={notification.severity}
          onClose={handleClose}
        />
      )}
    </NotificationContext.Provider>
  );
};