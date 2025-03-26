import { collection, addDoc, deleteDoc, doc, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { Link } from '../types/types';

export const createLink = async (userId: string, title: string, url: string): Promise<void> => {
  try {
    await addDoc(collection(db, 'links'), {
      url,
      title,
      userId,
      createdAt: new Date()
    });
  } catch (error) {
    console.error('Error adding link:', error);
    throw error;
  }
};

export const deleteLink = async (id: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'links', id));
  } catch (error) {
    console.error('Error deleting link:', error);
    throw error;
  }
};

export const subscribeToLinks = (userId: string, callback: (links: Link[]) => void): () => void => {
  const q = query(
    collection(db, 'links'),
    orderBy('createdAt', 'desc')
  );

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const linksData = snapshot.docs
      .map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate()
      })) as Link[];
    
    // Filter links for the current user
    const userLinks = linksData.filter(link => link.userId === userId);
    callback(userLinks);
  });

  return unsubscribe;
}; 