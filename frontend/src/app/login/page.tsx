import LoginForm from '../../components/login/LoginForm';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Login',
  description: 'Sign in to access your dashboard',
};

export default function LoginPage() {

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0a0a0a] relative overflow-hidden selection:bg-blue-500/30">
      {/* Decorative gradient glowing orbs */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-500/20 dark:bg-blue-600/20 blur-[120px] pointer-events-none animate-pulse duration-10000" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-500/20 dark:bg-purple-600/20 blur-[120px] pointer-events-none animate-pulse duration-10000 delay-1000" />

      <div className="max-w-md w-full mx-auto p-4 z-10 w-full">
        {/* Main Card */}
        <div className="bg-white/70 dark:bg-gray-900/40 backdrop-blur-2xl shadow-2xl rounded-[2rem] p-8 md:p-10 border border-white/50 dark:border-white/10 relative overflow-hidden">

          {/* Subtle glossy top inner highlight */}
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/40 dark:via-white/10 to-transparent" />

          <div className="text-center mb-10 mt-2">
            <img src="./img/logo-iuh.png" alt="Logo" className="mx-auto h-16 w-auto mb-10" />
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 mb-3">
              HRM System
            </h1>
          </div>

          <LoginForm />

        </div>

        {/* Footer info snippet or logo can go here */}
        <div className="text-center mt-8 text-xs text-gray-400 dark:text-gray-500">
          &copy; {new Date().getFullYear()} Graduation Project. All rights reserved.
        </div>
      </div>
    </div>
  );
}
