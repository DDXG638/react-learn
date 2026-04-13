'use client';

import { useState, useEffect } from 'react';
import { Product } from '@/types';

// CSR: 客户端渲染演示
export default function CSRPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 模拟客户端数据请求
    async function fetchData() {
      try {
        const res = await fetch('/api/products');
        if (!res.ok) throw new Error('获取数据失败');
        const data = await res.json();
        setProducts(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : '未知错误');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-64 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
            ))}
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="p-6 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
          <p className="text-red-600 dark:text-red-400">错误: {error}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">客户端渲染 (CSR)</h1>
        <p className="text-gray-600 dark:text-gray-400">
          展示 CSR（客户端渲染）：数据在浏览器中通过 JavaScript 获取
        </p>
      </div>

      <div className="mb-8 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl border border-orange-200 dark:border-orange-800">
        <h2 className="font-semibold text-orange-700 dark:text-orange-400 mb-2">
          💡 CSR vs SSR/SSG
        </h2>
        <ul className="space-y-1 text-sm text-orange-600 dark:text-orange-300">
          <li>• 此页面使用 <code className="px-1 bg-orange-100 dark:bg-orange-800 rounded">'use client'</code> 指令，强制客户端渲染</li>
          <li>• 页面 HTML 初始只有骨架，数据需要等 JS 加载完成后请求</li>
          <li>• 适用于需要用户登录态、实时数据、频繁交互的场景</li>
        </ul>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <a
            key={product.id}
            href={`/products/${product.id}`}
            className="group block bg-white dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 transition-all hover:shadow-lg hover:-translate-y-1"
          >
            <div className="relative aspect-square overflow-hidden">
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </div>
            <div className="p-4">
              <h3 className="font-semibold group-hover:text-purple-600 transition-colors">
                {product.name}
              </h3>
              <p className="mt-1 text-xl font-bold text-purple-600">
                ¥{product.price.toLocaleString()}
              </p>
            </div>
          </a>
        ))}
      </div>
    </main>
  );
}
