import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Typography,
  Box,
  CircularProgress
} from '@mui/material';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { LinkList } from '../components/LinkList';
import { Category } from '../types';
import { Layout } from '../components/Layout';

export const CategoryPage: React.FC = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategory = async () => {
      if (!user || !categoryId) return;

      try {
        const categoryDoc = await getDoc(doc(db, 'categories', categoryId));
        if (!categoryDoc.exists()) {
          setError('Category not found');
          navigate('/');
          return;
        }

        const categoryData = categoryDoc.data() as Category;
        if (categoryData.userId !== user.uid) {
          setError('Unauthorized access');
          navigate('/');
          return;
        }

        setCategory({ ...categoryData, id: categoryDoc.id });
      } catch (err) {
        setError('Error fetching category');
        console.error('Error fetching category:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategory();
  }, [user, categoryId, navigate]);

  if (loading) {
    return (
      <Layout>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <CircularProgress />
        </Box>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Typography color="error">{error}</Typography>
        </Box>
      </Layout>
    );
  }

  return (
    <Layout showBackButton title={category?.name}>
      <LinkList categoryId={categoryId!} />
    </Layout>
  );
}; 