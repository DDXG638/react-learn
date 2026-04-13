import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Product, CartItem } from '../types';

interface CartState {
  items: CartItem[];
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: () => number;
  totalPrice: () => number;
}

// 模拟商品数据
export const mockProducts: Product[] = [
  { id: 'p1', name: 'iPhone 15 Pro', price: 8999, stock: 50, category: '手机', image: '📱' },
  { id: 'p2', name: 'MacBook Pro', price: 15999, stock: 30, category: '电脑', image: '💻' },
  { id: 'p3', name: 'AirPods Pro', price: 1899, stock: 100, category: '耳机', image: '🎧' },
  { id: 'p4', name: 'iPad Air', price: 4999, stock: 40, category: '平板', image: '平板' },
  { id: 'p5', name: 'Apple Watch', price: 2999, stock: 60, category: '手表', image: '⌚' },
];

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (product) => set((state) => {
        const existing = state.items.find((item) => item.product.id === product.id);
        if (existing) {
          return {
            items: state.items.map((item) =>
              item.product.id === product.id
                ? { ...item, quantity: item.quantity + 1 }
                : item
            ),
          };
        }
        return { items: [...state.items, { product, quantity: 1 }] };
      }),
      removeItem: (productId) => set((state) => ({
        items: state.items.filter((item) => item.product.id !== productId),
      })),
      updateQuantity: (productId, quantity) => set((state) => {
        if (quantity <= 0) {
          return { items: state.items.filter((item) => item.product.id !== productId) };
        }
        return {
          items: state.items.map((item) =>
            item.product.id === productId ? { ...item, quantity } : item
          ),
        };
      }),
      clearCart: () => set({ items: [] }),
      totalItems: () => get().items.reduce((sum, item) => sum + item.quantity, 0),
      totalPrice: () => get().items.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
    }),
    {
      name: 'cart-storage',
    }
  )
);