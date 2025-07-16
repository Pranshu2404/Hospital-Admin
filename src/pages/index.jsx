import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { ForgotPasswordForm } from './ForgotPassword';

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showForgot, setShowForgot] = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');

    try {
      const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/auth/login`, { email, password });

      const { token, role } = res.data;

      login({ token, role });
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed.');
    }
  };

  if (showForgot) {
    return <ForgotPasswordForm onClose={() => setShowForgot(false)} />;
  }

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-10 rounded-lg shadow w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>

        {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

        <input
          type="email"
          placeholder="Email"
          className="w-full mb-4 p-2 border rounded focus:outline-none focus:ring-teal-500 focus:border-teal-500"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full mb-4 p-2 border rounded focus:outline-none focus:ring-teal-500 focus:border-teal-500"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />

        <button type="submit" className="w-full bg-teal-600 text-white py-2 rounded hover:bg-teal-700 transition">
          Login
        </button>

        <div className="mt-4 text-center">
          <button
            type="button"
            className="text-sm text-teal-600 hover:underline"
            onClick={() => setShowForgot(true)}
          >
            Forgot Password?
          </button>
        </div>
      </form>
    </div>
  );
}
