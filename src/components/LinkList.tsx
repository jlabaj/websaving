import React, { useState, useEffect } from 'react';
import {
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography
} from '@mui/material';
import { Delete as DeleteIcon, Add as AddIcon, Edit as EditIcon } from '@mui/icons-material';
import { collection, query, where, getDocs, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { Link } from '../types';

interface LinkListProps {
  categoryId: string;
}

export const LinkList: React.FC<LinkListProps> = ({ categoryId }) => {
  const [links, setLinks] = useState<Link[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [newLink, setNewLink] = useState({ title: '', url: '' });
  const [editingLink, setEditingLink] = useState<Link | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchLinks();
    }
  }, [user, categoryId]);

  const fetchLinks = async () => {
    if (!user) return;
    
    const linksRef = collection(db, 'links');
    const q = query(linksRef, where('categoryId', '==', categoryId));
    const querySnapshot = await getDocs(q);
    
    const linksList = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Link[];
    
    setLinks(linksList);
  };

  const handleAddLink = async () => {
    if (!user || !newLink.title.trim() || !newLink.url.trim()) return;

    try {
      await addDoc(collection(db, 'links'), {
        title: newLink.title.trim(),
        url: newLink.url.trim(),
        categoryId,
        userId: user.uid,
        createdAt: new Date()
      });
      setNewLink({ title: '', url: '' });
      setOpenDialog(false);
      fetchLinks();
    } catch (error) {
      console.error('Error adding link:', error);
    }
  };

  const handleEditLink = async () => {
    if (!editingLink || !editingLink.title.trim() || !editingLink.url.trim()) return;

    try {
      await updateDoc(doc(db, 'links', editingLink.id), {
        title: editingLink.title.trim(),
        url: editingLink.url.trim()
      });
      setOpenEditDialog(false);
      setEditingLink(null);
      fetchLinks();
    } catch (error) {
      console.error('Error updating link:', error);
    }
  };

  const handleDeleteLink = async (linkId: string) => {
    try {
      await deleteDoc(doc(db, 'links', linkId));
      setLinks(links.filter(link => link.id !== linkId));
    } catch (error) {
      console.error('Error deleting link:', error);
    }
  };

  const handleEditClick = (link: Link) => {
    setEditingLink(link);
    setOpenEditDialog(true);
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
              primary={
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  {link.title}
                </a>
              }
            />
            <ListItemSecondaryAction>
              <IconButton
                edge="end"
                aria-label="edit"
                onClick={() => handleEditClick(link)}
                sx={{ mr: 1 }}
              >
                <EditIcon />
              </IconButton>
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

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Add New Link</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Title"
            fullWidth
            value={newLink.title}
            onChange={(e) => setNewLink(prev => ({ ...prev, title: e.target.value }))}
          />
          <TextField
            margin="dense"
            label="URL"
            fullWidth
            value={newLink.url}
            onChange={(e) => setNewLink(prev => ({ ...prev, url: e.target.value }))}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleAddLink} variant="contained">
            Add
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)}>
        <DialogTitle>Edit Link</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Title"
            fullWidth
            value={editingLink?.title || ''}
            onChange={(e) => setEditingLink(prev => prev ? { ...prev, title: e.target.value } : null)}
          />
          <TextField
            margin="dense"
            label="URL"
            fullWidth
            value={editingLink?.url || ''}
            onChange={(e) => setEditingLink(prev => prev ? { ...prev, url: e.target.value } : null)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditDialog(false)}>Cancel</Button>
          <Button onClick={handleEditLink} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}; 