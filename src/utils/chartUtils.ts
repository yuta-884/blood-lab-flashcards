/**
 * Chart.js を使用するためのユーティリティ関数
 */
import {
  Chart,
  BarController,
  CategoryScale,
  LinearScale,
  BarElement,
  DoughnutController,
  ArcElement,
  Tooltip,
  Legend,
  Title
} from 'chart.js';

// Chart.js のレジストレーション
// 必要なコンポーネントを登録
 Chart.register(
  BarController,
  CategoryScale,
  LinearScale,
  BarElement,
  DoughnutController,
  ArcElement,
  Tooltip,
  Legend,
  Title
);

/**
 * 箱別棒グラフを描画する
 * @param ctx キャンバス要素
 * @param data 箱ごとのカード数 [box1, box2, box3]
 */
export const renderBarChart = (ctx: HTMLCanvasElement, data: number[]): void => {
  // 既存のチャートがあれば破棄
  const existingChart = getExistingChart(ctx);
  if (existingChart) {
    existingChart.destroy();
  }

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Box 1', 'Box 2', 'Box 3'],
      datasets: [{
        label: 'カード数',
        data: data,
        backgroundColor: [
          'rgba(255, 99, 132, 0.7)',
          'rgba(54, 162, 235, 0.7)',
          'rgba(75, 192, 192, 0.7)'
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(75, 192, 192, 1)'
        ],
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            precision: 0
          }
        }
      }
    }
  })
};

/**
 * 正答率ドーナツチャートを描画する
 * @param ctx キャンバス要素
 * @param correct 正解数
 * @param again 復習数
 */
export const renderDonutChart = (ctx: HTMLCanvasElement, correct: number, again: number): void => {
  // 既存のチャートがあれば破棄
  const existingChart = getExistingChart(ctx);
  if (existingChart) {
    existingChart.destroy();
  }

  // 合計が0の場合は100%として表示
  const total = correct + again;
  const data = total === 0 ? [1, 0] : [correct, again];
  const labels = total === 0 ? ['データなし', ''] : ['正解', '復習'];

  new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: labels,
      datasets: [{
        data: data,
        backgroundColor: [
          'rgba(75, 192, 192, 0.7)',
          'rgba(255, 99, 132, 0.7)'
        ],
        borderColor: [
          'rgba(75, 192, 192, 1)',
          'rgba(255, 99, 132, 1)'
        ],
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: total === 0 ? 'データなし' : `正答率: ${Math.round((correct / total) * 100)}%`
        }
      }
    }
  });
};

/**
 * 既存のチャートを取得する
 * @param ctx キャンバス要素
 * @returns 既存のチャートインスタンス（存在しない場合はnull）
 */
const getExistingChart = (ctx: HTMLCanvasElement): Chart | null => {
  // Chart.js v3 では、Chart.getChart を使用して既存のチャートを取得する
  return Chart.getChart(ctx) || null;
};
