import Link from 'next/link';
import { getProducts } from '@/types';

// SSG: 构建时生成静态页面
export const dynamic = 'force-static';

export default async function HomePage() {
  const products = await getProducts();

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Hero Section */}
      <section className="text-center mb-16">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 via-blue-500 to-purple-600 bg-clip-text text-transparent mb-4">
          Next.js 14 渲染模式演示
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          深入理解 SSR / SSG / ISR / CSR 四种渲染模式的核心差异
        </p>
      </section>

      {/* 渲染模式说明 */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold mb-8 text-center">四种渲染模式对比</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              mode: 'SSR',
              name: '服务端渲染',
              desc: '每次请求实时生成',
              color: 'from-blue-500 to-cyan-400',
              badge: '动态',
            },
            {
              mode: 'SSG',
              name: '静态生成',
              desc: '构建时生成，可缓存',
              color: 'from-green-500 to-emerald-400',
              badge: '静态',
            },
            {
              mode: 'ISR',
              name: '增量静态再生成',
              desc: '后台定期重新生成',
              color: 'from-purple-500 to-violet-400',
              badge: '混合',
            },
            {
              mode: 'CSR',
              name: '客户端渲染',
              desc: '浏览器执行 JS 渲染',
              color: 'from-orange-500 to-amber-400',
              badge: '动态',
            },
          ].map((item) => (
            <div
              key={item.mode}
              className={`p-6 rounded-xl bg-gradient-to-br ${item.color} text-white`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-2xl font-bold">{item.mode}</span>
                <span className="px-2 py-1 text-xs bg-white/20 rounded-full">
                  {item.badge}
                </span>
              </div>
              <h3 className="font-semibold text-lg mb-1">{item.name}</h3>
              <p className="text-sm opacity-90">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 渲染策略说明 */}
      <section className="mb-16 p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-bold mb-6">本页渲染策略</h2>
        <div className="space-y-4">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center flex-shrink-0">
              <span className="text-green-600 dark:text-green-400 font-bold">1</span>
            </div>
            <div>
              <h3 className="font-semibold">Server Component（服务端组件）</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                此页面是 <code className="px-1 py-0.5 bg-gray-100 dark:bg-gray-700 rounded">async function HomePage()</code>，
                是一个服务端组件。数据获取直接在服务端执行，无需 API 路由。
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center flex-shrink-0">
              <span className="text-blue-600 dark:text-blue-400 font-bold">2</span>
            </div>
            <div>
              <h3 className="font-semibold">SSG 静态生成</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                由于设置了 <code className="px-1 py-0.5 bg-gray-100 dark:bg-gray-700 rounded">export const dynamic = 'force-static'</code>，
                此页面在构建时生成静态 HTML，部署到 CDN 后可直接缓存分发。
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center flex-shrink-0">
              <span className="text-purple-600 dark:text-purple-400 font-bold">3</span>
            </div>
            <div>
              <h3 className="font-semibold">零客户端 JS</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                服务端组件的 HTML 已经包含了渲染好的内容，浏览器只需显示即可。
                只有交互组件（<code className="px-1 py-0.5 bg-gray-100 dark:bg-gray-700 rounded">'use client'</code>）才会打包 JS。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 产品展示 */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">精选商品（SSG 数据）</h2>
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
              className="group block bg-white dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 transition-all hover:shadow-lg hover:-translate-y-1"
            >
              <div className="relative aspect-square overflow-hidden">
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute top-3 right-3">
                  <span className="px-2 py-1 text-xs font-medium bg-purple-600 text-white rounded-full">
                    {product.category}
                  </span>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-lg group-hover:text-purple-600 transition-colors">
                  {product.name}
                </h3>
                <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                  {product.description}
                </p>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-xl font-bold text-purple-600">
                    ¥{product.price.toLocaleString()}
                  </span>
                  <span className="text-sm text-gray-500">
                    ★ {product.rating}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 技术说明 */}
      <section className="mt-16 p-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl text-white">
        <h2 className="text-2xl font-bold mb-4">为什么选择 Next.js？</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h3 className="font-semibold mb-2">性能优化</h3>
            <p className="text-sm opacity-90">
              服务端组件默认不发送 JS 到客户端，首屏加载更快，LCP/FID/CLS 指标更优
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">SEO 友好</h3>
            <p className="text-sm opacity-90">
              页面内容在服务端渲染完成，搜索引擎可以完整抓取，对电商、博客等场景至关重要
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">开发体验</h3>
            <p className="text-sm opacity-90">
              App Router 统一了服务端和客户端组件模型，API 路由直接与页面共存
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
