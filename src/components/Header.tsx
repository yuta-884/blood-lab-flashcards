import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../hooks/useTheme';

interface HeaderProps {
  title?: string;
  isEditor?: boolean;
}

const Header: React.FC<HeaderProps> = ({ title = 'Blood Lab Flashcards', isEditor = false }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="w-full bg-white dark:bg-gray-800 shadow-md py-4 px-6 flex justify-between items-center">
      <div className="flex items-center">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white mr-4">{title}</h1>
        
        {/* Deck Editor リンク */}
        <Link 
          to={isEditor ? '/' : '/editor'}
          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors flex items-center"
        >
          <span className="mr-1" role="img" aria-label="Editor">{isEditor ? '🔙' : '📝'}</span>
          {isEditor ? 'Back to Learn' : 'Deck Editor'}
        </Link>
      </div>
      
      <div className="flex items-center space-x-2">

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
      </div>
    </header>
  );
};

export default Header;
