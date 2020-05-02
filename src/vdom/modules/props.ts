import { VNode } from '../vnode';
import { Module } from './module';

export type Props = Record<string, any>;

const updateProps = (oldVNode: VNode, vNode: VNode) => {
  let key: string;
  let cur: any;
  let old: any;
  const elm = vNode.elm;
  let oldProps = oldVNode.data.props;
  let props = vNode.data.props;

  if (!oldProps && !props) return;
  if (oldProps === props) return;
  oldProps = oldProps || {};
  props = props || {};

  for (key in oldProps) {
    if (!props[key]) {
      delete (elm as any)[key];
    }
  }
  for (key in props) {
    cur = props[key];
    old = oldProps[key];
    if (old !== cur && (key !== 'value' || (elm as any)[key] !== cur)) {
      (elm as any)[key] = cur;
    }
  }
}

export const propsModule: Module = {
  create: updateProps,
  update: updateProps
}
