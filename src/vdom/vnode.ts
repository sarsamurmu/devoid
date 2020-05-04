import { Hooks } from './hooks';
import { VNodeStyle } from './modules/style';
import { On } from './modules/event';
import { Attrs } from './modules/attributes';
import { Classes } from './modules/class';
import { Props } from './modules/props';
import { EventManager } from '../utils';

export type Key = string | number;

export interface VNode {
  sel: string | undefined;
  data: VNodeData | undefined;
  children: VNode[] | undefined;
  el: Node | undefined;
  text: string | undefined;
  key: Key | undefined;
}

export interface VNodeData {
  key?: Key;
  props?: Props;
  attrs?: Attrs;
  class?: Classes;
  style?: VNodeStyle;
  on?: On;
  hook?: Hooks;
  events?: EventManager;
  ns?: string; // for SVGs
}

export const createVNode = (
  sel: string | undefined,
  data: any | undefined,
  children: VNode['children'],
  text: VNode['text'],
  el: Element | Text | undefined
): VNode => {
  const key = data === undefined ? undefined : data.key;
  return { sel, data, children, text, el, key };
}

export const h = (sel: string, fArg?: any, sArg?: any) => {
  const isComment = sel === '!';
  let data = {};
  let children: any = [];
  if (
    !sArg && (
      Array.isArray(fArg) ||
      typeof fArg === 'string' ||
      (typeof fArg === 'object' && 'sel' in fArg)
    )
  ) {
    children = fArg;
  } else if (typeof fArg === 'object') {
    data = fArg;
  }

  if (sArg) children = sArg;

  if (!Array.isArray(children)) children = [children];

  if (!isComment) children = children.map((child: any) => typeof child === 'string' ? createVNode(undefined, undefined, undefined, child, undefined) : child);

  return createVNode(sel, data, !isComment ? children : undefined, isComment ? children[0] : undefined, undefined);
}
