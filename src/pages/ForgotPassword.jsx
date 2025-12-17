import { useState } from 'react';
import axios from 'axios';

// --- Icons ---
const MailIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 group-focus-within:text-emerald-600 transition-colors duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

// Simple Lock Icon for the header
const LockIconLarge = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
);

const ArrowLeftIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
  </svg>
);

export function ForgotPasswordForm({ onClose }) {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setIsLoading(true);

    try {
      const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/auth/forgot-password`, { email });
      setMessage(res.data.message);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // Changed bg-gray-50 to a Green/Teal Gradient here:
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-50 px-4 py-12 font-sans">
      
      {/* Card Container */}
      <div className="group max-w-md w-full bg-white shadow-2xl rounded-3xl overflow-hidden border border-white/50 transition-all duration-300 hover:shadow-emerald-900/10">
        
        {/* Top Accent Line - Animated on Hover */}
        <div className="h-1.5 w-0 group-hover:w-full bg-gradient-to-r from-emerald-400 to-teal-500 transition-all duration-700 ease-in-out"></div>

        <div className="p-8 sm:p-10">
          
          {/* Header Section */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-50 mb-6 ring-8 ring-emerald-50/50">
              <LockIconLarge />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Forgot password?</h2>
            <p className="text-sm text-gray-500 mt-2 max-w-xs mx-auto leading-relaxed">
              No worries, we'll send you reset instructions.
            </p>
          </div>

          {/* Success Message */}
          {message && (
            <div className="mb-6 p-4 rounded-xl bg-green-50 border border-green-100 text-green-700 text-sm flex items-start gap-3 animate-fade-in">
              <svg className="w-5 h-5 flex-shrink-0 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <div>
                <span className="font-semibold block mb-1">Email Sent!</span>
                {message}
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 text-red-700 text-sm flex items-center gap-3 animate-fade-in">
              <svg className="w-5 h-5 flex-shrink-0 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              {error}
            </div>
          )}

          {/* Form */}
          {!message ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide ml-1">Email Address</label>
                <div className="relative group/input">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none z-10">
                    <MailIcon />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="block w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 text-gray-900 text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition-all duration-200 placeholder-slate-400 hover:bg-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-lg shadow-emerald-500/30 transform transition-all active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {isLoading ? (
                   <span className="flex items-center gap-2">
                     <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                     Sending Link...
                   </span>
                ) : 'Reset Password'}
              </button>
            </form>
          ) : (
            // Button to return to login after success
             <button
              onClick={onClose}
              className="w-full flex justify-center py-3.5 px-4 border border-slate-200 text-sm font-bold rounded-xl text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              Return to Login
            </button>
          )}

          {/* Footer / Back Button */}
          {!message && onClose && (
            <div className="mt-8 text-center">
              <button
                onClick={onClose}
                className="inline-flex items-center justify-center gap-2 text-sm font-medium text-gray-500 hover:text-emerald-600 transition-colors group/back"
                type="button"
              >
                <span className="group-hover/back:-translate-x-1 transition-transform duration-200">
                  <ArrowLeftIcon />
                </span>
                Back to Login
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Default export for route usage
export default function ForgotPassword() {
  return <ForgotPasswordForm onClose={() => window.history.back()} />;
}