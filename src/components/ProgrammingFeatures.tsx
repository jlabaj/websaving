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
  Button
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

  const languages = [
    { name: 'TypeScript', prompt: 'highly requested TypeScript features under consideration or development' },
    { name: 'JavaScript', prompt: 'highly requested JavaScript features under consideration or development' },
    { name: 'C#', prompt: 'highly requested C# features under consideration or development' }
  ];

  useEffect(() => {
    if (user && selectedLanguage) {
      console.log('Loading response for language:', selectedLanguage);
      loadResponse(selectedLanguage);
    }
  }, [user, selectedLanguage]);

  const loadResponse = async (language: string) => {
    if (!user) return;

    try {
      const responsesRef = collection(db, 'programmingResponses');
      const q = query(
        responsesRef,
        where('userId', '==', user.uid),
        where('language', '==', language)
      );
      const querySnapshot = await getDocs(q);

      console.log('Query snapshot:', querySnapshot.empty ? 'empty' : 'has data');

      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        const data = doc.data();
        console.log('Loaded data from Firestore:', data);
        
        setResponses(prev => {
          const newResponses = prev.filter(r => r.language !== language);
          const updatedResponse = {
            language,
            response: data.response,
            lastUpdated: data.lastUpdated?.toDate() || new Date()
          };
          console.log('Setting new response:', updatedResponse);
          return [...newResponses, updatedResponse];
        });
      } else {
        console.log('No existing response found, fetching new one');
        await fetchResponse(language);
      }
    } catch (error) {
      console.error('Error loading response:', error);
    }
  };

  const fetchResponse = async (language: string) => {
    if (!user) return;
    setLoading(true);
    try {
      const prompt = languages.find(lang => lang.name === language)?.prompt;
      if (!prompt) return;

      console.log('Fetching new response for:', language);
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
      console.log('Received AI response:', aiResponse);

      // Save to Firestore
      const responsesRef = collection(db, 'programmingResponses');
      const q = query(
        responsesRef,
        where('userId', '==', user.uid),
        where('language', '==', language)
      );
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const docRef = doc(db, 'programmingResponses', querySnapshot.docs[0].id);
        await updateDoc(docRef, {
          response: aiResponse,
          lastUpdated: new Date()
        });
        console.log('Updated existing document');
      } else {
        await addDoc(responsesRef, {
          userId: user.uid,
          language,
          response: aiResponse,
          lastUpdated: new Date()
        });
        console.log('Created new document');
      }

      setResponses(prev => {
        const newResponses = prev.filter(r => r.language !== language);
        const updatedResponse = {
          language,
          response: aiResponse,
          lastUpdated: new Date()
        };
        console.log('Setting new response in state:', updatedResponse);
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

  return (
    <Box sx={{ display: 'flex', gap: 2, height: '100%' }}>
      <Paper sx={{ width: 240, p: 2 }}>
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
                >
                  <ListItemText primary={lang.name} />
                </ListItemButton>
              </ListItem>
              <Divider />
            </React.Fragment>
          ))}
        </List>
      </Paper>

      <Paper sx={{ flex: 1, p: 2 }}>
        {selectedLanguage ? (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h5">
                {selectedLanguage} Features
              </Typography>
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={handleRefresh}
                disabled={loading}
              >
                Refresh
              </Button>
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
                    '& strong': {
                      color: 'primary.main',
                      fontWeight: 600
                    }
                  }}
                  dangerouslySetInnerHTML={{ 
                    __html: convertMarkdownToHtml(responses.find(r => r.language === selectedLanguage)?.response || 'No response available.')
                  }}
                />
                <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
                  Last updated: {responses.find(r => r.language === selectedLanguage)?.lastUpdated.toLocaleString() || 'Never'}
                </Typography>
              </Box>
            )}
          </Box>
        ) : (
          <Typography variant="body1" color="text.secondary">
            Select a programming language to see its features and best practices.
          </Typography>
        )}
      </Paper>
    </Box>
  );
}; 