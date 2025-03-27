import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton
} from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

interface HeaderProps {
  showBackButton?: boolean;
  title?: string;
}

export const Header: React.FC<HeaderProps> = ({ showBackButton = false, title = 'Web Link Saver' }) => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  return (
    <AppBar position="static">
      <Toolbar>
        {showBackButton && (
          <IconButton
            edge="start"
            color="inherit"
            onClick={() => navigate('/')}
            sx={{ mr: 2 }}
          >
            <ArrowBackIcon />
          </IconButton>
        )}
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          {title}
        </Typography>
        {user ? (
          <Button color="inherit" onClick={signOut}>
            Sign Out
          </Button>
        ) : (
          <Button color="inherit" onClick={() => navigate('/')}>
            Sign In with Google
          </Button>
        )}
      </Toolbar>
    </AppBar>
  );
}; 