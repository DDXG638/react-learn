// 任务类型定义
export interface Todo {
  id: string;
  title: string;
  completed: boolean;
  createdAt: number;
}

// 筛选类型
export type FilterType = 'all' | 'active' | 'completed';
