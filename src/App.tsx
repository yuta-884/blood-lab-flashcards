import { useState, useEffect } from 'react'
import './App.css'
import type { Card, ProgressMap } from './types'
import CardComponent from './components/Card'
import { useLocalStorage } from './hooks/useLocalStorage'
import { updateProgress, getDueCards, getBoxCounts } from './utils/progressUtils'
import { formatDate } from './utils/dateUtils'

function App() {
  // すべてのカードを保持する状態
  const [allCards, setAllCards] = useState<Card[]>([]);
  // 今日学習すべきカードを保持する状態
  const [dueCards, setDueCards] = useState<Card[]>([]);
  // 現在のカードインデックス
  const [currentIndex, setCurrentIndex] = useState(0);
  // カードが裏返されているかどうか
  const [isFlipped, setIsFlipped] = useState(false);
  // ローディング状態
  const [isLoading, setIsLoading] = useState(true);
  // 学習モード（通常 or 全カード）
  const [studyMode, setStudyMode] = useState<'due' | 'all'>('due');
  // localStorage から進捗情報を取得
  const [progress, setProgress] = useLocalStorage<ProgressMap>('bl_progress', {});

  // カードを読み込み、今日学習すべきカードを抽出する
  const loadCards = () => {
    setIsLoading(true);
    fetch('./decks/sample.json')
      .then(response => response.json())
      .then(data => {
        // 単一カードの場合は配列に変換
        const cardArray = Array.isArray(data) ? data : [data];
        setAllCards(cardArray);
        
        // 今日学習すべきカードを抽出
        const due = getDueCards(cardArray, progress);
        // カードをシャッフル
        const shuffledDue = [...due].sort(() => Math.random() - 0.5);
        setDueCards(shuffledDue);
        
        setCurrentIndex(0);
        setIsFlipped(false);
        setIsLoading(false);
      })
      .catch(error => {
        console.error('Error loading cards:', error);
        setIsLoading(false);
      });
  };

  // 初回読み込み時にカードを取得
  useEffect(() => {
    loadCards();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // カードをめくる
  const handleCardFlip = () => {
    setIsFlipped(true);
  };

  // カードの回答を処理
  const handleAnswer = (correct: boolean) => {
    const currentCards = studyMode === 'due' ? dueCards : allCards;
    const currentCard = currentCards[currentIndex];
    
    // 進捗情報を更新
    const newProgress = updateProgress(progress, currentCard.id, correct);
    setProgress(newProgress);
    
    // 不正解の場合は同じカードを後で再度表示するためにキューに追加
    if (!correct && studyMode === 'due') {
      setDueCards(prev => {
        const updated = [...prev];
        // 現在のカードを削除
        updated.splice(currentIndex, 1);
        // 最後に追加（少なくとも1枚のカードが間に入るようにする）
        if (updated.length > 1) {
          updated.push(currentCard);
        } else {
          // カードが1枚しかない場合は、そのまま次に進む
          updated.push(currentCard);
        }
        return updated;
      });
    }
    
    // 次のカードへ
    setCurrentIndex(prevIndex => prevIndex + 1);
    setIsFlipped(false);
  };

  // 全カードを学習するモードに切り替え
  const handleStudyAll = () => {
    setStudyMode('all');
    // カードをシャッフル
    const shuffled = [...allCards].sort(() => Math.random() - 0.5);
    setDueCards(shuffled);
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  // 今日学習すべきカードのみを学習するモードに戻す
  const handleStudyDue = () => {
    setStudyMode('due');
    loadCards();
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  // 現在のカードセットを取得
  const currentCards = studyMode === 'due' ? dueCards : allCards;
  
  // カードがない場合
  if (currentCards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-100 p-4">
        <div className="text-2xl font-bold mb-6 text-black">カードがありません</div>
        <button 
          onClick={loadCards}
          className="px-6 py-2 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600 transition-colors"
        >
          再読み込み
        </button>
      </div>
    );
  }

  // 箱ごとのカード数を計算
  const [box1Count, box2Count, box3Count] = getBoxCounts(progress);
  
  // 今日の学習が完了した場合
  if (studyMode === 'due' && currentIndex >= dueCards.length) {
    // 次回の学習日を計算（進捗情報から最も早い日付を取得）
    let nextDueDate = '';
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    
    Object.values(progress).forEach(p => {
      const reviewDate = new Date(p.next);
      if (reviewDate > now && (!nextDueDate || reviewDate < new Date(nextDueDate))) {
        nextDueDate = p.next;
      }
    });
    
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-100 p-4">
        <div className="text-2xl font-bold mb-4 text-black">🎉 今日の復習は完了！</div>
        
        {nextDueDate && (
          <div className="mb-6 text-lg text-black">
            次回の復習: {formatDate(nextDueDate)}
          </div>
        )}
        
        <button 
          onClick={handleStudyAll}
          className="px-6 py-2 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600 transition-colors mb-4"
        >
          Study anyway
        </button>
        
        <div className="mt-8 p-4 bg-white rounded-lg shadow-md w-80">
          <h3 className="font-bold text-lg mb-2 text-black">箱別統計</h3>
          <div className="flex justify-between text-black">
            <div>Box 1: <span className="font-bold">{box1Count}枚</span></div>
            <div>Box 2: <span className="font-bold">{box2Count}枚</span></div>
            <div>Box 3: <span className="font-bold">{box3Count}枚</span></div>
          </div>
        </div>
      </div>
    );
  }
  
  // 全カードモードで学習が完了した場合
  if (studyMode === 'all' && currentIndex >= allCards.length) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-100 p-4">
        <div className="text-2xl font-bold mb-6 text-black">デッキ完了！🎉</div>
        <button 
          onClick={handleStudyDue}
          className="px-6 py-2 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600 transition-colors mb-4"
        >
          今日の復習に戻る
        </button>
        
        <div className="mt-8 p-4 bg-white rounded-lg shadow-md w-80">
          <h3 className="font-bold text-lg mb-2 text-black">箱別統計</h3>
          <div className="flex justify-between text-black">
            <div>Box 1: <span className="font-bold">{box1Count}枚</span></div>
            <div>Box 2: <span className="font-bold">{box2Count}枚</span></div>
            <div>Box 3: <span className="font-bold">{box3Count}枚</span></div>
          </div>
        </div>
      </div>
    );
  }

  const currentCard = currentCards[currentIndex];
  const totalDueCards = getDueCards(allCards, progress).length;

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100 p-4">
      <div className="mb-2 text-lg font-bold text-black">
        {studyMode === 'due' ? `Today: ${currentIndex + 1} / ${dueCards.length} cards due` : `Card: ${currentIndex + 1} / ${allCards.length}`}
      </div>
      
      {studyMode === 'due' && (
        <div className="mb-6 text-sm text-gray-600">
          全体の進捗: {totalDueCards} / {allCards.length} 枚
        </div>
      )}
      
      <CardComponent 
        card={currentCard} 
        onFlip={handleCardFlip} 
        isFlipped={isFlipped}
        onAnswer={handleAnswer}
        showAnswerButtons={isFlipped}
      />
    </div>
  )
}

export default App
