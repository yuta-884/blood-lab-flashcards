import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Papa from 'papaparse';
import { saveAs } from 'file-saver';
import type { Card } from '../types';
import { useLocalStorage } from '../hooks/useLocalStorage';
import Header from './Header';

// PapaParseの結果の型定義
interface PapaParseResult {
  data: Record<string, string>[];
  errors: Papa.ParseError[];
  meta: Papa.ParseMeta;
}

const DeckEditor: React.FC = () => {
  const [deck, setDeck] = useState<Card[]>([]);
  const [selectedDeck, setSelectedDeck] = useLocalStorage<string>('selectedDeck', 'sample');
  const [customDeck, setCustomDeck] = useLocalStorage<Card[]>('customDeck', []);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [showToast, setShowToast] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const csvTextAreaRef = useRef<HTMLTextAreaElement>(null);
  const navigate = useNavigate();

  // サンプルデッキをロード
  useEffect(() => {
    const loadSampleDeck = async () => {
      try {
        const response = await fetch('./decks/sample.json');
        const data = await response.json();
        // カスタムデッキが選択されている場合はそれを使用
        if (selectedDeck === 'custom' && customDeck.length > 0) {
          setDeck(customDeck);
        } else {
          // そうでなければサンプルデッキを使用
          setDeck(Array.isArray(data) ? data : [data]);
        }
      } catch (error) {
        console.error('Error loading deck:', error);
        setDeck([]);
      }
    };

    loadSampleDeck();
  }, [customDeck, selectedDeck]);

  // バリデーション
  const validateDeck = (cards: Card[]): boolean => {
    const newErrors: Record<string, string[]> = {};
    const ids = new Set<string>();

    cards.forEach((card, index) => {
      const cardErrors: string[] = [];

      // 必須フィールドのチェック
      if (!card.id) cardErrors.push('ID is required');
      if (!card.front) cardErrors.push('Front is required');
      if (!card.back || card.back.length === 0) cardErrors.push('Back is required');
      if (!card.category) cardErrors.push('Category is required');

      // ID の一意性チェック
      if (card.id && ids.has(card.id)) {
        cardErrors.push('ID must be unique');
      } else if (card.id) {
        ids.add(card.id);
      }

      if (cardErrors.length > 0) {
        newErrors[index] = cardErrors;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // CSV ファイルをアップロード
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (result: PapaParseResult) => {
        const parsedCards = result.data.map((row: Record<string, string>) => ({
          id: row.id || '',
          front: row.front || '',
          back: row.back ? row.back.split(';').map((item: string) => item.trim()) : [],
          category: row.category || '',
        }));
        setDeck(parsedCards);
        validateDeck(parsedCards);
      },
      error: (error: Error) => {
        console.error('Error parsing CSV:', error);
      }
    });
  };

  // CSV テキストを解析
  const handleCsvTextParse = () => {
    const csvText = csvTextAreaRef.current?.value;
    if (!csvText) return;

    Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
      complete: (result: PapaParseResult) => {
        const parsedCards = result.data.map((row: Record<string, string>) => ({
          id: row.id || '',
          front: row.front || '',
          back: row.back ? row.back.split(';').map((item: string) => item.trim()) : [],
          category: row.category || '',
        }));
        setDeck(parsedCards);
        validateDeck(parsedCards);
      },
      error: (error: Error) => {
        console.error('Error parsing CSV text:', error);
      }
    });
  };

  // デッキをローカルに保存
  const saveLocalDeck = () => {
    if (!validateDeck(deck)) {
      alert('Please fix validation errors before saving');
      return;
    }

    setCustomDeck(deck);
    setSelectedDeck('custom');
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  // 現在のデッキを使用して学習画面に戻る
  const useCurrentDeck = () => {
    if (!validateDeck(deck)) {
      alert('Please fix validation errors before using this deck');
      return;
    }

    setCustomDeck(deck);
    setSelectedDeck('custom');
    navigate('/');
  };

  // JSON としてダウンロード
  const downloadJson = () => {
    if (!validateDeck(deck)) {
      alert('Please fix validation errors before downloading');
      return;
    }

    const blob = new Blob([JSON.stringify(deck, null, 2)], { type: 'application/json' });
    saveAs(blob, 'custom_deck.json');
  };

  // デフォルトデッキにリセット
  const resetToDefault = () => {
    if (window.confirm('Are you sure you want to reset to the default deck? Your custom deck will be deleted.')) {
      setSelectedDeck('sample');
      setCustomDeck([]);
      localStorage.removeItem('customDeck');
      navigate('/');
    }
  };

  // 新しいカードを追加
  const addCard = () => {
    const newCard: Card = {
      id: `card-${Date.now()}`,
      front: '',
      back: [''],
      category: '',
    };
    setDeck([...deck, newCard]);
  };

  // カードを削除
  const removeCard = (index: number) => {
    const newDeck = [...deck];
    newDeck.splice(index, 1);
    setDeck(newDeck);
  };

  // カードフィールドを更新
  const updateCardField = (index: number, field: keyof Card, value: string | string[]) => {
    const newDeck = [...deck];
    if (field === 'back' && typeof value === 'string') {
      newDeck[index][field] = value.split(';').map(item => item.trim());
    } else if (typeof value === 'string') {
      (newDeck[index][field] as string) = value;
    }
    setDeck(newDeck);
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-50 dark:bg-gray-900 p-4 transition-colors duration-300">
      {/* ヘッダー */}
      <Header />
      
      <div className="container mx-auto p-4 max-w-6xl w-full">
      <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Deck Editor</h2>
      
      {/* CSV アップロード */}
      <div className="mb-6 bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Import Cards</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block mb-2 text-gray-700 dark:text-gray-300">Upload CSV File</label>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              ref={fileInputRef}
              className="block w-full text-sm text-gray-900 dark:text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-gray-700 dark:file:text-gray-200"
            />
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              CSV format: id,front,back,category (back can be semicolon-separated for multiple lines)
            </p>
          </div>
          <div>
            <label className="block mb-2 text-gray-700 dark:text-gray-300">Or Paste CSV Content</label>
            <textarea
              ref={csvTextAreaRef}
              className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600"
              rows={5}
              placeholder="id,front,back,category"
            ></textarea>
            <button
              onClick={handleCsvTextParse}
              className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              Parse CSV
            </button>
          </div>
        </div>
      </div>
      
      {/* カード編集テーブル */}
      <div className="mb-6 overflow-x-auto bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
        <div className="flex justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Edit Cards</h3>
          <button
            onClick={addCard}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
          >
            Add Card
          </button>
        </div>
        
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-700">
              <th className="p-2 text-left text-gray-900 dark:text-white border dark:border-gray-600">ID</th>
              <th className="p-2 text-left text-gray-900 dark:text-white border dark:border-gray-600">Front</th>
              <th className="p-2 text-left text-gray-900 dark:text-white border dark:border-gray-600">Back (semicolon-separated)</th>
              <th className="p-2 text-left text-gray-900 dark:text-white border dark:border-gray-600">Category</th>
              <th className="p-2 text-left text-gray-900 dark:text-white border dark:border-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {deck.map((card, index) => (
              <tr key={index} className="border-b dark:border-gray-600">
                <td className={`p-2 border dark:border-gray-600 ${errors[index]?.includes('ID is required') || errors[index]?.includes('ID must be unique') ? 'bg-red-200 dark:bg-red-900' : ''}`}>
                  <input
                    type="text"
                    value={card.id}
                    onChange={(e) => updateCardField(index, 'id', e.target.value)}
                    className="w-full p-1 dark:bg-gray-700 dark:text-white"
                  />
                </td>
                <td className={`p-2 border dark:border-gray-600 ${errors[index]?.includes('Front is required') ? 'bg-red-200 dark:bg-red-900' : ''}`}>
                  <input
                    type="text"
                    value={card.front}
                    onChange={(e) => updateCardField(index, 'front', e.target.value)}
                    className="w-full p-1 dark:bg-gray-700 dark:text-white"
                  />
                </td>
                <td className={`p-2 border dark:border-gray-600 ${errors[index]?.includes('Back is required') ? 'bg-red-200 dark:bg-red-900' : ''}`}>
                  <textarea
                    value={card.back.join('; ')}
                    onChange={(e) => updateCardField(index, 'back', e.target.value)}
                    className="w-full p-1 dark:bg-gray-700 dark:text-white"
                    rows={2}
                  />
                </td>
                <td className={`p-2 border dark:border-gray-600 ${errors[index]?.includes('Category is required') ? 'bg-red-200 dark:bg-red-900' : ''}`}>
                  <input
                    type="text"
                    value={card.category}
                    onChange={(e) => updateCardField(index, 'category', e.target.value)}
                    className="w-full p-1 dark:bg-gray-700 dark:text-white"
                  />
                </td>
                <td className="p-2 border dark:border-gray-600">
                  <button
                    onClick={() => removeCard(index)}
                    className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {deck.length === 0 && (
          <p className="text-center py-4 text-gray-500 dark:text-gray-400">No cards in deck. Upload a CSV or add cards manually.</p>
        )}
      </div>
      
      {/* 操作ボタン */}
      <div className="flex flex-wrap gap-2 justify-center">
        <button
          onClick={saveLocalDeck}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          disabled={Object.keys(errors).length > 0}
        >
          Save Locally
        </button>
        <button
          onClick={useCurrentDeck}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
          disabled={Object.keys(errors).length > 0}
        >
          Use Now
        </button>
        <button
          onClick={downloadJson}
          className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors"
          disabled={Object.keys(errors).length > 0}
        >
          Download JSON
        </button>
        <button
          onClick={resetToDefault}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
        >
          Reset to Default
        </button>
      </div>
      
      {/* トースト通知 */}
      {showToast && (
        <div className="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg">
          Deck saved!
        </div>
      )}
      </div>
    </div>
  );
};

export default DeckEditor;
