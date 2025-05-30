import { useState, useEffect } from 'react'
import './App.css'
import type { Card } from './types'
import CardComponent from './components/Card'

function App() {
  const [cards, setCards] = useState<Card[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load and shuffle cards
  const loadAndShuffleCards = () => {
    setIsLoading(true);
    fetch('./decks/sample.json')
      .then(response => response.json())
      .then(data => {
        // Convert single card to array if needed
        const cardArray = Array.isArray(data) ? data : [data];
        // Shuffle the cards
        const shuffledCards = [...cardArray].sort(() => Math.random() - 0.5);
        setCards(shuffledCards);
        setCurrentIndex(0);
        setIsFlipped(false);
        setIsLoading(false);
      })
      .catch(error => {
        console.error('Error loading cards:', error);
        setIsLoading(false);
      });
  };

  useEffect(() => {
    loadAndShuffleCards();
  }, []);

  const handleCardFlip = () => {
    setIsFlipped(true);
  };

  const handleNextCard = () => {
    setCurrentIndex(prevIndex => prevIndex + 1);
    setIsFlipped(false);
  };

  const handleRestart = () => {
    loadAndShuffleCards();
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (cards.length === 0) {
    return <div className="flex justify-center items-center h-screen">No cards found.</div>;
  }

  const isLastCard = currentIndex >= cards.length - 1;
  const currentCard = cards[currentIndex];

  // If we've gone through all cards
  if (currentIndex >= cards.length) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-100 p-4">
        <div className="text-2xl font-bold mb-6">デッキ完了！🎉</div>
        <button 
          onClick={handleRestart}
          className="px-6 py-2 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600 transition-colors"
        >
          Restart
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100 p-4">
      <div className="mb-8 text-lg">
        {currentIndex + 1} / {cards.length}
      </div>
      
      <CardComponent 
        card={currentCard} 
        onFlip={handleCardFlip} 
        isFlipped={isFlipped} 
      />
      
      {isFlipped && (
        <button 
          onClick={isLastCard ? handleRestart : handleNextCard}
          className="mt-8 px-6 py-2 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600 transition-colors"
        >
          {isLastCard ? 'Restart' : 'Next ▶︎'}
        </button>
      )}
    </div>
  )
}

export default App
