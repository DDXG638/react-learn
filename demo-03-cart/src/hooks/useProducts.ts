import { useState, useEffect } from 'react';
import type { Product } from '../types';

// 模拟商品数据
const mockProducts: Product[] = [
  { id: '1', name: 'iPhone 15 Pro', price: 8999, category: '手机', image: '📱' },
  { id: '2', name: 'MacBook Pro', price: 15999, category: '电脑', image: '💻' },
  { id: '3', name: 'AirPods Pro', price: 1899, category: '配件', image: '🎧' },
  { id: '4', name: 'iPad Air', price: 4799, category: '平板', image: '📲' },
  { id: '5', name: 'Apple Watch', price: 2999, category: '手表', image: '⌚' },
  { id: '6', name: '机械键盘', price: 599, category: '配件', image: '⌨️' },
  { id: '7', name: '游戏鼠标', price: 399, category: '配件', image: '🖱️' },
  { id: '8', name: '4K 显示器', price: 2499, category: '显示器', image: '🖥️' },
  { id: '9', name: '固态硬盘 1TB', price: 699, category: '存储', image: '💾' },
  { id: '10', name: '无线充电器', price: 199, category: '配件', image: '🔌' },
];

/**
 * 商品数据 Hook
 * 模拟异步加载
 */
export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 模拟异步加载
    const timer = setTimeout(() => {
      setProducts(mockProducts);
      setLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  const searchProducts = (query: string): Product[] => {
    if (!query.trim()) return products;
    const lowerQuery = query.toLowerCase();
    return products.filter(
      p =>
        p.name.toLowerCase().includes(lowerQuery) ||
        p.category.toLowerCase().includes(lowerQuery)
    );
  };

  const getProductsByCategory = (category: string): Product[] => {
    if (!category || category === '全部') return products;
    return products.filter(p => p.category === category);
  };

  const categories = ['全部', ...new Set(products.map(p => p.category))];

  return {
    products,
    loading,
    searchProducts,
    getProductsByCategory,
    categories,
  };
}
