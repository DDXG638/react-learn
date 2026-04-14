import Link from 'next/link';
import { getProducts } from '@/types';
import { Navbar } from '@/components/Navbar';

export const dynamic = 'force-static';

export default function HomePage() {
  const products = getProducts();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <section className="text-center mb-16">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 via-blue-500 to-purple-600 bg-clip-text text-transparent mb-4">
            全栈电商演示
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            融合 React 状态管理 + Next.js API Routes + React Query
          </p>
        </section>

        {/* 技术栈说明 */}
        <section className="mb-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              title: 'Zustand',
              desc: '轻量级状态管理，持久化购物车',
              icon: '🔄',
            },
            {
              title: 'React Query',
              desc: '服务端状态管理，缓存 API 请求',
              icon: '📡',
            },
            {
              title: 'Next.js API',
              desc: '服务端 API 路由，处理业务逻辑',
              icon: '⚡',
            },
          ].map((tech) => (
            <div
              key={tech.title}
              className="p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700"
            >
              <div className="text-4xl mb-3">{tech.icon}</div>
              <h3 className="font-semibold text-lg mb-1">{tech.title}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{tech.desc}</p>
            </div>
          ))}
        </section>

        {/* 商品列表 */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">精选商品</h2>
            <Link
              href="/products"
              className="text-purple-600 hover:text-purple-700 font-medium"
            >
              查看全部 →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.slice(0, 3).map((product) => (
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
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold group-hover:text-purple-600 transition-colors">
                    {product.name}
                  </h3>
                  <p className="mt-1 text-xl font-bold text-purple-600">
                    ¥{(product.price / 100).toFixed(2)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
