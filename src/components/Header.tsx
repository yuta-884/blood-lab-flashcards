import React from 'react';
import { useTheme } from '../hooks/useTheme';
import { useSound } from '../hooks/useSound';

interface HeaderProps {
  title?: string;
}

const Header: React.FC<HeaderProps> = ({ title = 'Blood Lab Flashcards' }) => {
  const { theme, toggleTheme } = useTheme();
  const { soundEnabled, toggleSound } = useSound();

  return (
    <header className="w-full bg-white dark:bg-gray-800 shadow-md py-4 px-6 flex justify-between items-center">
      <h1 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h1>
      
      <div className="flex items-center space-x-2">
        <button 
          onClick={toggleSound}
          className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          aria-label={soundEnabled ? 'Mute sound' : 'Enable sound'}
        >
          {soundEnabled ? (
            <span className="text-xl" role="img" aria-label="Sound on">🔊</span>
          ) : (
            <span className="text-xl" role="img" aria-label="Sound off">🔇</span>
          )}
        </button>

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
