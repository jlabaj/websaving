import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  List,
  ListItemButton,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Typography,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Divider
} from '@mui/material';
import { Delete as DeleteIcon, Add as AddIcon, Edit as EditIcon, Check as CheckIcon, Close as CloseIcon } from '@mui/icons-material';
import { collection, query, where, getDocs, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { Category } from '../types';

export const CategoryList: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchCategories();
    }
  }, [user]);

  const fetchCategories = async () => {
    if (!user) return;
    
    const categoriesRef = collection(db, 'categories');
    const q = query(categoriesRef, where('userId', '==', user.uid));
    const querySnapshot = await getDocs(q);
    
    const categoriesList = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Category[];
    
    setCategories(categoriesList);
  };

  const handleAddCategory = async () => {
    if (!user || !newCategoryName.trim()) return;

    try {
      await addDoc(collection(db, 'categories'), {
        name: newCategoryName.trim(),
        userId: user.uid,
        createdAt: new Date()
      });
      setNewCategoryName('');
      setOpenDialog(false);
      fetchCategories();
    } catch (error) {
      console.error('Error adding category:', error);
    }
  };

  const handleEditStart = (category: Category) => {
    setEditingCategoryId(category.id);
    setEditingName(category.name);
  };

  const handleEditSave = async () => {
    if (!editingCategoryId || !editingName.trim()) return;

    try {
      await updateDoc(doc(db, 'categories', editingCategoryId), {
        name: editingName.trim()
      });
      setEditingCategoryId(null);
      setEditingName('');
      fetchCategories();
    } catch (error) {
      console.error('Error updating category:', error);
    }
  };

  const handleEditCancel = () => {
    setEditingCategoryId(null);
    setEditingName('');
  };

  const handleDeleteCategory = async (categoryId: string) => {
    try {
      await deleteDoc(doc(db, 'categories', categoryId));
      setCategories(categories.filter(category => category.id !== categoryId));
    } catch (error) {
      console.error('Error deleting category:', error);
    }
  };

  const handleCategoryClick = (categoryId: string) => {
    if (editingCategoryId !== categoryId) {
      navigate(`/category/${categoryId}`);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Categories</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenDialog(true)}
        >
          Add Category
        </Button>
      </Box>

      <List>
        {categories.map((category) => (
          <React.Fragment key={category.id}>
            <ListItemButton
              onClick={() => handleCategoryClick(category.id)}
              sx={{
                borderRadius: 1,
                '&:hover': {
                  backgroundColor: 'action.hover',
                },
              }}
            >
              {editingCategoryId === category.id ? (
                <TextField
                  fullWidth
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  autoFocus
                  size="small"
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <ListItemText 
                  primary={category.name}
                  primaryTypographyProps={{
                    sx: {
                      fontSize: '1rem'
                    }
                  }}
                />
              )}
              <ListItemSecondaryAction>
                {editingCategoryId === category.id ? (
                  <>
                    <IconButton
                      edge="end"
                      aria-label="save"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditSave();
                      }}
                      sx={{ mr: 1 }}
                    >
                      <CheckIcon />
                    </IconButton>
                    <IconButton
                      edge="end"
                      aria-label="cancel"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditCancel();
                      }}
                      sx={{ mr: 1 }}
                    >
                      <CloseIcon />
                    </IconButton>
                  </>
                ) : (
                  <IconButton
                    edge="end"
                    aria-label="edit"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditStart(category);
                    }}
                    sx={{ mr: 1 }}
                  >
                    <EditIcon />
                  </IconButton>
                )}
                <IconButton
                  edge="end"
                  aria-label="delete"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteCategory(category.id);
                  }}
                >
                  <DeleteIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItemButton>
            <Divider />
          </React.Fragment>
        ))}
      </List>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Add New Category</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Category Name"
            fullWidth
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleAddCategory} variant="contained">
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}; 