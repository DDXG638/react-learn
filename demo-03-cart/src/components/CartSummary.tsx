import { memo, useMemo } from 'react';
import type { CartState } from '../types';

interface CartSummaryProps {
  cart: CartState;
  onClearCart: () => void;
}

// 使用 memo 缓存组件
const CartSummaryComponent = memo(function CartSummaryComponent({
  cart,
  onClearCart,
}: CartSummaryProps) {
  console.log('[CartSummary] 渲染');

  // 使用 useMemo 缓存计算结果，避免每次渲染都重新计算
  // 只有 cart.totalQuantity 或 cart.totalPrice 变化时才重新计算
  const discount = useMemo(() => {
    console.log('[useMemo] 计算折扣');
    // 满500减50
    if (cart.totalPrice >= 500) {
      return Math.floor(cart.totalPrice / 500) * 50;
    }
    return 0;
  }, [cart.totalPrice]);

  const finalPrice = useMemo(() => {
    console.log('[useMemo] 计算最终价格');
    return cart.totalPrice - discount;
  }, [cart.totalPrice, discount]);

  const averagePrice = useMemo(() => {
    if (cart.totalQuantity === 0) return 0;
    return finalPrice / cart.totalQuantity;
  }, [finalPrice, cart.totalQuantity]);

  if (cart.items.length === 0) {
    return (
      <div className="cart-summary empty">
        <p>购物车是空的</p>
      </div>
    );
  }

  return (
    <div className="cart-summary">
      <h3>📊 购物车摘要</h3>

      <div className="summary-row">
        <span>商品种类</span>
        <span>{cart.items.length} 种</span>
      </div>

      <div className="summary-row">
        <span>商品总数</span>
        <span>{cart.totalQuantity} 件</span>
      </div>

      <div className="summary-row">
        <span>商品总价</span>
        <span>¥{cart.totalPrice.toLocaleString()}</span>
      </div>

      {discount > 0 && (
        <div className="summary-row discount">
          <span>🎉 满减优惠</span>
          <span>-¥{discount}</span>
        </div>
      )}

      <div className="summary-row final">
        <span>应付金额</span>
        <span className="final-price">
          ¥{finalPrice.toLocaleString()}
        </span>
      </div>

      <div className="summary-row average">
        <span>平均每件</span>
        <span>¥{averagePrice.toFixed(2)}</span>
      </div>

      <button onClick={onClearCart} className="btn-clear">
        🗑️ 清空购物车
      </button>
    </div>
  );
});

export const CartSummary = memo(CartSummaryComponent);
