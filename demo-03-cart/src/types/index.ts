// 商品类型
export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  image: string;
}

// 购物车商品
export interface CartItem {
  product: Product;
  quantity: number;
}

// 购物车状态
export interface CartState {
  items: CartItem[];
  totalQuantity: number;
  totalPrice: number;
}

// 购物车 Action
export type CartAction =
  | { type: 'ADD_ITEM'; product: Product }
  | { type: 'REMOVE_ITEM'; productId: string }
  | { type: 'UPDATE_QUANTITY'; productId: string; quantity: number }
  | { type: 'CLEAR_CART' };

// useReducer 返回类型
export interface CartDispatch {
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
}
