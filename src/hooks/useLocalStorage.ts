import { useState, useEffect } from 'react';

/**
 * localStorage を使用するためのカスタムフック
 * @param key localStorage のキー
 * @param initialValue 初期値
 * @returns [値, 値を設定する関数]
 */
export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] {
  // localStorage から値を取得する関数
  const readValue = (): T => {
    // ブラウザ環境でない場合は初期値を返す
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      // localStorage から値を取得
      const item = window.localStorage.getItem(key);
      // 値が存在する場合はパースして返す、存在しない場合は初期値を返す
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  };

  // 状態を初期化
  const [storedValue, setStoredValue] = useState<T>(readValue);

  // 値を設定する関数
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      // 関数が渡された場合は関数を実行して値を取得
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      
      // 状態を更新
      setStoredValue(valueToStore);
      
      // ブラウザ環境の場合は localStorage に保存
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  };

  // マウント時に localStorage の値を読み込む
  useEffect(() => {
    setStoredValue(readValue());
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // localStorage の変更を監視
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === key && event.newValue) {
        setStoredValue(JSON.parse(event.newValue));
      }
    };

    // ストレージイベントのリスナーを追加
    window.addEventListener('storage', handleStorageChange);
    
    // クリーンアップ関数
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [key]);

  return [storedValue, setValue];
}
