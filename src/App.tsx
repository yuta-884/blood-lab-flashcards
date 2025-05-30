import { useState, useEffect } from 'react'
import './App.css'
import type { Card } from './types'

function App() {
  const [card, setCard] = useState<Card | null>(null);
  const [isFlipped, setIsFlipped] = useState(false);

  useEffect(() => {
    // Load the sample card from the JSON file
    fetch('./decks/sample.json')
      .then(response => response.json())
      .then(data => setCard(data))
      .catch(error => console.error('Error loading card:', error));
  }, []);

  const handleCardClick = () => {
    setIsFlipped(!isFlipped);
  };

  if (!card) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <div 
        onClick={handleCardClick}
        className="w-96 h-64 bg-white rounded-lg shadow-lg border-2 border-gray-300 cursor-pointer flex items-center justify-center p-6 transition-all duration-300 hover:shadow-xl"
      >
        {!isFlipped ? (
          <div className="text-center text-2xl font-bold">{card.front}</div>
        ) : (
          <div className="text-center">
            {card.back.map((line, index) => (
              <p key={index} className="mb-2">{line}</p>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default App
