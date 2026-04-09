import { useState, useEffect, useCallback } from 'react';
import type { Todo, FilterType } from '../types/todo';

// 生成唯一 ID
const generateId = () => Math.random().toString(36).substring(2, 9);

// 模拟初始数据
const mockTodos: Todo[] = [
  { id: generateId(), title: '学习 React useState', completed: true, createdAt: Date.now() - 86400000 },
  { id: generateId(), title: '理解 useEffect 依赖数组', completed: false, createdAt: Date.now() - 43200000 },
  { id: generateId(), title: '掌握 JSX 条件渲染', completed: false, createdAt: Date.now() },
];

/**
 * 任务管理 Hook
 * 封装任务列表的增删改查逻辑
 */
export function useTodos() {
  // 任务列表状态
  const [todos, setTodos] = useState<Todo[]>(mockTodos);
  // 筛选状态
  const [filter, setFilter] = useState<FilterType>('all');
  // loading 状态（模拟异步加载）
  const [isLoading, setIsLoading] = useState(true);

  // 模拟异步加载初始数据
  useEffect(() => {
    console.log('[useTodos] 组件挂载，模拟异步加载数据...');
    const timer = setTimeout(() => {
      setIsLoading(false);
      console.log('[useTodos] 数据加载完成');
    }, 500);

    // 清理函数：组件卸载时清除定时器
    return () => {
      console.log('[useTodos] 组件卸载，清理定时器');
      clearTimeout(timer);
    };
  }, []); // 依赖数组为空，只在挂载时执行一次

  // 打印 todos 变化（每次 todos 变化时执行）
  useEffect(() => {
    console.log('[useTodos] todos 状态变化:', todos.length, '个任务');
  }, [todos]); // 依赖数组传值，当 todos 变化时执行

  // 添加任务
  const addTodo = useCallback((title: string) => {
    if (!title.trim()) return;

    const newTodo: Todo = {
      id: generateId(),
      title: title.trim(),
      completed: false,
      createdAt: Date.now(),
    };

    // 函数式更新：基于前一个状态计算新状态
    setTodos(prev => [newTodo, ...prev]);
  }, []);

  // 切换任务完成状态
  const toggleTodo = useCallback((id: string) => {
    setTodos(prev =>
      prev.map(todo =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  }, []);

  // 删除任务
  const deleteTodo = useCallback((id: string) => {
    setTodos(prev => prev.filter(todo => todo.id !== id));
  }, []);

  // 编辑任务标题
  const editTodo = useCallback((id: string, newTitle: string) => {
    if (!newTitle.trim()) return;

    setTodos(prev =>
      prev.map(todo =>
        todo.id === id ? { ...todo, title: newTitle.trim() } : todo
      )
    );
  }, []);

  // 清除已完成任务
  const clearCompleted = useCallback(() => {
    setTodos(prev => prev.filter(todo => !todo.completed));
  }, []);

  // 根据筛选条件过滤任务
  const filteredTodos = todos.filter(todo => {
    if (filter === 'active') return !todo.completed;
    if (filter === 'completed') return todo.completed;
    return true; // 'all'
  });

  // 统计信息
  const stats = {
    total: todos.length,
    completed: todos.filter(t => t.completed).length,
    active: todos.filter(t => !t.completed).length,
  };

  return {
    todos: filteredTodos,
    filter,
    setFilter,
    isLoading,
    stats,
    addTodo,
    toggleTodo,
    deleteTodo,
    editTodo,
    clearCompleted,
  };
}
