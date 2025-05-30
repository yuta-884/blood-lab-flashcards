import React, { useState } from 'react';
import type { Card } from '../types';
import type { ProgressMap } from '../types';
import { getBoxCounts } from '../utils/progressUtils';

interface DashboardProps {
  cards: Card[];
  filteredCards: Card[];
  progress: ProgressMap;
  todayCorrect: number;
  todayAgain: number;
}

/**
 * 進捗ダッシュボードコンポーネント
 */
const Dashboard: React.FC<DashboardProps> = ({
  cards,
  filteredCards,
  progress,
  todayCorrect,
  todayAgain
}) => {
  // 初期状態では閉じておき、パフォーマンスを改善
  const [isOpen, setIsOpen] = useState(false);
  
  // フィルタリングされたカードの箱別統計
  const filteredProgress: ProgressMap = {};
  filteredCards.forEach(card => {
    if (progress[card.id]) {
      filteredProgress[card.id] = progress[card.id];
    }
  });
  const [filteredBox1Count, filteredBox2Count, filteredBox3Count] = getBoxCounts(filteredProgress);
  
  // 正答率を計算
  const total = todayCorrect + todayAgain;
  const correctRate = total > 0 ? Math.round((todayCorrect / total) * 100) : 0;

  // ダッシュボードのコンテンツをレンダリングする関数
  const renderDashboardContent = () => (
    <div className="p-4 text-black">
      <div className="flex flex-col md:flex-row md:space-x-4">
        <div className="w-full md:w-1/2 mb-4 md:mb-0">
          <h3 className="text-lg font-medium mb-2">箱別カード数</h3>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="bg-red-100 p-3 rounded-lg text-center">
              <div className="text-xl font-bold text-red-600">{filteredBox1Count}</div>
              <div className="text-sm">Box 1</div>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg text-center">
              <div className="text-xl font-bold text-blue-600">{filteredBox2Count}</div>
              <div className="text-sm">Box 2</div>
            </div>
            <div className="bg-green-100 p-3 rounded-lg text-center">
              <div className="text-xl font-bold text-green-600">{filteredBox3Count}</div>
              <div className="text-sm">Box 3</div>
            </div>
          </div>
          <div className="mt-2 text-sm text-gray-600">
            {filteredCards.length === cards.length 
              ? '全カード表示中' 
              : `${filteredCards.length} / ${cards.length} カードを表示中`}
          </div>
        </div>
        
        <div className="w-full md:w-1/2">
          <h3 className="text-lg font-medium mb-2">今日の正答率</h3>
          <div className="bg-gray-100 p-4 rounded-lg text-center">
            <div className="text-3xl font-bold mb-2">{correctRate}%</div>
            <div className="flex justify-center space-x-4">
              <div>
                <span className="text-green-600 font-bold">{todayCorrect}</span> 正解
              </div>
              <div>
                <span className="text-red-600 font-bold">{todayAgain}</span> 復習
              </div>
            </div>
            <div className="mt-2 text-sm text-gray-600">
              今日の回答: {total} 回
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-full mb-4">
      {/* 固定幅と高さを持つコンテナ */}
      <div className="w-full">
        {/* コンテンツの表示/非表示を制御するカスタム設計 */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* ヘッダー部分 - 常に表示 */}
          <div 
            className="px-4 py-3 bg-blue-500 text-white cursor-pointer flex items-center"
            onClick={() => setIsOpen(!isOpen)}
          >
            <span className="text-lg font-medium">📊 Progress</span>
            <span className="ml-auto">{isOpen ? '▲' : '▼'}</span>
          </div>
          
          {/* コンテンツ部分 - 常に同じ高さと幅を確保 */}
          <div 
            className="overflow-hidden transition-all duration-300 ease-in-out"
            style={{
              maxHeight: isOpen ? '1000px' : '0',
              opacity: isOpen ? 1 : 0
            }}
          >
            {renderDashboardContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
