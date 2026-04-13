export interface DataPoint {
  id: number;
  label: string;
  value: number;
  category: 'A' | 'B' | 'C';
  timestamp: number;
}

export interface ChartData {
  points: DataPoint[];
  maxValue: number;
  minValue: number;
}

// 模拟生成大量数据
export function generateMockData(count: number): DataPoint[] {
  const categories: ('A' | 'B' | 'C')[] = ['A', 'B', 'C'];
  const labels = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];

  return Array.from({ length: count }, (_, i) => ({
    id: i,
    label: labels[i % labels.length] + (Math.floor(i / labels.length) + 1),
    value: Math.floor(Math.random() * 1000) + 100,
    category: categories[i % categories.length],
    timestamp: Date.now() - (count - i) * 60000,
  }));
}

// 计算统计信息
export function calculateStats(points: DataPoint[]) {
  if (points.length === 0) return { max: 0, min: 0, avg: 0, total: 0 };

  const values = points.map(p => p.value);
  return {
    max: Math.max(...values),
    min: Math.min(...values),
    avg: values.reduce((a, b) => a + b, 0) / values.length,
    total: values.reduce((a, b) => a + b, 0),
  };
}