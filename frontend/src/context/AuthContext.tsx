'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface Student {
  id: number;
  full_name: string;
  email: string;
  year: number;
  branch: string;
  cgpa: number;
  skills: string;
  goals: string;
  github_url?: string;
  linkedin_url?: string;
}

interface AuthContextType {
  student: Student | null;
  loading: boolean;
  login: (studentId: number) => Promise<void>;
  updateProfile: (data: Partial<Student>) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const studentId = localStorage.getItem('studentId');
    if (studentId) {
      login(parseInt(studentId)).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (studentId: number) => {
    try {
      const res = await axios.get(`${API_URL}/api/profile/${studentId}`);
      setStudent(res.data);
      localStorage.setItem('studentId', studentId.toString());
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  const updateProfile = async (data: Partial<Student>) => {
    if (!student) return;
    try {
      const res = await axios.put(`${API_URL}/api/profile/${student.id}`, data);
      setStudent(res.data);
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  };

  const logout = () => {
    setStudent(null);
    localStorage.removeItem('studentId');
  };

  return (
    <AuthContext.Provider value={{ student, loading, login, updateProfile, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
