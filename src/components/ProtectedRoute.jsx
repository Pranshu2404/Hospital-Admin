import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, role }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="text-center mt-10">Loading...</div>; // or show a spinner component
  }

  // if (!user) {
  //   return <Navigate to="/" replace />; // not logged in
  // }

  // if (role && user.role !== role) {
  //   return <Navigate to="/" replace />; // unauthorized role
  // }

  return children;
};

export default ProtectedRoute;
