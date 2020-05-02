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
  children: (VNode | string)[] | undefined;
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
  [key: string]: any; // for any other 3rd party module
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
