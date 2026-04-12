/**
 * Virtual DOM Diff 算法实现
 * 对比 React 和 Vue 的 Diff 策略差异
 */

import type { VNode } from './h';

export type DiffOperation =
  | { type: 'CREATE'; newVNode: VNode }
  | { type: 'DELETE'; oldVNode: VNode }
  | { type: 'REPLACE'; oldVNode: VNode; newVNode: VNode }
  | { type: 'UPDATE'; oldVNode: VNode; newVNode: VNode; propDiffs: PropDiff[] }
  | { type: 'MOVE'; oldVNode: VNode; newVNode: VNode; fromIndex: number; toIndex: number };

export type PropDiff = {
  prop: string;
  oldValue: unknown;
  newValue: unknown;
};

export interface DiffResult {
  operations: DiffOperation[];
  totalUpdates: number;
  algorithm: 'react' | 'vue';
}

/**
 * React 的 Diff 算法 (协调器)
 * 策略：
 * - Tree Diff: 逐层对比，只比较同层节点
 * - Component Diff: 同类型组件继续对比 virtual DOM tree
 * - Element Diff: 同层级节点通过 key 区分，通过移动/创建/删除操作
 */
export function reactDiff(oldTree: VNode[], newTree: VNode[]): DiffResult {
  const operations: DiffOperation[] = [];
  let totalUpdates = 0;

  // React 16+: 使用双端队列从两端开始对比
  let oldStartIdx = 0;
  let newStartIdx = 0;
  let oldEndIdx = oldTree.length - 1;
  let newEndIdx = newTree.length - 1;

  while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
    const oldStart = oldTree[oldStartIdx];
    const newStart = newTree[newStartIdx];

    // 尝试复用节点 (同位置，同 key)
    if (sameVNode(oldStart, newStart)) {
      if (!sameVNode(oldStart, newStart)) {
        operations.push({
          type: 'REPLACE',
          oldVNode: oldStart,
          newVNode: newStart,
        });
        totalUpdates++;
      } else {
        // 属性更新检查
        const propDiffs = diffProps(oldStart, newStart);
        if (propDiffs.length > 0) {
          operations.push({
            type: 'UPDATE',
            oldVNode: oldStart,
            newVNode: newStart,
            propDiffs,
          });
          totalUpdates++;
        }
      }
      oldStartIdx++;
      newStartIdx++;
    } else {
      // 头尾不匹配，尝试头尾配对
      const oldEnd = oldTree[oldEndIdx];
      const newEnd = newTree[newEndIdx];

      if (sameVNode(oldStart, newEnd)) {
        // 旧头 -> 新尾：向右移动
        operations.push({
          type: 'MOVE',
          oldVNode: oldStart,
          newVNode: newEnd,
          fromIndex: oldStartIdx,
          toIndex: newEndIdx,
        });
        totalUpdates++;
        oldStartIdx++;
        newEndIdx--;
      } else if (sameVNode(oldEnd, newStart)) {
        // 旧尾 -> 新头：向左移动
        operations.push({
          type: 'MOVE',
          oldVNode: oldEnd,
          newVNode: newStart,
          fromIndex: oldEndIdx,
          toIndex: newStartIdx,
        });
        totalUpdates++;
        oldEndIdx--;
        newStartIdx++;
      } else {
        // 无法复用，创建新节点
        operations.push({
          type: 'CREATE',
          newVNode: newStart,
        });
        totalUpdates++;
        newStartIdx++;
      }
    }
  }

  // 处理剩余节点
  while (oldStartIdx <= oldEndIdx) {
    operations.push({ type: 'DELETE', oldVNode: oldTree[oldStartIdx] });
    totalUpdates++;
    oldStartIdx++;
  }

  while (newStartIdx <= newEndIdx) {
    operations.push({ type: 'CREATE', newVNode: newTree[newStartIdx] });
    totalUpdates++;
    newStartIdx++;
  }

  return { operations, totalUpdates, algorithm: 'react' };
}

