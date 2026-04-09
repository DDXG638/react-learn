import { memo, useCallback } from 'react';
import type { Product } from '../types';

interface ProductListProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
}

// 使用 memo 缓存组件，只有 props 变化时才重新渲染
const ProductCard = memo(function ProductCard({
  product,
  onAdd,
}: {
  product: Product;
  onAdd: (product: Product) => void;
}) {
  console.log(`[ProductCard] 渲染: ${product.name}`);

  // 使用 useCallback 缓存回调函数，避免子组件不必要的重渲染
  const handleAdd = useCallback(() => {
    onAdd(product);
  }, [product, onAdd]);

  return (
    <div className="product-card">
      <div className="product-image">{product.image}</div>
      <div className="product-info">
        <h3 className="product-name">{product.name}</h3>
        <span className="product-category">{product.category}</span>
        <div className="product-bottom">
          <span className="product-price">¥{product.price.toLocaleString()}</span>
          <button onClick={handleAdd} className="btn-add">
            加入购物车
          </button>
        </div>
      </div>
    </div>
  );
});

export function ProductList({ products, onAddToCart }: ProductListProps) {
  console.log('[ProductList] 渲染');

  // 使用 useCallback 缓存回调
  const handleAdd = useCallback((product: Product) => {
    onAddToCart(product);
  }, [onAddToCart]);

  if (products.length === 0) {
    return (
      <div className="empty-state">
        <p>没有找到商品</p>
      </div>
    );
  }

  return (
    <div className="product-list">
      {products.map(product => (
        <ProductCard
          key={product.id}
          product={product}
          onAdd={handleAdd}
        />
      ))}
    </div>
  );
}
