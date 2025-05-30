import React from 'react';
import { useTheme } from '../hooks/useTheme';

interface HeaderProps {
  title?: string;
}

const Header: React.FC<HeaderProps> = ({ title = 'Blood Lab Flashcards' }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="w-full bg-white dark:bg-gray-800 shadow-md py-4 px-6 flex justify-between items-center">
      <h1 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h1>
      
      <button 
        onClick={toggleTheme}
        className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        {theme === 'dark' ? (
          <span className="text-xl" role="img" aria-label="Light mode">🌞</span>
        ) : (
          <span className="text-xl" role="img" aria-label="Dark mode">🌜</span>
        )}
      </button>
    </header>
  );
};

export default Header;
