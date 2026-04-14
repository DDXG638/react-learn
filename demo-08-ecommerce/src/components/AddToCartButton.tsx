'use client';

import { useCartStore } from '@/stores/cart';
import { Product } from '@/types';

interface AddToCartButtonProps {
  product: Product;
}

export function AddToCartButton({ product }: AddToCartButtonProps) {
  const addItem = useCartStore((state) => state.addItem);
  const items = useCartStore((state) => state.items);
  const updateQuantity = useCartStore((state) => state.updateQuantity);

  const cartItem = items.find((item) => item.product.id === product.id);
  const quantity = cartItem?.quantity || 0;

  return (
    <div className="flex gap-4">
      {quantity > 0 ? (
        <div className="flex items-center gap-3">
          <button
            onClick={() => updateQuantity(product.id, quantity - 1)}
            className="w-10 h-10 rounded-full border border-gray-300 dark:border-gray-600 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            -
          </button>
          <span className="text-xl font-semibold w-8 text-center">{quantity}</span>
          <button
            onClick={() => updateQuantity(product.id, quantity + 1)}
            className="w-10 h-10 rounded-full border border-gray-300 dark:border-gray-600 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            +
          </button>
        </div>
      ) : (
        <button
          onClick={() => addItem(product)}
          className="flex-1 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl transition-colors"
        >
          加入购物车
        </button>
      )}
      <button className="px-6 py-3 border-2 border-purple-600 text-purple-600 hover:bg-purple-50 font-semibold rounded-xl transition-colors">
        立即购买
      </button>
    </div>
  );
}
