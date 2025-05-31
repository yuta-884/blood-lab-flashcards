import React, { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { ThemeContext } from './ThemeContext';

type Theme = 'light' | 'dark';

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // OS の設定とローカルストレージの設定を確認
  const getInitialTheme = (): Theme => {
    // ローカルストレージから設定を取得
    const storedTheme = localStorage.getItem('bl_theme') as Theme | null;
    
    // ローカルストレージに設定がある場合はそれを使用
    if (storedTheme) {
      return storedTheme;
    }
    
    // OS の設定を確認
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    return prefersDark ? 'dark' : 'light';
  };

  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  // テーマの切り替え
  const toggleTheme = () => {
    setTheme(prevTheme => {
      const newTheme = prevTheme === 'light' ? 'dark' : 'light';
      localStorage.setItem('bl_theme', newTheme);
      return newTheme;
    });
  };

  // テーマが変更されたときに HTML 要素と body 要素に dark クラスを追加/削除
  useEffect(() => {
    // ダークモードの切り替え
    document.documentElement.classList.toggle('dark', theme === 'dark');
    document.body.classList.toggle('dark', theme === 'dark');
    
    // トランジションのためのクラスを追加
    document.documentElement.classList.add('dark-transition');
    document.body.classList.add('dark-transition');
    
    // 強制的にスタイルを再計算させるためのトリック
    // ブラウザにリフローを強制するために void 式を使用
    void document.body.offsetHeight;
  }, [theme]);

  // OS のテーマ設定が変更されたときに自動的に更新（ローカルストレージに設定がない場合のみ）
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = () => {
      // ローカルストレージに設定がない場合のみ OS の設定に従う
      if (!localStorage.getItem('bl_theme')) {
        setTheme(mediaQuery.matches ? 'dark' : 'light');
      }
    };

    // イベントリスナーを追加
    mediaQuery.addEventListener('change', handleChange);
    
    // クリーンアップ
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