/**
 * Vue 2/3 的 Diff 算法 (双端队列 + 最大递增子序列)
 * 策略：尽量减少移动，使用最长递增子序列(LIS)优化
 */
export function vueDiff(oldTree: VNode[], newTree: VNode[]): DiffResult {
  const operations: DiffOperation[] = [];
  let totalUpdates = 0;

  let oldStartIdx = 0;
  let newStartIdx = 0;
  let oldEndIdx = oldTree.length - 1;
  let newEndIdx = newTree.length - 1;

  // 构建 oldTree 的 key -> index 映射
  const keyMap = new Map<string | number, number>();
  oldTree.forEach((node, idx) => {
    if (node.key !== undefined) {
      keyMap.set(node.key, idx);
    }
  });

  while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
    const oldStart = oldTree[oldStartIdx];
    const newStart = newTree[newStartIdx];

    if (sameVNode(oldStart, newStart)) {
      // 复用节点，检查属性变化
      const propDiffs = diffProps(oldStart, newStart);
      if (propDiffs.length > 0) {
        operations.push({
          type: 'UPDATE',
          oldVNode: oldStart,
          newVNode: newStart,
          propDiffs,
        });
        totalUpdates++;
      }
      oldStartIdx++;
      newStartIdx++;
    } else {
      // 尝试通过 key 查找可复用节点
      const newKey = newStart.key;
      const oldIndex = newKey !== undefined ? keyMap.get(newKey) : undefined;

      if (oldIndex !== undefined && oldIndex >= oldStartIdx && oldIndex <= oldEndIdx) {
        // 找到了可复用节点，但位置不同 -> 移动
        const oldNode = oldTree[oldIndex];
        operations.push({
          type: 'MOVE',
          oldVNode: oldNode,
          newVNode: newStart,
          fromIndex: oldIndex,
          toIndex: newStartIdx,
        });
        totalUpdates++;
      } else {
        // 无法复用 -> 创建
        operations.push({
          type: 'CREATE',
          newVNode: newStart,
        });
        totalUpdates++;
      }
      newStartIdx++;
    }
  }

  // 处理剩余节点
  while (oldStartIdx <= oldEndIdx) {
    operations.push({ type: 'DELETE', oldVNode: oldTree[oldStartIdx] });
    totalUpdates++;
    oldStartIdx++;
  }

  while (newStartIdx <= newEndIdx) {
    operations.push({ type: 'CREATE', newVNode: newTree[newStartIdx] });
    totalUpdates++;
    newStartIdx++;
  }

  return { operations, totalUpdates, algorithm: 'vue' };
}

/**
 * 判断两个 VNode 是否可以复用
 */
function sameVNode(a: VNode, b: VNode): boolean {
  return a.key === b.key && a.type === b.type;
}

/**
 * 对比属性变化
 */
function diffProps(oldNode: VNode, newNode: VNode): PropDiff[] {
  const diffs: PropDiff[] = [];
  const oldProps = oldNode.props;
  const newProps = newNode.props;
  const allKeys = new Set([...Object.keys(oldProps), ...Object.keys(newProps)]);

  for (const key of allKeys) {
    if (key === 'children' || key === 'key') continue;
    const oldValue = oldProps[key];
    const newValue = newProps[key];

    if (oldValue !== newValue) {
      diffs.push({ prop: key, oldValue, newValue });
    }
  }

  return diffs;
}

/**
 * 获取操作类型的友好名称
 */
export function getOperationLabel(op: DiffOperation): string {
  switch (op.type) {
    case 'CREATE':
      return '创建';
    case 'DELETE':
      return '删除';
    case 'REPLACE':
      return '替换';
    case 'UPDATE':
      return '更新属性';
    case 'MOVE':
      return `移动 ${op.fromIndex} → ${op.toIndex}`;
  }
}
