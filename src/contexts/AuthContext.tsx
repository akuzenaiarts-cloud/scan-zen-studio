import React, { createContext, useContext, useState, ReactNode } from 'react';

interface User {
  id: string;
  name: string;
  avatar: string;
  provider: 'discord' | 'google';
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (provider: 'discord' | 'google') => void;
  logout: () => void;
  showLoginModal: boolean;
  setShowLoginModal: (show: boolean) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const login = (provider: 'discord' | 'google') => {
    // Mock login
    setUser({
      id: '1',
      name: provider === 'discord' ? 'DiscordUser#1234' : 'GoogleUser',
      avatar: '',
      provider,
    });
    setShowLoginModal(false);
  };

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout, showLoginModal, setShowLoginModal }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
