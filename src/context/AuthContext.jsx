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

  const login = ({ token, role }) => {
    const isDemoUser = role === 'demo';
    
    const userData = { 
      token, 
      role
    };
    
    localStorage.setItem('hospitalUser', JSON.stringify(userData));
    
    // Store demo flag separately if it's a demo user
    if (isDemoUser) {
      localStorage.setItem('isDemoUser', 'true');
      console.log('Demo user logged in - flag stored separately');
    } else {
      // Clear demo flag if it exists (in case of switching from demo to regular user)
      localStorage.removeItem('isDemoUser');
    }
    
    setUser(userData);

    // Redirect based on role
    if (role === 'admin') navigate('/dashboard/admin');
    else if (role === 'demo') navigate('/dashboard/demo');
    else if (role === 'doctor') navigate('/dashboard/doctor');
    else if (role && role.toLowerCase() === 'nurse') navigate('/dashboard/nurse');
    else if (role === 'staff' || role === 'registrar' || role === 'receptionist') navigate('/dashboard/staff');
    else if (role === 'pharmacy') navigate('/dashboard/pharmacy');
    else if (role === 'pathology_staff') navigate('/dashboard/pathology');
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
    
    // Clear demo flag if it exists
    localStorage.removeItem('isDemoUser');
    
    // Clear user data
    localStorage.removeItem('hospitalUser');
    setUser(null);
    navigate('/');
  };

  // Helper to check if current user is a demo user
  const isDemoSession = () => {
    return localStorage.getItem('isDemoUser') === 'true';
  };

  const value = {
    user,
    login,
    logout,
    loading,
    isAuthenticated: !!user,
    isDemoSession // Helper function to check demo status from separate storage
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};