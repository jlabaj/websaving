import React, { useState, useEffect } from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Typography,
  Paper,
  CircularProgress,
  Divider,
  Button,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { Refresh as RefreshIcon } from '@mui/icons-material';
import { collection, query, where, getDocs, addDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';

interface FeatureResponse {
  language: string;
  response: string;
  lastUpdated: Date;
}

export const ProgrammingFeatures: React.FC = () => {
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);
  const [responses, setResponses] = useState<FeatureResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const languages = [
    { name: 'TypeScript', prompt: 'highly requested TypeScript features under consideration or development' },
    { name: 'JavaScript', prompt: 'highly requested JavaScript features under consideration or development' },
    { name: 'C#', prompt: 'highly requested C# features under consideration or development' }
  ];

  useEffect(() => {
    if (languages.length > 0 && !selectedLanguage) {
      setSelectedLanguage(languages[0].name);
    }
  }, []);

  useEffect(() => {
    if (selectedLanguage) {
      loadResponse(selectedLanguage);
    }
  }, [selectedLanguage]);

  const loadResponse = async (language: string) => {
    try {
      const responsesRef = collection(db, 'programmingResponses');
      const q = query(
        responsesRef,
        where('language', '==', language)
      );
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        const data = doc.data();
        
        setResponses(prev => {
          const newResponses = prev.filter(r => r.language !== language);
          const updatedResponse = {
            language,
            response: data.response,
            lastUpdated: data.lastUpdated?.toDate() || new Date()
          };
          return [...newResponses, updatedResponse];
        });
      } else {
        await fetchResponse(language);
      }
    } catch (error) {
      console.error('Error loading response:', error);
    }
  };

  const fetchResponse = async (language: string) => {
    setLoading(true);
    try {
      const prompt = languages.find(lang => lang.name === language)?.prompt;
      if (!prompt) return;

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-4-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are a helpful programming assistant. Provide concise, practical information about programming features. Format your response with numbered features, each with a title in bold, status, and description.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 1000
        })
      });

      const data = await response.json();
      const aiResponse = data.choices[0].message.content;

      // Save to Firestore
      const responsesRef = collection(db, 'programmingResponses');
      const q = query(
        responsesRef,
        where('language', '==', language)
      );
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const docRef = doc(db, 'programmingResponses', querySnapshot.docs[0].id);
        await updateDoc(docRef, {
          response: aiResponse,
          lastUpdated: new Date()
        });
      } else {
        await addDoc(responsesRef, {
          language,
          response: aiResponse,
          lastUpdated: new Date()
        });
      }

      setResponses(prev => {
        const newResponses = prev.filter(r => r.language !== language);
        const updatedResponse = {
          language,
          response: aiResponse,
          lastUpdated: new Date()
        };
        return [...newResponses, updatedResponse];
      });
    } catch (error) {
      console.error('Error fetching response:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    if (selectedLanguage) {
      await fetchResponse(selectedLanguage);
    }
  };

  const convertMarkdownToHtml = (text: string): string => {
    return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  };

  const isAdminUser = user?.email === 'labaj.jakub@gmail.com';

  const renderFeatureContent = () => (
    <Box>
      <Box sx={{ 
        display: 'flex', 
        flexDirection: isMobile ? 'column' : 'row',
        justifyContent: 'space-between', 
        alignItems: isMobile ? 'flex-start' : 'center', 
        mb: 2,
        gap: isMobile ? 1 : 0
      }}>
        <Typography 
          variant="h5"
          sx={{
            fontSize: isMobile ? '1.5rem' : '2rem'
          }}
        >
          {selectedLanguage} Features
        </Typography>
        {isAdminUser && (
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
            disabled={loading}
            size={isMobile ? 'small' : 'medium'}
            fullWidth={isMobile}
          >
            Refresh
          </Button>
        )}
      </Box>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Box>
          <Typography 
            variant="body1" 
            sx={{ 
              whiteSpace: 'pre-wrap',
              fontSize: isMobile ? '0.9rem' : '1rem',
              '& strong': {
                color: 'primary.main',
                fontWeight: 600
              }
            }}
            dangerouslySetInnerHTML={{ 
              __html: convertMarkdownToHtml(responses.find(r => r.language === selectedLanguage)?.response || 'No response available.')
            }}
          />
          <Typography 
            variant="caption" 
            color="text.secondary" 
            sx={{ 
              mt: 2, 
              display: 'block',
              fontSize: isMobile ? '0.75rem' : '0.875rem'
            }}
          >
            Last updated: {responses.find(r => r.language === selectedLanguage)?.lastUpdated.toLocaleString() || 'Never'}
          </Typography>
        </Box>
      )}
    </Box>
  );

  const renderMostRequestedContent = () => (
    <Box>
      <Typography 
        variant="h5"
        sx={{
          fontSize: isMobile ? '1.5rem' : '2rem',
          mb: 2
        }}
      >
        Highly requested features under consideration or development
      </Typography>
      <Typography 
        variant="body1" 
        sx={{ 
          whiteSpace: 'pre-wrap',
          fontSize: isMobile ? '0.9rem' : '1rem',
          '& strong': {
            color: 'primary.main',
            fontWeight: 600
          }
        }}
      >
        This section will show the most requested features across all programming languages. Coming soon!
      </Typography>
    </Box>
  );

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: isMobile ? 'column' : 'row',
      gap: 2, 
      height: '100%',
      width: '100%'
    }}>
      <Paper sx={{ 
        width: isMobile ? '100%' : 240, 
        p: 2,
        mb: isMobile ? 2 : 0
      }}>
        <Typography variant="h6" gutterBottom>
          Programming Languages
        </Typography>
        <List>
          {languages.map((lang) => (
            <React.Fragment key={lang.name}>
              <ListItem disablePadding>
                <ListItemButton
                  selected={selectedLanguage === lang.name}
                  onClick={() => setSelectedLanguage(lang.name)}
                  sx={{
                    borderRadius: 1,
                    '&.Mui-selected': {
                      backgroundColor: theme.palette.primary.main + '20',
                      '&:hover': {
                        backgroundColor: theme.palette.primary.main + '30',
                      },
                    },
                  }}
                >
                  <ListItemText 
                    primary={lang.name}
                    primaryTypographyProps={{
                      sx: {
                        fontSize: isMobile ? '0.9rem' : '1rem'
                      }
                    }}
                  />
                </ListItemButton>
              </ListItem>
              <Divider />
            </React.Fragment>
          ))}
        </List>
      </Paper>

      <Paper sx={{ 
        flex: 1, 
        p: isMobile ? 1.5 : 2,
        minHeight: isMobile ? 'auto' : '100%'
      }}>
        {selectedLanguage ? (
          <Box>
            <Typography 
              variant="h6" 
              sx={{
                fontSize: isMobile ? '0.9rem' : '1rem',
                color: 'primary.main',
                textTransform: 'uppercase',
                borderBottom: '2px solid',
                borderColor: 'primary.main',
                pb: 1,
                mb: 2,
                fontFamily: theme.typography.fontFamily,
                letterSpacing: '0.02857em',
                lineHeight: 1.75
              }}
            >
              Highly requested features under consideration or development
            </Typography>
            {renderFeatureContent()}
          </Box>
        ) : (
          <Typography 
            variant="body1" 
            color="text.secondary"
            sx={{
              fontSize: isMobile ? '0.9rem' : '1rem'
            }}
          >
            Select a programming language to see its features and best practices.
          </Typography>
        )}
      </Paper>
    </Box>
  );
}; 