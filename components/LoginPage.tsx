import React, { useState } from 'react';

interface LoginPageProps {
  onLogin: (email: string, pass: string) => void;
  onNavigateToSignup: () => void;
}

const PasswordStrengthIndicator: React.FC<{ password?: string }> = ({ password = '' }) => {
    const getStrength = () => {
        let score = 0;
        if (password.length > 8) score++;
        if (password.match(/[a-z]/)) score++;
        if (password.match(/[A-Z]/)) score++;
        if (password.match(/[0-9]/)) score++;
        if (password.match(/[^a-zA-Z0-9]/)) score++;
        return score;
    };

    const strength = getStrength();
    const width = `${(strength / 5) * 100}%`;
    const color = strength < 3 ? 'bg-red-500' : strength < 4 ? 'bg-yellow-500' : 'bg-green-500';

    if (!password) return null;

    return (
        <div className="w-full bg-slate-200 rounded-full h-1.5 mt-2">
            <div className={`h-1.5 rounded-full ${color}`} style={{ width }}></div>
        </div>
    );
};

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin, onNavigateToSignup }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password) {
      onLogin(email, password);
    }
  };

  return (
    <div className="flex justify-center items-center py-12">
      <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg border border-slate-200">
        <div className="text-center mb-8">
            <div className="inline-block p-3 bg-blue-100 rounded-full">
                <svg className="h-8 w-8 text-blue-600" width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                    <path d="M9 5h-2a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-12a2 2 0 0 0 -2 -2h-2" />
                    <rect x="9" y="3" width="6" height="4" rx="2" />
                    <path d="M14 11h-2.5a1.5 1.5 0 0 0 0 3h1a1.5 1.5 0 0 1 0 3h-2.5" />
                    <path d="M12 17v1m0 -8v1" />
                </svg>
            </div>
          <h2 className="text-3xl font-bold text-slate-800 mt-4">Welcome Back!</h2>
          <p className="text-slate-600 mt-2">Please sign in to continue.</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-slate-700">
              Email Address
            </label>
            <div className="mt-1">
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm"
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-slate-700">
              Password
            </label>
            <div className="mt-1">
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm"
              />
               <PasswordStrengthIndicator password={password} />
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-800">
                Remember me
              </label>
            </div>
          </div>


          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Sign In
            </button>
          </div>
        </form>

        <div className="mt-6">
            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-slate-500">Or continue with</span>
                </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
                <div>
                    <button disabled className="w-full inline-flex justify-center py-2 px-4 border border-slate-300 rounded-md shadow-sm bg-white text-sm font-medium text-slate-500 hover:bg-slate-50 opacity-50 cursor-not-allowed" title="Coming Soon">
                        <span className="sr-only">Sign in with Google</span>
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M21.54,11.5H12.32V14.5H18.1C17.84,16.53 16.27,18 14,18C11.21,18 9,15.79 9,13C9,10.21 11.21,8 14,8C15.25,8 16.33,8.45 17.15,9.2L19.27,7.09C17.65,5.68 15.9,5 14,5C10.13,5 7,8.13 7,12C7,15.87 10.13,19 14,19C17.44,19 20.08,16.69 20.08,13.25C20.08,12.58 20.03,11.92 19.92,11.25H12V11.5H21.54Z" /></svg>
                    </button>
                </div>
                <div>
                    <button disabled className="w-full inline-flex justify-center py-2 px-4 border border-slate-300 rounded-md shadow-sm bg-white text-sm font-medium text-slate-500 hover:bg-slate-50 opacity-50 cursor-not-allowed" title="Coming Soon">
                        <span className="sr-only">Sign in with LinkedIn</span>
                         <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19,3A2,2 0 0,1 21,5V19A2,2 0 0,1 19,21H5A2,2 0 0,1 3,19V5A2,2 0 0,1 5,3H19M18.5,18.5V13.2A3.26,3.26 0 0,0 15.24,9.94C14.39,9.94 13.4,10.43 13,11.2V10.13H10.13V18.5H13V13.57C13,12.8 13.09,12.04 14.1,12.04C15.1,12.04 15.24,12.91 15.24,13.67V18.5H18.5M6.88,8.56A1.68,1.68 0 0,0 8.56,6.88C8.56,6 7.78,5.22 6.88,5.22C6,5.22 5.22,6 5.22,6.88C5.22,7.78 6,8.56 6.88,8.56M8.27,18.5V10.13H5.5V18.5H8.27Z" /></svg>
                    </button>
                </div>
            </div>
        </div>

        <p className="mt-8 text-center text-sm text-slate-600">
          Don't have an account?{' '}
          <button onClick={onNavigateToSignup} className="font-semibold text-blue-600 hover:text-blue-500">
            Sign up here
          </button>
        </p>
      </div>
    </div>
  );
};
