'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useCartStore } from '@/stores/cart';

export default function CartPage() {
  const { items, updateQuantity, removeItem, totalPrice, clearCart } = useCartStore();

  if (items.length === 0) {
    return (
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold mb-8">购物车</h1>
        <div className="text-center py-16 bg-gray-50 dark:bg-gray-800 rounded-xl">
          <p className="text-gray-500 mb-4">购物车是空的</p>
          <Link
            href="/products"
            className="inline-block px-6 py-3 bg-purple-600 text-white font-semibold rounded-xl hover:bg-purple-700 transition-colors"
          >
            去逛逛
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">购物车</h1>
        <button
          onClick={clearCart}
          className="text-sm text-gray-500 hover:text-red-600 transition-colors"
        >
          清空购物车
        </button>
      </div>

      <div className="space-y-4">
        {items.map(({ product, quantity }) => (
          <div
            key={product.id}
            className="flex items-center gap-6 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700"
          >
            <Link href={`/products/${product.id}`} className="flex-shrink-0">
              <div className="relative w-24 h-24 rounded-lg overflow-hidden">
                <Image
                  src={product.imageUrl}
                  alt={product.name}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
            </Link>

            <div className="flex-1 min-w-0">
              <Link
                href={`/products/${product.id}`}
                className="font-semibold hover:text-purple-600 transition-colors line-clamp-1"
              >
                {product.name}
              </Link>
              <p className="text-sm text-gray-500 mt-1">
                ¥{(product.price / 100).toFixed(2)}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => updateQuantity(product.id, quantity - 1)}
                className="w-8 h-8 rounded-full border border-gray-300 dark:border-gray-600 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                -
              </button>
              <span className="w-8 text-center font-medium">{quantity}</span>
              <button
                onClick={() => updateQuantity(product.id, quantity + 1)}
                className="w-8 h-8 rounded-full border border-gray-300 dark:border-gray-600 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                +
              </button>
            </div>

            <div className="text-right">
              <p className="font-bold text-purple-600">
                ¥{((product.price * quantity) / 100).toFixed(2)}
              </p>
              <button
                onClick={() => removeItem(product.id)}
                className="text-sm text-gray-500 hover:text-red-600 mt-1 transition-colors"
              >
                删除
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* 结算 */}
      <div className="mt-8 p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <span className="text-gray-600 dark:text-gray-400">共 {items.length} 件商品</span>
          <div className="text-right">
            <p className="text-sm text-gray-500">合计</p>
            <p className="text-3xl font-bold text-purple-600">
              ¥{(totalPrice() / 100).toFixed(2)}
            </p>
          </div>
        </div>
        <button className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl transition-colors">
          去结算
        </button>
      </div>

      {/* Zustand 说明 */}
      <section className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
        <h2 className="font-semibold text-blue-700 dark:text-blue-400 mb-2">
          💡 Zustand 状态管理
        </h2>
        <p className="text-sm text-blue-600 dark:text-blue-300">
          购物车数据使用 Zustand 管理，支持持久化存储。刷新页面后购物车数据不会丢失。
        </p>
      </section>
    </main>
  );
}
