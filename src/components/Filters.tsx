import React from 'react';

interface FiltersProps {
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  categories: string[];
}

/**
 * カテゴリフィルタとキーワード検索を提供するコンポーネント
 */
const Filters: React.FC<FiltersProps> = ({
  selectedCategory,
  setSelectedCategory,
  searchTerm,
  setSearchTerm,
  categories
}) => {
  return (
    <div className="w-full p-4 bg-white rounded-lg text-black">
      <div className="flex flex-col md:flex-row md:items-end md:space-x-4">
        <div className="mb-2 md:mb-0 md:w-1/3">
          <label htmlFor="category-filter" className="block text-sm font-medium text-gray-700 mb-1">
            カテゴリ
          </label>
          <select
            id="category-filter"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white"
          >
            <option value="all">すべてのカテゴリ</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
        
        <div className="flex-1">
          <label htmlFor="search-filter" className="block text-sm font-medium text-gray-700 mb-1">
            キーワード検索
          </label>
          <div className="relative">
            <input
              id="search-filter"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="カードの表面や裏面のテキストを検索..."
              className="block w-full px-3 py-2 pl-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
      
      {(selectedCategory !== 'all' || searchTerm) && (
        <div className="mt-3 flex items-center text-sm text-gray-600">
          <span className="mr-2">フィルター適用中:</span>
          {selectedCategory !== 'all' && (
            <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full mr-2">
              {selectedCategory}
            </span>
          )}
          {searchTerm && (
            <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
              "{searchTerm}"
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default Filters;
