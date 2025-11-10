
import React from 'react';
import MoonIcon from './icons/MoonIcon';
import SunIcon from './icons/SunIcon';

interface HeaderProps {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const Header: React.FC<HeaderProps> = ({ theme, toggleTheme }) => {
  return (
    <header className="bg-white dark:bg-slate-800 shadow-md relative">
      <div className="container mx-auto px-4 md:px-8 py-4">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">
          Nayana's Path to <span className="text-blue-600">AIR 1</span> 2026
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Your AI-Powered Path to Success</p>
      </div>
      <button 
        onClick={toggleTheme} 
        className="absolute top-1/2 right-4 md:right-8 -translate-y-1/2 p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
        aria-label="Toggle theme"
      >
          {theme === 'light' ? <MoonIcon className="h-6 w-6" /> : <SunIcon className="h-6 w-6" />}
      </button>
    </header>
  );
};

export default Header;