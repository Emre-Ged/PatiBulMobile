// context/AuthContext.tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import React, {
  createContext,
  ReactNode,
  useEffect,
  useState,
} from 'react';
import { Alert } from 'react-native';
  
  const API = 'http://192.168.0.105:3000';
  
  type User = {
    user_id: number;
    name:    string;
    email:   string;
    rating:  number;
  };
  
  type AuthContextType = {
    user: User | null;
    loading: boolean;
    login:   (email: string, password: string) => Promise<void>;
    register:(name: string, email: string, password: string) => Promise<void>;
    logout:  () => Promise<void>;
    deleteAccount: () => Promise<void>;
  };
  
  export const AuthContext = createContext<AuthContextType>({} as any);
  
  export default function AuthProvider({ children }: { children: ReactNode }) {
    const [user,    setUser]    = useState<User|null>(null);
    const [loading, setLoading] = useState(true);
  
    // bootstrap: load from storage
    useEffect(() => {
      AsyncStorage.getItem('user')
        .then(json => {
          if (json) setUser(JSON.parse(json));
        })
        .finally(() => setLoading(false));
    }, []);
  
    // save user to storage
    const persist = async (u: User|null) => {
      setUser(u);
      if (u)  await AsyncStorage.setItem('user', JSON.stringify(u));
      else    await AsyncStorage.removeItem('user');
    };
  
    const login = async (email: string, password: string) => {
      try {
        const resp = await axios.get(`${API}/user_main`, {
          params: { email: `eq.${email}` }
        });
        const u = resp.data[0] as User;
        if (!u || (u as any).password !== password) {
          throw new Error('Invalid credentials');
        }
        await persist(u);
      } catch (e: any) {
        Alert.alert('Login failed', e.message);
        throw e;
      }
    };
  
    const register = async (name: string, email: string, password: string) => {
      try {
        const resp = await axios.post(`${API}/user_main`, {
          name, email, password, rating: 0
        });
        const u = resp.data[0] as User;
        await persist(u);
      } catch (e: any) {
        Alert.alert('Registration failed', e.message);
        throw e;
      }
    };
  
    const logout = async () => {
      await persist(null);
    };
  
    const deleteAccount = async () => {
      if (!user) return;
      try {
        await axios.delete(`${API}/user_main`, {
          params: { user_id: `eq.${user.user_id}` }
        });
        await persist(null);
      } catch (e: any) {
        Alert.alert('Delete failed', e.message);
      }
    };
  
    return (
      <AuthContext.Provider value={{
        user, loading,
        login, register,
        logout, deleteAccount
      }}>
        {children}
      </AuthContext.Provider>
    );
  }