import React from 'react';
import {
  Container,
  Typography,
  Box,
  AppBar,
  Toolbar,
  Button,
  Tabs,
  Tab
} from '@mui/material';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CategoryList } from './components/CategoryList';
import { ProgrammingFeatures } from './components/ProgrammingFeatures';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const MainContent: React.FC = () => {
  const [tabValue, setTabValue] = React.useState(0);
  const { user, signIn, signOut } = useAuth();

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Web Link Saver
          </Typography>
          {user ? (
            <Button color="inherit" onClick={signOut}>
              Sign Out
            </Button>
          ) : (
            <Button color="inherit" onClick={signIn}>
              Sign In with Google
            </Button>
          )}
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ mt: 4 }}>
        {user ? (
          <>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs value={tabValue} onChange={handleTabChange}>
                <Tab label="My Links" />
                <Tab label="Programming Features" />
              </Tabs>
            </Box>
            <TabPanel value={tabValue} index={0}>
              <CategoryList />
            </TabPanel>
            <TabPanel value={tabValue} index={1}>
              <ProgrammingFeatures />
            </TabPanel>
          </>
        ) : (
          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <Typography variant="h5" gutterBottom>
              Welcome to Web Link Saver
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Please sign in to start saving your links
            </Typography>
          </Box>
        )}
      </Container>
    </Box>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <MainContent />
    </AuthProvider>
  );
};

export default App; 