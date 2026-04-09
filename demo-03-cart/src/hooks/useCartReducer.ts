import { useReducer, useMemo, useCallback } from 'react';
import type { CartState, CartAction, CartItem, Product } from '../types';

/**
 * 购物车 reducer 函数
 * 统一管理购物车状态变更
 */
function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existingItem = state.items.find(
        item => item.product.id === action.product.id
      );

      let newItems: CartItem[];
      if (existingItem) {
        // 商品已存在，增加数量
        newItems = state.items.map(item =>
          item.product.id === action.product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        // 新商品
        newItems = [...state.items, { product: action.product, quantity: 1 }];
      }

      return recalculateTotals({ ...state, items: newItems });
    }

    case 'REMOVE_ITEM': {
      const newItems = state.items.filter(
        item => item.product.id !== action.productId
      );
      return recalculateTotals({ ...state, items: newItems });
    }

    case 'UPDATE_QUANTITY': {
      if (action.quantity <= 0) {
        // 数量为0或负数，移除商品
        const newItems = state.items.filter(
          item => item.product.id !== action.productId
        );
        return recalculateTotals({ ...state, items: newItems });
      }

      const newItems = state.items.map(item =>
        item.product.id === action.productId
          ? { ...item, quantity: action.quantity }
          : item
      );
      return recalculateTotals({ ...state, items: newItems });
    }

    case 'CLEAR_CART': {
      return { items: [], totalQuantity: 0, totalPrice: 0 };
    }

    default:
      return state;
  }
}

/**
 * 重新计算总数
 * 这是一个纯函数，不依赖外部状态
 */
function recalculateTotals(state: CartState): CartState {
  const totalQuantity = state.items.reduce(
    (sum, item) => sum + item.quantity,
    0
  );
  const totalPrice = state.items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  return { ...state, totalQuantity, totalPrice };
}

// 初始状态
const initialState: CartState = {
  items: [],
  totalQuantity: 0,
  totalPrice: 0,
};

/**
 * 购物车 Hook
 * 使用 useReducer 管理复杂状态，配合 useCallback 优化回调
 */
export function useCartReducer() {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // 使用 useCallback 缓存 dispatch 函数，避免子组件不必要的渲染
  // 配合 React.memo 使用效果更好
  const addItem = useCallback((product: Product) => {
    dispatch({ type: 'ADD_ITEM', product });
  }, []);

  const removeItem = useCallback((productId: string) => {
    dispatch({ type: 'REMOVE_ITEM', productId });
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', productId, quantity });
  }, []);

  const clearCart = useCallback(() => {
    dispatch({ type: 'CLEAR_CART' });
  }, []);

  // 使用 useMemo 缓存计算结果（虽然 state 变化时组件会重新渲染，
  // 但 useMemo 可以避免在每次渲染时重新计算）
  const cartInfo = useMemo(() => ({
    itemCount: state.items.length,
    totalQuantity: state.totalQuantity,
    totalPrice: state.totalPrice,
  }), [state.items.length, state.totalQuantity, state.totalPrice]);

  return {
    cart: state,
    cartInfo,
    dispatch,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
  };
}
