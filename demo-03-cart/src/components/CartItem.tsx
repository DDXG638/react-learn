import { memo, useCallback } from 'react';
import type { CartItem as CartItemType } from '../types';

interface CartItemProps {
  item: CartItemType;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemove: (productId: string) => void;
}

// 使用 memo 缓存组件，只有 item 或回调变化时才重新渲染
export const CartItem = memo(function CartItem({
  item,
  onUpdateQuantity,
  onRemove,
}: CartItemProps) {
  console.log(`[CartItem] 渲染: ${item.product.name}`);

  // 使用 useCallback 缓存回调函数
  const handleIncrement = useCallback(() => {
    onUpdateQuantity(item.product.id, item.quantity + 1);
  }, [item.product.id, item.quantity, onUpdateQuantity]);

  const handleDecrement = useCallback(() => {
    if (item.quantity > 1) {
      onUpdateQuantity(item.product.id, item.quantity - 1);
    }
  }, [item.product.id, item.quantity, onUpdateQuantity]);

  const handleRemove = useCallback(() => {
    onRemove(item.product.id);
  }, [item.product.id, onRemove]);

  const subtotal = item.product.price * item.quantity;

  return (
    <div className="cart-item">
      <div className="cart-item-info">
        <span className="cart-item-image">{item.product.image}</span>
        <div className="cart-item-details">
          <h4>{item.product.name}</h4>
          <span className="cart-item-price">
            ¥{item.product.price.toLocaleString()}
          </span>
        </div>
      </div>

      <div className="cart-item-actions">
        <div className="quantity-control">
          <button
            onClick={handleDecrement}
            className="btn-quantity"
            disabled={item.quantity <= 1}
          >
            -
          </button>
          <span className="quantity-value">{item.quantity}</span>
          <button onClick={handleIncrement} className="btn-quantity">
            +
          </button>
        </div>

        <div className="cart-item-subtotal">
          ¥{subtotal.toLocaleString()}
        </div>

        <button onClick={handleRemove} className="btn-remove">
          删除
        </button>
      </div>
    </div>
  );
});
