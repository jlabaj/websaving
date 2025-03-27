import React from 'react';
import { Box, Container } from '@mui/material';
import { Header } from './Header';

interface LayoutProps {
  children: React.ReactNode;
  showBackButton?: boolean;
  title?: string;
}

export const Layout: React.FC<LayoutProps> = ({ 
  children, 
  showBackButton = false,
  title = 'Web Link Saver'
}) => {
  return (
    <Box sx={{ flexGrow: 1 }}>
      <Header showBackButton={showBackButton} title={title} />
      <Container maxWidth="md" sx={{ mt: 4 }}>
        {children}
      </Container>
    </Box>
  );
}; 