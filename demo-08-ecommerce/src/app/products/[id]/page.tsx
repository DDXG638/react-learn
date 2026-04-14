import { notFound } from 'next/navigation';
import Image from 'next/image';
import { getProduct } from '@/types';
import { AddToCartButton } from '@/components/AddToCartButton';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ProductDetailPage({ params }: Props) {
  const { id } = await params;
  const product = getProduct(id);

  if (!product) {
    notFound();
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
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
            <span className="text-gray-500">库存: {product.stock}</span>
          </div>

          <div className="text-4xl font-bold text-purple-600 mb-8">
            ¥{(product.price / 100).toFixed(2)}
          </div>

          {/* 添加购物车按钮 */}
          <AddToCartButton product={product} />

          {/* 服务端渲染说明 */}
          <div className="mt-8 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
            <h3 className="font-semibold text-green-700 dark:text-green-400 mb-2">
              服务端渲染 (SSR)
            </h3>
            <p className="text-sm text-green-600 dark:text-green-300">
              此页面使用 SSR，每次请求时获取最新产品信息。
              商品详情页适合使用 SSR 确保数据一致性。
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

// 预生成静态路径
export async function generateStaticParams() {
  const products = getProduct('');
  return [{ id: '1' }, { id: '2' }, { id: '3' }];
}
