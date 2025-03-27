import React from 'react';
import { Typography, Box, Tabs, Tab } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { CategoryList } from './CategoryList';
import { ProgrammingFeatures } from './ProgrammingFeatures';
import { Layout } from './Layout';

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

export const MainContent: React.FC = () => {
  const [tabValue, setTabValue] = React.useState(0);
  const { user } = useAuth();

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Layout>
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
    </Layout>
  );
}; 