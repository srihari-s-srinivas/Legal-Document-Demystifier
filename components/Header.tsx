import React from 'react';
import type { User } from '../types';

interface HeaderProps {
  user: User | null;
  onLogout: () => void;
  onNavigateToDashboard: () => void;
  onNavigateToProfile: () => void;
}

export const Header: React.FC<HeaderProps> = ({ user, onLogout, onNavigateToDashboard, onNavigateToProfile }) => {
  return (
    <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div 
              className="flex items-center gap-2 cursor-pointer"
              onClick={user ? onNavigateToDashboard : undefined}
          >
              <svg className="h-8 w-8 text-blue-600" width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                <path d="M9 5h-2a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-12a2 2 0 0 0 -2 -2h-2" />
                <rect x="9" y="3" width="6" height="4" rx="2" />
                <path d="M14 11h-2.5a1.5 1.5 0 0 0 0 3h1a1.5 1.5 0 0 1 0 3h-2.5" />
                <path d="M12 17v1m0 -8v1" />
              </svg>
              <h1 className="text-xl font-bold text-slate-800 tracking-tight">Legal Demystifier</h1>
          </div>
          {user && (
            <div className="flex items-center space-x-5">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold">
                    {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="text-slate-600 font-medium text-sm hidden sm:block">Welcome, {user.name}</span>
              </div>
              <div className="flex items-center space-x-2">
                <button onClick={onNavigateToProfile} className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors">Profile</button>
                <button
                    onClick={onLogout}
                    className="px-4 py-2 bg-slate-200 text-slate-800 text-sm font-semibold rounded-lg hover:bg-slate-300/80 transition-colors"
                >
                    Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};