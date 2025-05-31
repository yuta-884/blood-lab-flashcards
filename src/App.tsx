import { useState, useEffect, useMemo, useCallback } from 'react'
import { HashRouter as Router, Routes, Route } from 'react-router-dom'
import './App.css'
import type { Card, ProgressMap } from './types'
import CardComponent from './components/Card'
import { useLocalStorage } from './hooks/useLocalStorage'
import { updateProgress, getDueCards, getBoxCounts } from './utils/progressUtils'
import { formatDate } from './utils/dateUtils'
import Filters from './components/Filters'
import Dashboard from './components/Dashboard'
import Header from './components/Header'
import DeckEditor from './components/DeckEditor'
import { ThemeProvider } from './contexts/ThemeProvider'
import { useSound } from './hooks/useSound'

function App() {
  // サウンド機能を使用
  const { play } = useSound();
  
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
  // カテゴリフィルター
  const [selectedCategory, setSelectedCategory] = useLocalStorage<string>('bl_selectedCategory', 'all');
  // キーワード検索
  const [searchTerm, setSearchTerm] = useLocalStorage<string>('bl_searchTerm', '');
  // 今日の正答率統計
  const [todayCorrect, setTodayCorrect] = useState(0);
  const [todayAgain, setTodayAgain] = useState(0);
  // 選択されているデッキ（サンプルまたはカスタム）
  // @ts-expect-error - 他のコンポーネントで使用されるため必要
  const [selectedDeck, setSelectedDeck] = useLocalStorage<string>('selectedDeck', 'sample');
  // カスタムデッキのデータ
  // @ts-expect-error - 他のコンポーネントで使用されるため必要
  const [customDeck, setCustomDeck] = useLocalStorage<Card[]>('customDeck', []);

  // カードをめくる - useCallbackでメモ化してパフォーマンスを改善
  const handleCardFlip = useCallback(() => {
    setIsFlipped(true);
  }, []);

  // カードの読み込み関数をメモ化
  const loadCardsCallback = useCallback(() => {
    setIsLoading(true);
    
    // 選択されたデッキに基づいてカードをロード
    const loadCards = async () => {
      try {
        let cardArray: Card[] = [];
        
        if (selectedDeck === 'custom' && customDeck.length > 0) {
          // カスタムデッキが選択されている場合
          cardArray = customDeck;
        } else {
          // サンプルデッキをロード
          const response = await fetch('./decks/sample.json');
          const data = await response.json();
          cardArray = Array.isArray(data) ? data : [data];
        }
        
        setAllCards(cardArray);
        
        // 今日学習すべきカードを抽出
        const due = getDueCards(cardArray, progress);
        // カードをシャッフル
        const shuffledDue = [...due].sort(() => Math.random() - 0.5);
        setDueCards(shuffledDue);
        
        setCurrentIndex(0);
        setIsFlipped(false);
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading cards:', error);
        setIsLoading(false);
      }
    };
    
    loadCards();
  }, [progress, selectedDeck, customDeck, setAllCards, setDueCards, setCurrentIndex, setIsFlipped, setIsLoading]);

  // 初回読み込み時にカードを取得
  useEffect(() => {
    // レンダリングのカクつきを防止するために少し遅らせてカードを読み込む
    const timer = setTimeout(() => {
      loadCardsCallback();
    }, 100);
    
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 利用可能なカテゴリを抽出
  const categories = useMemo(() => {
    const categorySet = new Set<string>();
    allCards.forEach(card => {
      if (card.category) {
        categorySet.add(card.category);
      }
    });
    return Array.from(categorySet);
  }, [allCards]);

  // フィルタリングされたカードを計算
  const filteredCards = useMemo(() => {
    return allCards.filter(card => {
      // カテゴリフィルター
      const categoryMatch = selectedCategory === 'all' || card.category === selectedCategory;
      
      // キーワード検索
      const searchLower = searchTerm.toLowerCase();
      const frontMatch = card.front.toLowerCase().includes(searchLower);
      const backMatch = card.back.some(line => line.toLowerCase().includes(searchLower));
      
      return categoryMatch && (searchTerm === '' || frontMatch || backMatch);
    });
  }, [allCards, selectedCategory, searchTerm]);

  // フィルタリングされた今日のカードを計算
  const filteredDueCards = useMemo(() => {
    const dueCardIds = new Set(dueCards.map(card => card.id));
    return filteredCards.filter(card => dueCardIds.has(card.id));
  }, [dueCards, filteredCards]);

  // カードの回答を処理 - useCallbackでメモ化してパフォーマンスを改善
  const handleAnswer = useCallback((correct: boolean) => {
    const currentCards = studyMode === 'due' ? filteredDueCards : filteredCards;
    const currentCard = currentCards[currentIndex];
    
    // 進捗情報を更新
    const newProgress = updateProgress(progress, currentCard.id, correct);
    setProgress(newProgress);
    
    // 今日の統計を更新
    if (correct) {
      setTodayCorrect(prev => prev + 1);
    } else {
      setTodayAgain(prev => prev + 1);
    }
    
    // 不正解の場合は同じカードを後で再度表示するためにキューに追加
    if (!correct && studyMode === 'due') {
      setDueCards(prev => {
        const updated = [...prev];
        const cardIndex = updated.findIndex(c => c.id === currentCard.id);
        if (cardIndex >= 0) {
          // 現在のカードを削除
          updated.splice(cardIndex, 1);
          // 最後に追加（少なくとも1枚のカードが間に入るようにする）
          if (updated.length > 1) {
            updated.push(currentCard);
          } else {
            // カードが1枚しかない場合は、そのまま次に進む
            updated.push(currentCard);
          }
        }
        return updated;
      });
    }
    
    // 次のカードへ
    const cards = studyMode === 'due' ? filteredDueCards : filteredCards;
    if (currentIndex >= cards.length - 1) {
      // 学習完了時に win サウンドを再生
      play('win');
      // カードの最後に達した場合は最初に戻る
      setCurrentIndex(0);
    } else {
      // 次のカードへ
      setCurrentIndex(prevIndex => prevIndex + 1);
    }
    setIsFlipped(false);
  }, [currentIndex, filteredCards, filteredDueCards, progress, setProgress, setTodayAgain, setTodayCorrect, studyMode, setDueCards, setCurrentIndex, setIsFlipped, play]);

  // 全カードを学習するモードに切り替え
  const handleStudyAll = useCallback(() => {
    setStudyMode('all');
    // カードをシャッフル
    const shuffled = [...filteredCards].sort(() => Math.random() - 0.5);
    setDueCards(shuffled);
    setCurrentIndex(0);
    setIsFlipped(false);
  }, [filteredCards, setDueCards, setCurrentIndex, setIsFlipped, setStudyMode]);

  // 今日学習すべきカードのみを学習するモードに戻す
  const handleStudyDue = useCallback(() => {
    setStudyMode('due');
    loadCardsCallback();
  }, [loadCardsCallback, setStudyMode]);

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  // 現在のカードセットを取得
  const currentCards = studyMode === 'due' ? filteredDueCards : filteredCards;
  
  // カードがない場合
  if (currentCards.length === 0) {
    return (
      <div className="flex flex-col items-center min-h-screen bg-gray-50 dark:bg-gray-900 p-4 transition-colors duration-300">
        {/* ヘッダー */}
        <Header />
        
        <div className="w-full max-w-4xl mb-4 flex-shrink-0 mt-4">
          <details className="bg-white rounded-lg shadow-md overflow-hidden mb-2">
            <summary className="px-4 py-2 bg-blue-500 text-white cursor-pointer">
              フィルターと検索
            </summary>
            <div className="p-2">
              <Filters
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                categories={categories}
              />
            </div>
          </details>
          
          <Dashboard
            cards={allCards}
            filteredCards={filteredCards}
            progress={progress}
            todayCorrect={todayCorrect}
            todayAgain={todayAgain}
          />
        </div>
        
        <div className="flex-grow flex flex-col items-center justify-center">
          <div className="text-2xl font-bold mb-6 text-black">
            {filteredCards.length === 0 ? 
              '検索条件に一致するカードがありません' : 
              '今日学習すべきカードがありません'}
          </div>
          <div className="flex space-x-4">
            {filteredCards.length === 0 && (
              <button 
                onClick={() => {
                  setSelectedCategory('all');
                  setSearchTerm('');
                }}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600 transition-colors"
              >
                フィルターをリセット
              </button>
            )}
            <button 
              onClick={handleStudyAll}
              className="px-6 py-2 bg-green-500 text-white rounded-lg shadow hover:bg-green-600 transition-colors"
            >
              全カードを学習する
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 箱ごとのカード数を計算
  const [box1Count, box2Count, box3Count] = getBoxCounts(progress);
  
  // 今日の学習が完了した場合
  if (studyMode === 'due' && currentIndex >= filteredDueCards.length) {
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
  if (studyMode === 'all' && currentIndex >= filteredCards.length) {
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

  // カードコンポーネントをメモ化してパフォーマンスを改善
  // 常にレンダリングするように修正
  const cardComponent = currentCard ? (
    <CardComponent 
      card={currentCard} 
      onFlip={handleCardFlip} 
      isFlipped={isFlipped}
      onAnswer={handleAnswer}
      showAnswerButtons={isFlipped}
    />
  ) : null;

  const appContent = (
    <div className="flex flex-col items-center min-h-screen bg-gray-50 dark:bg-gray-900 p-4 transition-colors duration-300">
      {/* ヘッダー */}
      <Header />
      
      {/* 上部コントロール */}
      {/* 固定幅を持つ上部コントロールコンテナ */}
      <div className="w-full max-w-4xl mb-4 flex-shrink-0 mt-4">
        {/* フィルター部分 - カスタムデザインでレイアウト安定化 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden mb-4">
          <div 
            className="px-4 py-2 bg-blue-500 dark:bg-blue-600 text-white cursor-pointer flex items-center"
            onClick={() => {
              const filtersEl = document.getElementById('filters-content');
              if (filtersEl) {
                const isVisible = filtersEl.style.maxHeight !== '0px';
                filtersEl.style.maxHeight = isVisible ? '0px' : '500px';
                filtersEl.style.opacity = isVisible ? '0' : '1';
              }
            }}
          >
            <span>フィルターと検索</span>
            <span className="ml-auto">▼</span>
          </div>
          <div 
            id="filters-content"
            className="overflow-hidden transition-all duration-300 ease-in-out"
            style={{ maxHeight: '0px', opacity: 0 }}
          >
            <div className="p-4">
              <Filters
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                categories={categories}
              />
            </div>
          </div>
        </div>
        
        {/* パフォーマンス改善のために遅延ロード */}
        <div className="w-full">
          {!isLoading && (
            <Dashboard
              cards={allCards}
              filteredCards={filteredCards}
              progress={progress}
              todayCorrect={todayCorrect}
              todayAgain={todayAgain}
            />
          )}
        </div>
      </div>
      
      {/* カード表示エリア - メインコンテンツ */}
      <div className="flex-grow flex flex-col items-center justify-center w-full max-w-xl min-h-[400px]">
        {/* 見出し部分は常に表示 */}
        <div className="mb-2 text-lg font-bold text-gray-900 dark:text-gray-100">
          {studyMode === 'due' ? 
            `Today: ${filteredDueCards.length > 0 ? currentIndex + 1 : 0} / ${filteredDueCards.length} cards due` : 
            `Card: ${filteredCards.length > 0 ? currentIndex + 1 : 0} / ${filteredCards.length}`
          }
        </div>
        
        {studyMode === 'due' && (
          <div className="mb-6 text-sm text-gray-600 dark:text-gray-400">
            全体の進捗: {totalDueCards} / {allCards.length} 枚
          </div>
        )}
        
        {/* カードがある場合はカードを表示、ない場合はメッセージを表示 */}
        {(currentCards.length > 0 && currentIndex < currentCards.length) ? (
          cardComponent
        ) : (
          <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-lg shadow-md mt-4">
            <p className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">該当するカードが見つかりません</p>
            <p className="text-gray-600 dark:text-gray-400">検索条件を変更するか、フィルターをリセットしてください</p>
            <button 
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
              }}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              フィルターをリセット
            </button>
          </div>
        )}
      </div>
    </div>
  );
  
  // ThemeProvider でアプリ全体をラップし、Router を追加
  return (
    <ThemeProvider>
      <Router>
        <Routes>
          <Route path="/" element={appContent} />
          <Route path="/editor" element={<DeckEditor />} />
        </Routes>
      </Router>
    </ThemeProvider>
  )
}

export default App
