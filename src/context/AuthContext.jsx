import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Create Context
const AuthContext = createContext();

// Custom hook
export const useAuth = () => useContext(AuthContext);

// Provider
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // user: { token, role }
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Load user from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('hospitalUser');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  // Login function
  const login = ({ token, role }) => {
    const userData = { token, role };
    localStorage.setItem('hospitalUser', JSON.stringify(userData));
    setUser(userData);

    // Redirect based on role
    if (role === 'admin') navigate('/dashboard/admin');
    else if (role === 'doctor') navigate('/dashboard/doctor');
    else if (role === 'staff') navigate('/dashboard/staff');
    else if (role === 'pharmacy') navigate('/dashboard/pharmacy');
    else navigate('/');
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('hospitalUser');
    setUser(null);
    navigate('/');
  };

  const value = {
    user,
    login,
    logout,
    loading,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
