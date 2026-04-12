/**
 * Fiber 架构模拟
 * 参考 React Fiber 节点结构
 */

import type { VNode } from './h';

export type FiberEffectTag = 'UPDATE' | 'PLACEMENT' | 'DELETION' | 'UPDATE_SIDEEFFECT';

export interface Fiber {
  type: string | Function | null;
  key: string | number | null;
  stateNode: unknown;
  child: Fiber | null;
  sibling: Fiber | null;
  return: Fiber | null;
  alternate: Fiber | null;
  effectTag: FiberEffectTag | null;
  pendingProps: Record<string, unknown>;
  memoizedProps: Record<string, unknown>;
  memoizedState: unknown;
  name: string;
  depth: number;
}

/**
 * 创建 Fiber 节点
 */
export function createFiber(vnode: VNode, depth = 0): Fiber {
  return {
    type: vnode.type,
    key: vnode.key ?? null,
    stateNode: null,
    child: null,
    sibling: null,
    return: null,
    alternate: null,
    effectTag: null,
    pendingProps: { ...vnode.props },
    memoizedProps: {},
    memoizedState: null,
    name: typeof vnode.type === 'string' ? vnode.type : 'Component',
    depth,
  };
}

/**
 * 判断是否是文本节点
 */
function isTextVNode(vnode: VNode): boolean {
  return vnode.type === 'TEXT_ELEMENT';
}

/**
 * 从 VNode 提取子节点数组
 */
function getVNodeChildren(vnode: VNode): VNode[] {
  const { children } = vnode.props;
  if (!children) return [];
  if (!Array.isArray(children)) return [];
  // 过滤出 VNode 类型的子节点
  return children.filter((c): c is VNode => typeof c === 'object' && c !== null && !isTextVNode(c));
}

/**
 * 构建完整的 Fiber 树
 */
export function buildFiberTree(vnode: VNode, parentFiber: Fiber | null, depth = 0): Fiber {
  const fiber = createFiber(vnode, depth);

  // 设置父节点
  if (parentFiber) {
    fiber.return = parentFiber;
  }

  // 获取子节点
  const childVNodes = getVNodeChildren(vnode);

  if (childVNodes.length > 0) {
    // 递归构建第一个子节点的 Fiber
    const firstChildFiber = buildFiberTree(childVNodes[0], fiber, depth + 1);
    fiber.child = firstChildFiber;

    // 构建剩余兄弟节点的 Fiber
    let prevSibling: Fiber = firstChildFiber;
    for (let i = 1; i < childVNodes.length; i++) {
      const siblingFiber = buildFiberTree(childVNodes[i], fiber, depth + 1);
      prevSibling.sibling = siblingFiber;
      prevSibling = siblingFiber;
    }
  }

  return fiber;
}

/**
 * 将 VNode 列表转换为 Fiber 链表
 * (兼容原 API，但内部使用 buildFiberTree)
 */
export function vnodeListToFiberTree(
  children: VNode[],
  parentFiber: Fiber | null,
  startDepth = 0
): Fiber | null {
  if (children.length === 0) return null;
  return buildFiberTree(children[0], parentFiber, startDepth);
}

/**
 * 遍历 Fiber 树（深度优先）
 */
export function* fiberTreeTraversal(root: Fiber): Generator<Fiber> {
  let current: Fiber | null = root;

  while (current !== null) {
    yield current;

    if (current.child !== null) {
      current = current.child;
    } else if (current.sibling !== null) {
      current = current.sibling;
    } else {
      // 回溯
      while (current !== null && current.sibling === null) {
        current = current.return;
      }
      if (current !== null) {
        current = current.sibling;
      }
    }
  }
}

/**
 * 调度步骤
 */
export interface ScheduleStep {
  fiber: Fiber;
  action: 'begin' | 'complete';
  timestamp: number;
}

/**
 * 模拟 Fiber 调度过程
 */
export function simulateFiberSchedule(root: Fiber): ScheduleStep[] {
  const steps: ScheduleStep[] = [];
  let timestamp = 0;

  function walk(fiber: Fiber | null) {
    if (fiber === null) return;

    // Begin
    steps.push({ fiber, action: 'begin', timestamp });
    timestamp += 10;

    // 遍历子节点
    if (fiber.child !== null) {
      walk(fiber.child);
    }

    // Complete
    steps.push({ fiber, action: 'complete', timestamp });
    timestamp += 5;

    // 遍历兄弟节点
    if (fiber.sibling !== null) {
      walk(fiber.sibling);
    }
  }

  // 从根节点开始遍历
  walk(root);

  return steps;
}

/**
 * 统计 Fiber 节点数量
 */
export function countFiberNodes(root: Fiber | null): number {
  if (root === null) return 0;
  let count = 0;
  for (const _ of fiberTreeTraversal(root)) {
    count++;
  }
  return count;
}
