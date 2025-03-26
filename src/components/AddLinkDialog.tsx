import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button
} from '@mui/material';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';

interface AddLinkDialogProps {
  open: boolean;
  onClose: () => void;
  categoryId: string;
  onLinkAdded: () => void;
}

export const AddLinkDialog: React.FC<AddLinkDialogProps> = ({
  open,
  onClose,
  categoryId,
  onLinkAdded
}) => {
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const { user } = useAuth();

  const handleSubmit = async () => {
    if (!user || !title.trim() || !url.trim()) return;

    try {
      await addDoc(collection(db, 'links'), {
        title: title.trim(),
        url: url.trim(),
        categoryId,
        userId: user.uid,
        createdAt: new Date()
      });

      setTitle('');
      setUrl('');
      onLinkAdded();
      onClose();
    } catch (error) {
      console.error('Error adding link:', error);
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Add New Link</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Title"
          fullWidth
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <TextField
          margin="dense"
          label="URL"
          fullWidth
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained">
          Add
        </Button>
      </DialogActions>
    </Dialog>
  );
}; 