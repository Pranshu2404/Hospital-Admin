// context/AuthContext.jsx
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
    else if (role === 'pathology_staff') navigate('/dashboard/pathology'); // Add pathology dashboard route
    else navigate('/');
  };

  // Logout function
  const logout = () => {
    // Get user role before clearing
    const userRole = user?.role;
    
    // Selective cleanup based on role
    if (userRole === 'doctor') {
      localStorage.removeItem('doctorId');
    } else if (userRole === 'staff' || userRole === 'nurse' || userRole === 'registrar' || userRole === 'receptionist') {
      localStorage.removeItem('staffId');
    } else if (userRole === 'pharmacy') {
      localStorage.removeItem('pharmacyId');
    } else if (userRole === 'pathology_staff') {
      localStorage.removeItem('pathologyStaffId');
    }
    
    // hospitalId is usually preserved across sessions
    // Don't remove hospitalId as it's needed for hospital context
    
    // Clear user data
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