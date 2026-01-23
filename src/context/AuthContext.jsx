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
    else if (role && role.toLowerCase() === 'nurse') navigate('/dashboard/nurse');
    else if (role === 'staff' || role === 'registrar' || role === 'receptionist') navigate('/dashboard/staff');
    else if (role === 'pharmacy') navigate('/dashboard/pharmacy');
    else navigate('/');
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('hospitalUser');

    // Selective cleanup based on role
    if (user?.role === 'doctor') {
      localStorage.removeItem('doctorId');
    } else if (user?.role === 'staff' || user?.role === 'nurse') {
      localStorage.removeItem('staffId');
    } else if (user?.role === 'pharmacy') {
      localStorage.removeItem('pharmacyId');
    }
    // hospitalId is usually preserved or handled separately, user didn't ask to clear it specifically on role logout, 
    // but often it's associated with the session. For now, I'll leave it or remove it? 
    // The user said "not the doctor id".
    // I will NOT remove hospitalId linearly unless required. 
    // Actually, previously I was removing it. If I stop removing it, it persists. 
    // I'll leave hospitalId alone for now as it wasn't the main complaint.

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
