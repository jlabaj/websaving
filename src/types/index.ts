export interface Link {
  id: string;
  title: string;
  url: string;
  categoryId: string;
  createdAt: Date;
  userId: string;
}

export interface Category {
  id: string;
  name: string;
  userId: string;
  createdAt: Date;
} 