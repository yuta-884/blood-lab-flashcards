// Card component for displaying flashcards
import type { Card as CardType } from '../types';

interface CardProps {
  card: CardType;
  onFlip: () => void;
  isFlipped: boolean;
  onAnswer?: (correct: boolean) => void;
  showAnswerButtons?: boolean;
}

export default function Card({ card, onFlip, isFlipped, onAnswer, showAnswerButtons = false }: CardProps) {
  const handleClick = () => {
    if (!isFlipped) {
      onFlip();
    }
  };

  const handleAnswer = (correct: boolean) => {
    if (onAnswer) {
      onAnswer(correct);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div 
        onClick={handleClick}
        className={`w-96 h-64 ${isFlipped ? 'card-back' : 'card-front'} rounded-lg shadow-lg border-2 border-gray-300 dark:border-gray-600 
                   flex items-center justify-center p-6 transition-all duration-300 hover:shadow-xl
                   ${isFlipped ? 'cursor-default' : 'cursor-pointer'}`}
      >
        <div className="text-center">
          {!isFlipped ? (
            <div className="text-2xl font-bold">{card.front}</div>
          ) : (
            <div>
              {card.back.map((line, index) => (
                <p key={index} className="mb-2">{line}</p>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {isFlipped && showAnswerButtons && onAnswer && (
        <div className="mt-4 flex space-x-4">
          <button 
            onClick={() => handleAnswer(false)}
            className="btn-secondary bg-red-500 dark:bg-red-600 text-white hover:bg-red-600 dark:hover:bg-red-700 transition-colors"
          >
            Again
          </button>
          <button 
            onClick={() => handleAnswer(true)}
            className="btn-secondary bg-green-500 dark:bg-green-600 text-white hover:bg-green-600 dark:hover:bg-green-700 transition-colors"
          >
            Correct
          </button>
        </div>
      )}
    </div>
  );
}
