export interface Link {
  id: string;
  url: string;
  title: string;
  userId: string;
  createdAt: Date;
}

export interface AuthContextType {
  user: any | null;
  loading: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
} 