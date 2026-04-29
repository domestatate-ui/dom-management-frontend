import { createContext, useContext, useState, createElement } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('dom_token'));
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('dom_user'));
    } catch {
      return null;
    }
  });

  const login = (tokenValue, userData) => {
    localStorage.setItem('dom_token', tokenValue);
    localStorage.setItem('dom_user', JSON.stringify(userData));
    setToken(tokenValue);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('dom_token');
    localStorage.removeItem('dom_user');
    setToken(null);
    setUser(null);
  };

  return createElement(
    AuthContext.Provider,
    { value: { token, user, login, logout, isAuthenticated: !!token } },
    children
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
