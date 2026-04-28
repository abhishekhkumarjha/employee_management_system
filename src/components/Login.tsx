import React, { useState } from 'react';
import { 
  Mail, 
  Lock, 
  ArrowRight, 
  AlertCircle,
  Activity,
  User
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function Login({ onLogin }: { onLogin: (user: any) => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Login failed');

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      onLogin(data.user);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col justify-center items-center p-4 font-sans">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-white p-8 sm:p-12 rounded-[2rem] shadow-2xl border border-white space-y-10 relative overflow-hidden"
      >
        {/* Background Accent */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full blur-3xl -mr-16 -mt-16"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-violet-50 rounded-full blur-3xl -ml-24 -mb-24"></div>

        <div className="relative z-10 text-center space-y-2">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-black text-2xl mx-auto shadow-xl shadow-indigo-200 mb-6 font-mono">
            H
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">Welcome Back</h2>
          <p className="text-gray-500 font-medium tracking-tight">Access your HR dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="relative z-10 space-y-6">
          <AnimatePresence mode="wait">
            {error && (
              <motion.div 
                initial={{ x: -10, opacity: 0 }} 
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 10, opacity: 0 }}
                className="p-4 bg-rose-50 rounded-2xl flex items-center gap-3 text-rose-600 text-sm font-semibold border border-rose-100"
              >
                <AlertCircle className="w-5 h-5 shrink-0" />
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-gray-400 ml-1">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
                <input 
                  type="email" 
                  autoFocus
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@hrpulse.com" 
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl text-sm focus:bg-white focus:border-indigo-600 focus:ring-0 outline-none transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Password</label>
                <button type="button" className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider hover:underline">Forgot?</button>
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••" 
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl text-sm focus:bg-white focus:border-indigo-600 focus:ring-0 outline-none transition-all"
                />
              </div>
            </div>
          </div>

          <button 
            type="submit"
            disabled={isLoading}
            className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all active:scale-95 disabled:opacity-70"
          >
            {isLoading ? (
              <Activity className="w-5 h-5 animate-spin" />
            ) : (
              <>
                Sign In to Dashboard
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>

        <div className="relative z-10 text-center space-y-4">
          <p className="text-[10px] text-gray-400 font-medium tracking-tight bg-gray-50 py-2 px-4 rounded-full inline-block">
            Demo Admin: <span className="text-indigo-600 font-bold">admin@hrpulse.com</span> / <span className="text-indigo-600 font-bold">admin123</span>
          </p>
        </div>
      </motion.div>

      {/* Footer */}
      <p className="mt-8 text-sm text-gray-400 font-medium">
        &copy; 2026 HRPulse Technologies. Built for excellence.
      </p>
    </div>
  );
}
