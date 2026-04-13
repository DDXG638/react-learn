import { notFound } from 'next/navigation';
import { getProduct, getProductReviews, getProducts } from '@/types';
import Image from 'next/image';
import { ReviewList } from '@/components/ReviewList';

// SSR: 每次请求实时生成
export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ProductDetailPage({ params }: Props) {
  const { id } = await params;

  // 并行获取产品和评论
  const [product, reviews] = await Promise.all([
    getProduct(id),
    getProductReviews(id),
  ]);

  if (!product) {
    notFound();
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* 返回链接 */}
      <a href="/products" className="inline-flex items-center text-sm text-gray-500 hover:text-purple-600 mb-6">
        ← 返回商品列表
      </a>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* 产品图片 */}
        <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800">
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-cover"
            loading="eager"
            unoptimized
          />
        </div>

        {/* 产品信息 */}
        <div>
          <div className="mb-4">
            <span className="px-3 py-1 text-sm font-medium bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded-full">
              {product.category}
            </span>
          </div>

          <h1 className="text-3xl font-bold mb-4">{product.name}</h1>

          <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
            {product.description}
          </p>

          <div className="flex items-center gap-6 mb-8">
            <div className="flex items-center">
              <span className="text-yellow-500 text-xl mr-1">★</span>
              <span className="font-semibold text-lg">{product.rating}</span>
              <span className="text-gray-500 ml-1">({product.reviewCount} 条评价)</span>
            </div>
          </div>

          <div className="text-4xl font-bold text-purple-600 mb-8">
            ¥{product.price.toLocaleString()}
          </div>

          {/* 操作按钮 */}
          <div className="flex gap-4">
            <button className="flex-1 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl transition-colors">
              加入购物车
            </button>
            <button className="px-6 py-3 border-2 border-purple-600 text-purple-600 hover:bg-purple-50 font-semibold rounded-xl transition-colors">
              立即购买
            </button>
          </div>

          {/* 服务端渲染说明 */}
          <div className="mt-8 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
            <h3 className="font-semibold text-green-700 dark:text-green-400 mb-2">
              服务端渲染 (SSR)
            </h3>
            <p className="text-sm text-green-600 dark:text-green-300">
              此页面使用 SSR，每次请求时获取最新产品信息和用户评价。
              商品价格、库存等实时数据非常适合 SSR。
            </p>
          </div>
        </div>
      </div>

      {/* 用户评价 */}
      <section className="mt-16">
        <h2 className="text-2xl font-bold mb-6">用户评价</h2>
        <ReviewList reviews={reviews} />
      </section>
    </main>
  );
}

// 生成动态路由参数
export async function generateStaticParams() {
  const products = await getProducts();
  return products.map((product) => ({
    id: product.id,
  }));
}
