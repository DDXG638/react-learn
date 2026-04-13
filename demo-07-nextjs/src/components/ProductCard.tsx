'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/types';

interface ProductCardProps {
  product: Product;
  index: number;
}

export function ProductCard({ product, index }: ProductCardProps) {
  return (
    <Link href={`/products/${product.id}`}>
      <div className="group relative overflow-hidden rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 transition-all hover:shadow-xl hover:-translate-y-1">
        <div className="relative aspect-square overflow-hidden">
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            unoptimized
            loading={index < 3 ? 'eager' : 'lazy'}
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          />
          <div className="absolute top-3 right-3">
            <span className="px-2 py-1 text-xs font-medium bg-purple-600 text-white rounded-full">
              {product.category}
            </span>
          </div>
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-lg text-gray-900 dark:text-white group-hover:text-purple-600 transition-colors">
            {product.name}
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
            {product.description}
          </p>
          <div className="mt-3 flex items-center justify-between">
            <span className="text-xl font-bold text-purple-600 dark:text-purple-400">
              ¥{product.price.toLocaleString()}
            </span>
            <div className="flex items-center gap-1">
              <span className="text-yellow-500">★</span>
              <span className="text-sm text-gray-600 dark:text-gray-300">
                {product.rating} ({product.reviewCount})
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

interface ProductListProps {
  products: Product[];
}

export function ProductGrid({ products }: ProductListProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product, index) => (
        <ProductCard key={product.id} product={product} index={index} />
      ))}
    </div>
  );
}
