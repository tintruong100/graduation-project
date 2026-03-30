'use client';

import { useState } from 'react';
import { Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';

export default function LoginForm() {
  const [employee_code, setEmployeeCode] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:8000/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employee_code, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Handle successful login
      localStorage.setItem('token', data.data.token); // Adjust based on your backend response
      window.location.href = '/dashboard'; // Redirect to dashboard or home

    } catch (err: any) {
      setError(err.message || 'An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      {error && (
        <div className="p-3 text-sm text-red-500 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl text-center">
          {error}
        </div>
      )}
      <div className="space-y-2 text-left">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="employee_code">
          Employee Code
        </label>
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors group-focus-within:text-blue-500 text-gray-400">
            <Mail className="h-5 w-5" />
          </div>
          <input
            id="employee_code"
            type="text"
            required
            className="block w-full pl-10 pr-3 py-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 dark:bg-gray-800/50 text-gray-900 dark:text-white sm:text-sm transition-all outline-none"
            placeholder="Enter your employee code"
            value={employee_code}
            onChange={(e) => setEmployeeCode(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2 text-left">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="password">
          Password
        </label>
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors group-focus-within:text-blue-500 text-gray-400">
            <Lock className="h-5 w-5" />
          </div>
          <input
            id="password"
            type="password"
            required
            className="block w-full pl-10 pr-3 py-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 dark:bg-gray-800/50 text-gray-900 dark:text-white sm:text-sm transition-all outline-none"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <input
            id="remember-me"
            name="remember-me"
            type="checkbox"
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded custom-checkbox outline-none"
          />
          <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
            Remember me
          </label>
        </div>

        <div className="text-sm">
          <a href="#" className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 transition-colors">
            Forgot password?
          </a>
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-lg shadow-blue-500/30 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-300 transform active:scale-[0.98]"
      >
        {isLoading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <span className="flex items-center">
            Sign In
            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </span>
        )}
      </button>
    </form>
  )
}
