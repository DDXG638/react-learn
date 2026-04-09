import { useState, useCallback } from 'react';
import { ProductList } from './components/ProductList';
import { CartItem } from './components/CartItem';
import { CartSummary } from './components/CartSummary';
import { ProductSearch } from './components/ProductSearch';
import { useProducts } from './hooks/useProducts';
import { useCartReducer } from './hooks/useCartReducer';
import type { Product } from './types';
import './App.css';

function App() {
  const { products, loading, searchProducts } = useProducts();
  const {
    cart,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
  } = useCartReducer();

  const [searchQuery, setSearchQuery] = useState('');

  // 使用 useCallback 缓存搜索回调
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  // 根据搜索过滤商品
  const filteredProducts = searchQuery
    ? searchProducts(searchQuery)
    : products;

  // 添加到购物车
  const handleAddToCart = useCallback((product: Product) => {
    addItem(product);
  }, [addItem]);

  return (
    <div className="app">
      <header className="header">
        <h1>🛒 购物车 Demo</h1>
        <p className="subtitle">
          useMemo / useCallback / useRef / useReducer 演示
        </p>
      </header>

      <main className="main">
        {/* 左侧：商品列表 */}
        <section className="product-section">
          <div className="section-header">
            <h2>📦 商品列表</h2>
            <ProductSearch
              onSearch={handleSearch}
              placeholder="搜索商品名称或分类..."
            />
          </div>

          {loading ? (
            <div className="loading">加载中...</div>
          ) : (
            <ProductList
              products={filteredProducts}
              onAddToCart={handleAddToCart}
            />
          )}
        </section>

        {/* 右侧：购物车 */}
        <section className="cart-section">
          <div className="section-header">
            <h2>🛍️ 我的购物车</h2>
            <span className="cart-badge">
              {cart.totalQuantity} 件商品
            </span>
          </div>

          <div className="cart-content">
            {cart.items.length === 0 ? (
              <div className="empty-cart">
                <p>购物车是空的</p>
                <p className="empty-hint">点击商品卡片添加到购物车</p>
              </div>
            ) : (
              <>
                <div className="cart-items">
                  {cart.items.map(item => (
                    <CartItem
                      key={item.product.id}
                      item={item}
                      onUpdateQuantity={updateQuantity}
                      onRemove={removeItem}
                    />
                  ))}
                </div>

                <CartSummary
                  cart={cart}
                  onClearCart={clearCart}
                />
              </>
            )}
          </div>
        </section>
      </main>

      {/* 底部说明 */}
      <footer className="footer">
        <div className="demo-info">
          <h4>📚 学习要点</h4>
          <ul>
            <li><code>useMemo</code> - 缓存计算结果，避免重复计算</li>
            <li><code>useCallback</code> - 缓存回调函数，避免子组件不必要渲染</li>
            <li><code>React.memo</code> - 缓存组件，只在 props 变化时重渲染</li>
            <li><code>useReducer</code> - 统一管理复杂状态逻辑</li>
            <li><code>useRef</code> - DOM 引用 + 持久化可变值</li>
          </ul>
        </div>
      </footer>
    </div>
  );
}

export default App;
