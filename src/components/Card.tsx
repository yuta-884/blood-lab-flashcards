// Card component for displaying flashcards
import type { Card as CardType } from '../types';

interface CardProps {
  card: CardType;
  onFlip: () => void;
  isFlipped: boolean;
}

export default function Card({ card, onFlip, isFlipped }: CardProps) {
  const handleClick = () => {
    if (!isFlipped) {
      onFlip();
    }
  };

  return (
    <div 
      onClick={handleClick}
      className={`w-96 h-64 bg-white rounded-lg shadow-lg border-2 border-gray-300 
                 flex items-center justify-center p-6 transition-all duration-300 hover:shadow-xl
                 ${isFlipped ? 'cursor-default' : 'cursor-pointer'}`}
    >
      <div className="text-center text-black">
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
  );
}
