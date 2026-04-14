'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { getProducts, categories } from '@/types';
import { QueryProvider } from '@/components/QueryProvider';

function ProductsContent() {
  const [selectedCategory, setSelectedCategory] = useState<string>('全部');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products', selectedCategory],
    queryFn: async () => {
      const res = await fetch(
        selectedCategory === '全部'
          ? '/api/products'
          : `/api/products?category=${selectedCategory}`
      );
      return res.json();
    },
  });

  const filteredProducts = searchQuery
    ? products.filter((p: any) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : products;

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">商品列表</h1>
        <p className="text-gray-600 dark:text-gray-400">
          展示 React Query 数据获取和缓存
        </p>
      </div>

      {/* 搜索和筛选 */}
      <div className="mb-8 flex flex-col sm:flex-row gap-4">
        <input
          type="text"
          placeholder="搜索商品..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
        />
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory('全部')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              selectedCategory === '全部'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            全部
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === cat
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* 商品列表 */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-80 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product: any) => (
            <Link
              key={product.id}
              href={`/products/${product.id}`}
              className="group bg-white dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 transition-all hover:shadow-lg hover:-translate-y-1"
            >
              <div className="relative aspect-square overflow-hidden">
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute top-3 right-3">
                  <span className="px-2 py-1 text-xs font-medium bg-purple-600 text-white rounded-full">
                    {product.category}
                  </span>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold group-hover:text-purple-600 transition-colors line-clamp-1">
                  {product.name}
                </h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                  {product.description}
                </p>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-xl font-bold text-purple-600">
                    ¥{(product.price / 100).toFixed(2)}
                  </span>
                  <span className="text-sm text-gray-500">
                    ★ {product.rating}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* 技术说明 */}
      <section className="mt-16 p-6 bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-200 dark:border-purple-800">
        <h2 className="text-lg font-semibold text-purple-700 dark:text-purple-400 mb-3">
          💡 React Query 数据获取
        </h2>
        <ul className="space-y-2 text-sm text-purple-600 dark:text-purple-300">
          <li>• 使用 <code className="px-1 bg-purple-100 dark:bg-purple-800 rounded">useQuery</code> 获取商品列表</li>
          <li>• 自动缓存请求结果，切换分类时复用数据</li>
          <li>• 支持加载状态、错误状态处理</li>
          <li>• 60 秒 staleTime，缓存在后台自动更新</li>
        </ul>
      </section>
    </main>
  );
}

export default function ProductsPage() {
  return (
    <QueryProvider>
      <ProductsContent />
    </QueryProvider>
  );
}
