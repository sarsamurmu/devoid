import { Component } from './component';
import { PrimaryComponent, ChildrenArray, ChildType } from './elements';
import { Context } from './context';
import { Fragment } from './fragment';
import vnode, { VNode } from 'snabbdom/es/vnode';

export type AnyComp = Component | PrimaryComponent | Fragment;

/* global console, process */

export const debug = process.env.NODE_ENV !== 'production';
export const log = console.log.bind(console);
export const warn = (message: string) => console.warn(`[Devoid]: ${message}`);

export const isCompatibleComp = (component: any) => component instanceof Component || component instanceof PrimaryComponent || component instanceof Fragment;

let idTemp: string;
export const generateUniqueId = () => (idTemp || (idTemp = Array(16).fill(' ').join(''))).replace(/[ ]/g, () => (Math.random() * 16 | 0).toString(16));

export const every = <T>(array: T[], testFunction: (item: T) => boolean) => {
  for (const item of array) if (!testFunction(item)) return false;
  return true;
}

export const includes = <T>(array: T[], whichItem: T) => {
  for (const item of array) if (item === whichItem) return true;
  return false;
}

export const any = <T>(array: T[], testFunction: (item: T) => boolean) => {
  for (const item of array) if (testFunction(item)) return true;
  return false;
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

const addAll = (set: Set<any>, toAdd: any[]) => {
  for (const item of toAdd) set.add(item);
}

/* eslint-disable @typescript-eslint/no-use-before-define */

function buildChild(context: Context, child: ChildType | ChildrenArray): VNode[] {
  if (typeof child === 'function') {
    return buildChild(context, child(context));
  } else if (Array.isArray(child)) {
    return buildChildren(context, child);
  } else if ((typeof child === 'string' && child.trim() !== '') || typeof child === 'number') {
    return [vnode(undefined, undefined, undefined, String(child), undefined)];
  } else if (child instanceof Component || child instanceof PrimaryComponent || child instanceof Fragment) {
    if (child instanceof Component) child.onContext(context);
    return [child.render(context)].flat(Infinity);
  }
  return [];
}

export function buildChildren(context: Context, childrenArray: ChildrenArray): VNode[] {
  const children = new Set<VNode>();
  for (const child of childrenArray.flat(Infinity)) addAll(children, buildChild(context, child));
  return [...children];
}

/* eslint-enable */
