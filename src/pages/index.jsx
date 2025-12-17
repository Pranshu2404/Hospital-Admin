import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { ForgotPasswordForm } from './ForgotPassword';
import hospitalImg from '../assets/hospitalerp.png'; 

// --- Icons ---
const MailIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400 group-focus-within:text-emerald-600 transition-colors duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const LockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400 group-focus-within:text-emerald-600 transition-colors duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
);

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showForgot, setShowForgot] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/auth/login`, { email, password });
      
      const { token, role } = res.data;
      localStorage.setItem("doctorId", res.data.doctorId || null);
      localStorage.setItem("hospitalId", res.data.hospitalID || null);
      localStorage.setItem("staffId", res.data.staffId || null);
      localStorage.setItem("pharmacyId", res.data.pharmacyId || null);
      
      login({ token, role });
    } catch (err) {
      console.log(err);
      setError(err.response?.data?.message || 'Login failed.');
    } finally {
      setIsLoading(false);
    }
  };

  if (showForgot) {
    return <ForgotPasswordForm onClose={() => setShowForgot(false)} />;
  }

  return (
    <div className="min-h-screen w-full flex font-sans overflow-hidden bg-gray-50">
      
      {/* --- Left Side: Decorative Section --- */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-emerald-50 to-teal-100 flex-col items-center justify-center relative p-12">
        {/* Background decorative blobs */}
        <div className="absolute top-20 left-20 w-72 h-72 bg-emerald-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-72 h-72 bg-teal-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse delay-1000"></div>

        <div className="relative z-10 text-center">
           {/* Main Illustration (reduced size) */}
          <div className="bg-white/40 backdrop-blur-md rounded-[2rem] shadow-xl ring-1 ring-white/60 mb-8 w-[400px] h-[300px] overflow-hidden mx-auto">
            <img
              src={hospitalImg}
              alt="Hospital Illustration"
              className="w-full h-full object-cover drop-shadow-md"
            />
          </div>

          <h1 className="text-4xl font-extrabold text-gray-800 tracking-tight mb-4">
            Welcome to <span className="text-emerald-600">Hospital ERP</span>
          </h1>
          <p className="text-gray-600 text-lg max-w-md mx-auto leading-relaxed">
            Your integrated solution for seamless, efficient, and modern hospital management.
          </p>
        </div>
      </div>

      {/* --- Right Side: Login Form --- */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
        
        {/* Professional Card Wrapper with 'group' class for hover effects */}
        <div className="group w-full max-w-[480px] bg-white rounded-3xl shadow-2xl border border-slate-100 p-8 sm:p-10 relative overflow-hidden transition-all duration-300 hover:shadow-emerald-900/10">
          
          {/* ANIMATED BORDER: 
            - starts at width-0 (w-0)
            - on hover (group-hover) it becomes width-full (w-full)
            - transition allows it to slide from left to right
          */}
          <div className="absolute top-0 left-0 h-1.5 bg-gradient-to-r from-emerald-400 to-teal-500 transition-all duration-700 ease-in-out w-0 group-hover:w-full"></div>

          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Sign In</h2>
            <p className="mt-2 text-sm text-gray-500">
              Please enter your details to continue.
            </p>
          </div>

          {error && (
            <div className="flex items-center p-4 mb-6 text-sm text-red-700 border-l-4 border-red-500 bg-red-50 rounded-md shadow-sm animate-fade-in" role="alert">
              <svg className="flex-shrink-0 inline w-5 h-5 mr-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z"/>
              </svg>
              <div><span className="font-semibold">Access Denied:</span> {error}</div>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            
            {/* Email Input Field */}
            <div className="space-y-1">
              <label className="block text-sm font-semibold text-gray-700 ml-1">Email Address</label>
              <div className="relative group/input">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none z-10">
                  <MailIcon />
                </div>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  required
                  className="block w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 text-gray-900 text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition-all duration-200 placeholder-slate-400"
                  placeholder="doctor@hospital.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </div>
            </div>

            {/* Password Input Field */}
            <div className="space-y-1">
              <label className="block text-sm font-semibold text-gray-700 ml-1">Password</label>
              <div className="relative group/input">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none z-10">
                  <LockIcon />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="block w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 text-gray-900 text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition-all duration-200 placeholder-slate-400"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center">
                 {/* Empty div for spacing if remember me is missing */}
              </div>
              <div className="text-sm">
                <button 
                  type="button" 
                  onClick={() => setShowForgot(true)} 
                  className="font-medium text-emerald-600 hover:text-emerald-700 transition-colors hover:underline"
                >
                  Forgot password?
                </button>
              </div>
            </div>       

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all duration-200 shadow-lg shadow-emerald-500/30 transform active:scale-[0.98] ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {isLoading ? (
                   <div className="flex items-center">
                     <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                       <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                       <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                     </svg>
                     Signing in...
                   </div>
                ) : 'Sign In'}
              </button>
            </div>

            {/* Create Account CTA (professional, subtle) */}
            <div className="mt-4">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-white px-3 text-sm text-slate-400">New here?</span>
                </div>
              </div>

              <div className="mt-4">
                <Link
                  to="/register"
                  className="w-full inline-flex items-center justify-center py-3 px-4 border border-emerald-600 text-sm font-semibold rounded-xl text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-colors shadow-sm"
                >
                  Create an account
                </Link>
              </div>
            </div>
          </form>

          {/* Footer Text */}
          <div className="mt-8 text-center">
            <p className="text-xs text-slate-400">
              © {new Date().getFullYear()} Hospital ERP System. <br/>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}