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
  elm: Node | undefined;
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
  elm: Element | Text | undefined
): VNode => {
  const key = data === undefined ? undefined : data.key;
  return { sel, data, children, text, elm, key };
}

export const h = (sel: string, fArg?: any, sArg?: any) => {
  let data = {};
  let children: any = [];
  if (
    !sArg && (
      Array.isArray(fArg) ||
      typeof fArg === 'string'
    )
  ) {
    children = fArg;
  } else if (typeof fArg === 'object') {
    data = fArg;
  }

  if (sArg) children = sArg;

  if (!Array.isArray(children)) children = [children];

  children = children.map((child: any) => typeof child === 'string' ? createVNode(undefined, undefined, undefined, child, undefined) : child);

  return createVNode(sel, data, children, undefined, undefined);
}
