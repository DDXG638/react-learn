import { Suspense } from 'react';
import { getProducts, categories } from '@/types';
import { ProductGrid } from '@/components/ProductCard';

// SSR: 每次请求实时获取数据
export const dynamic = 'force-dynamic';

interface Props {
  searchParams: Promise<{ category?: string }>;
}

export default async function ProductsPage({ searchParams }: Props) {
  const params = await searchParams;
  const selectedCategory = params.category || '全部';

  // 服务端数据获取
  const allProducts = await getProducts();
  const products = selectedCategory === '全部'
    ? allProducts
    : allProducts.filter(p => p.category === selectedCategory);

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">商品列表</h1>
        <p className="text-gray-600 dark:text-gray-400">
          展示 SSR（服务端渲染）：每次请求实时获取最新数据
        </p>
      </div>

      {/* 分类筛选 - 客户端交互 */}
      <div className="mb-8">
        <div className="flex flex-wrap gap-2">
          <a
            href="/products"
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              selectedCategory === '全部'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            全部
          </a>
          {categories.map(cat => (
            <a
              key={cat}
              href={`/products?category=${cat}`}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === cat
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {cat}
            </a>
          ))}
        </div>
        <p className="mt-3 text-sm text-gray-500">
          当前筛选：<span className="font-medium">{selectedCategory}</span>，
          共 <span className="font-medium">{products.length}</span> 件商品
        </p>
      </div>

      {/* 产品列表 */}
      <Suspense fallback={<div className="text-center py-12">加载中...</div>}>
        {products.length > 0 ? (
          <ProductGrid products={products} />
        ) : (
          <div className="text-center py-12 text-gray-500">
            暂无商品
          </div>
        )}
      </Suspense>

      {/* 渲染模式说明 */}
      <section className="mt-16 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
        <h2 className="text-lg font-semibold text-blue-700 dark:text-blue-400 mb-3">
          💡 SSR 服务端渲染
        </h2>
        <ul className="space-y-2 text-sm text-blue-600 dark:text-blue-300">
          <li>• 使用 <code className="px-1 bg-blue-100 dark:bg-blue-800 rounded">export const dynamic = 'force-dynamic'</code> 强制 SSR</li>
          <li>• 每次页面请求时，服务端会执行数据获取函数</li>
          <li>• 搜索结果、排序等功能可以直接在服务端处理</li>
          <li>• 适用于数据频繁变化的场景（如库存、价格）</li>
        </ul>
      </section>
    </main>
  );
}
