import React, { useState } from 'react';

interface SignupPageProps {
  onSignup: (name: string, email: string, pass: string) => void;
  onNavigateToLogin: () => void;
}

export const SignupPage: React.FC<SignupPageProps> = ({ onSignup, onNavigateToLogin }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && email && password) {
      onSignup(name, email, password);
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
              <h2 className="text-3xl font-bold text-slate-800 mt-4">Create an Account</h2>
              <p className="text-slate-600 mt-2">Get started by creating your account.</p>
            </div>
        
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                <label htmlFor="name" className="block text-sm font-semibold text-slate-700">
                    Full Name
                </label>
                <div className="mt-1">
                    <input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm"
                    />
                </div>
                </div>
                
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
                    autoComplete="new-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm"
                    />
                </div>
                </div>

                <div className="text-xs text-slate-500 text-center">
                  By signing up, you agree to our (not yet existing) Terms of Service and Privacy Policy. Your data is used solely for the functionality of this demonstration app.
                </div>

                <div>
                <button
                    type="submit"
                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                    Sign Up
                </button>
                </div>
            </form>

            <p className="mt-8 text-center text-sm text-slate-600">
                Already have an account?{' '}
                <button onClick={onNavigateToLogin} className="font-semibold text-blue-600 hover:text-blue-500">
                Sign in here
                </button>
            </p>
        </div>
    </div>
  );
};
