import React, { useState, useEffect } from 'react';
import {
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Typography,
  Box,
  Button
} from '@mui/material';
import { Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { Link } from '../types';
import { AddLinkDialog } from './AddLinkDialog';

interface LinkListProps {
  categoryId: string;
}

export const LinkList: React.FC<LinkListProps> = ({ categoryId }) => {
  const [links, setLinks] = useState<Link[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchLinks();
    }
  }, [user, categoryId]);

  const fetchLinks = async () => {
    if (!user) return;
    
    const linksRef = collection(db, 'links');
    const q = query(
      linksRef,
      where('userId', '==', user.uid),
      where('categoryId', '==', categoryId)
    );
    const querySnapshot = await getDocs(q);
    
    const linksList = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Link[];
    
    setLinks(linksList);
  };

  const handleDeleteLink = async (linkId: string) => {
    try {
      await deleteDoc(doc(db, 'links', linkId));
      setLinks(links.filter(link => link.id !== linkId));
    } catch (error) {
      console.error('Error deleting link:', error);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Links</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenDialog(true)}
        >
          Add Link
        </Button>
      </Box>

      <List>
        {links.map((link) => (
          <ListItem key={link.id}>
            <ListItemText
              primary={link.title}
              secondary={
                <a href={link.url} target="_blank" rel="noopener noreferrer">
                  {link.url}
                </a>
              }
            />
            <ListItemSecondaryAction>
              <IconButton
                edge="end"
                aria-label="delete"
                onClick={() => handleDeleteLink(link.id)}
              >
                <DeleteIcon />
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>

      <AddLinkDialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        categoryId={categoryId}
        onLinkAdded={fetchLinks}
      />
    </Box>
  );
}; 