/**
 * 简化版 Virtual DOM 实现
 * 参考 React.createElement
 */

export type Props = {
  children?: VNode[];
  [key: string]: unknown;
};

export interface VNode {
  type: string | Function;
  props: Props;
  key?: string | number;
  ref?: unknown;
}

export function h(
  type: string | Function,
  props: Props = {},
  ...children: (VNode | string | number)[]
): VNode {
  return {
    type,
    props: {
      ...props,
      children: children.map((child) =>
        typeof child === 'object' ? child : createTextVNode(String(child))
      ),
    },
    key: props.key as string | number | undefined,
    ref: props.ref,
  };
}

function createTextVNode(text: string): VNode {
  return {
    type: 'TEXT_ELEMENT',
    props: { nodeValue: text },
  };
}

export function isVNode(node: unknown): node is VNode {
  return typeof node === 'object' && node !== null && 'type' in node;
}

export function isTextVNode(node: VNode): boolean {
  return node.type === 'TEXT_ELEMENT';
}
