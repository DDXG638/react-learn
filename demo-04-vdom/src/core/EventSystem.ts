/**
 * 合成事件与事件委托演示
 * 对比原生事件绑定 vs 事件委托
 */

export interface EventBinding {
  element: Element;
  eventType: string;
  handler: (e: Event) => void;
  captured: boolean;
}

export interface SyntheticEvent {
  nativeEvent: Event;
  currentTarget: Element;
  target: Element;
  type: string;
  bubbles: boolean;
  cancelable: boolean;
  timeStamp: number;
}

type EventHandler = (e: SyntheticEvent) => void;

/**
 * 模拟 React 的合成事件系统
 */
class SyntheticEventSystem {
  private root: Element | null = null;
  private eventBindings: Map<string, EventBinding[]> = new Map();
  private syntheticEventPool: SyntheticEvent[] = [];
  private maxPoolSize = 10;

  /**
   * 挂载事件系统到根节点
   * React 17+ 事件委托到 root 而不是 document
   */
  attachToRoot(root: Element) {
    this.root = root;
    console.log('[事件系统] 已挂载到 root:', root.tagName);
  }

  /**
   * 注册事件处理器 (模拟 React 的事件注册)
   */
  on(eventType: string, handler: EventHandler, element: Element = this.root!) {
    if (!element) return;

    const binding: EventBinding = {
      element,
      eventType,
      handler: (nativeEvent: Event) => {
        // 从池中获取或创建合成事件
        const syntheticEvent = this.getFromPool(nativeEvent, element);
        try {
          handler(syntheticEvent);
        } finally {
          this.releaseToPool(syntheticEvent);
        }
      },
      captured: false,
    };

    // 实际绑定到 root (事件委托)
    this.root?.addEventListener(eventType, binding.handler, false);

    const bindings = this.eventBindings.get(eventType) || [];
    bindings.push(binding);
    this.eventBindings.set(eventType, bindings);

    console.log(`[事件系统] 注册 ${eventType} 到 root (委托模式)`);
  }

  /**
   * 从对象池获取合成事件
   */
  private getFromPool(nativeEvent: Event, currentTarget: Element): SyntheticEvent {
    let event = this.syntheticEventPool.pop();

    if (!event) {
      event = {
        nativeEvent: null as unknown as Event,
        currentTarget: null as unknown as Element,
        target: null as unknown as Element,
        type: '',
        bubbles: false,
        cancelable: false,
        timeStamp: 0,
      };
    }

    event.nativeEvent = nativeEvent;
    event.currentTarget = currentTarget;
    event.target = nativeEvent.target as Element;
    event.type = nativeEvent.type;
    event.bubbles = nativeEvent.bubbles;
    event.cancelable = nativeEvent.cancelable;
    event.timeStamp = nativeEvent.timeStamp;

    return event;
  }

  /**
   * 释放合成事件到对象池
   */
  private releaseToPool(event: SyntheticEvent) {
    if (this.syntheticEventPool.length < this.maxPoolSize) {
      this.syntheticEventPool.push(event);
    }
  }

  /**
   * 获取所有事件绑定信息
   */
  getEventBindings(): { eventType: string; count: number }[] {
    const result: { eventType: string; count: number }[] = [];
    this.eventBindings.forEach((bindings, eventType) => {
      result.push({ eventType, count: bindings.length });
    });
    return result;
  }

  /**
   * 清理所有事件绑定
   */
  detach() {
    this.eventBindings.forEach((bindings, eventType) => {
      bindings.forEach((binding) => {
        this.root?.removeEventListener(eventType, binding.handler, false);
      });
    });
    this.eventBindings.clear();
    this.root = null;
    console.log('[事件系统] 已解除挂载');
  }
}

export const syntheticEventSystem = new SyntheticEventSystem();

/**
 * 演示事件绑定顺序
 */
export function demonstrateEventBindingOrder() {
  const container = document.createElement('div');
  container.id = 'event-demo';
  document.body.appendChild(container);

  const inner = document.createElement('button');
  inner.textContent = '点击我';
  inner.id = 'inner-btn';
  container.appendChild(inner);

  const log: string[] = [];

  // 1. 原生事件绑定顺序
  container.addEventListener('click', () => log.push('container bubble'), false);
  inner.addEventListener('click', () => log.push('inner bubble'), false);
  container.addEventListener('click', () => log.push('container capture'), true);
  inner.addEventListener('click', () => log.push('inner capture'), true);

  // 触发事件
  inner.click();

  console.log('事件执行顺序:', log.join(' → '));

  // 清理
  document.body.removeChild(container);

  return log;
}
