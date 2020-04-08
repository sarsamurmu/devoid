import { Component } from './component';
import { ChildType } from './elements';
import { Context } from './context';
import { Fragment } from './fragment';
import vnode, { VNode } from 'snabbdom/es/vnode';

export type FuncComp = (context: Context, props?: Record<string, any>) => ChildType;
export type AnyComp = Component | Fragment | FuncComp;

/* global console, process */

export const debug = process.env.NODE_ENV !== 'production';
export const log = console.log.bind(console);
export const warn = (...data: any) => console.warn('[Devoid]: ', ...data);

export const isClassComp = (component: any) => component instanceof Component || component instanceof Fragment;

export const generateUniqueId = () => '               '.replace(/[ ]/g, () => (Math.random() * 16 | 0).toString(16));

export const includes = <T>(array: T[], whichItem: T) => array.indexOf(whichItem) !== -1;

export const copyMap = <K, V>(from: Map<K, V>, to: Map<K, V>) => {
  from.forEach((value, key) => to.set(key, value));
}

export const def = (item: any) => item !== undefined;
export const undef = (item: any) => item === undefined;

export class EventManager {
  private events: Map<string, Map<any, (...args: any) => void>>;

  add(eventName: string, callback: (...args: any) => void, key?: any) {
    if (!this.events) this.events = new Map();
    if (!this.events.has(eventName)) this.events.set(eventName, new Map());
    const aKey = key || generateUniqueId();
    this.events.get(eventName).set(aKey, callback);
    return aKey;
  }

  removeKey(key: any, eventName?: string) {
    if (!this.events) return;
    if (eventName) return this.events.get(eventName).delete(key);
    this.events.forEach((eventMap) => eventMap.delete(key));
  }

  trigger(eventName: string, ...args: any) {
    if (!this.events) return;
    const callbacks = this.events.get(eventName);
    if (callbacks) callbacks.forEach((callback) => callback(...args));
  }
}

/* eslint-disable @typescript-eslint/no-use-before-define */

export function buildChild(context: Context, child: ChildType): VNode[] {
  if (typeof child === 'function') {
    return buildChild(context, child(context));
  } else if ((typeof child === 'string' && child.trim() !== '') || typeof child === 'number') {
    return [vnode(undefined, undefined, undefined, String(child), undefined)];
  } else if (child instanceof Component || child instanceof Fragment) {
    if (child instanceof Component) child.onContext(context);
    return child.render(context);
  } else if (!!child && typeof (child as VNode).sel === 'string') {
    return [child] as VNode[];
  }
  return [];
}

export function buildChildren(context: Context, children: ChildType[]): VNode[] {
  const builtChildren = [] as VNode[];
  children.forEach((child) => builtChildren.push(...buildChild(context, child)));
  return builtChildren;
}

/* eslint-enable */
