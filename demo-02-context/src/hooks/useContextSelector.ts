import { useContext, useState, useEffect, useRef } from 'react';
import type { Context } from 'react';

/**
 * 选择器订阅信息
 */
interface Subscription<T, S> {
  context: Context<T>;
  selector: (value: T) => S;
  equalityFn: (a: S, b: S) => boolean;
  lastSelectedValue: S;
}

/**
 * useContextSelector - 选择器模式的实现
 *
 * 核心原理：组件只订阅 Context 的部分数据，只有这部分数据变化时才重渲染
 */
export function useContextSelector<T, S>(
  context: Context<T>,
  selector: (value: T) => S,
  equalityFn: (a: S, b: S) => boolean = (a, b) => Object.is(a, b)
): S {
  // 获取当前 context 的 value
  const contextValue = useContext(context);

  // 用 ref 存储订阅信息
  const subscriptionRef = useRef<Subscription<T, S> | null>(null);

  // 确保订阅被初始化
  if (subscriptionRef.current === null) {
    subscriptionRef.current = {
      context,
      selector,
      equalityFn,
      lastSelectedValue: selector(contextValue),
    };
  }

  // 更新引用（每次渲染都更新）
  const current = subscriptionRef.current;
  current.selector = selector;
  current.equalityFn = equalityFn;
  current.context = context;

  // 使用选择器计算当前值
  const selectedValue = selector(contextValue);

  // 状态：用于触发组件重渲染
  const [state, setState] = useState<S>(() => selectedValue);

  // 核心逻辑：检测选择器计算出的值是否变化
  useEffect(() => {
    const subscription = subscriptionRef.current;
    if (!subscription) return;

    const lastSelectedValue = subscription.lastSelectedValue;
    const eqFn = subscription.equalityFn;

    // 比较上次选择器计算的值和当前值
    if (!eqFn(lastSelectedValue, selectedValue)) {
      subscription.lastSelectedValue = selectedValue;
      setState(() => selectedValue);
    }
  }, [selectedValue]);

  return state;
}

/**
 * 浅比较函数
 */
export function shallow<T>(a: T, b: T): boolean {
  if (a === b) return true;
  if (typeof a !== 'object' || a === null || typeof b !== 'object' || b === null) {
    return false;
  }
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  if (keysA.length !== keysB.length) return false;
  for (const key of keysA) {
    if ((a as any)[key] !== (b as any)[key]) return false;
  }
  return true;
}
