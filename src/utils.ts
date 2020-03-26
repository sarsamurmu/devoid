import { Component } from './component';
import { PrimaryComponent, ChildrenArray, ChildType } from './elements';
import { Context } from './context';
import { Fragment } from './fragment';
import vnode, { VNode } from 'snabbdom/es/vnode';

export type AnyComp = Component | PrimaryComponent | Fragment;

/* global console, process */

export const debug = process.env.NODE_ENV !== 'production';
export const log = console.log.bind(console);

export class EventManager {
  private events: Map<string, Map<any, () => void>>;

  set(eventName: string, key: any, callback: () => void) {
    if (!this.events) this.events = new Map();
    if (!this.events.has(eventName)) this.events.set(eventName, new Map());
    this.events.get(eventName).set(key, callback);
  }

  removeKey(key: any) {
    if (this.events) this.events.forEach((eventMap) => eventMap.delete(key));
  }

  trigger(eventName: string) {
    if (!this.events) return;
    const callbacks = this.events.get(eventName);
    if (callbacks) callbacks.forEach((callback) => callback())
  }
}

const addAll = (set: Set<any>, toAdd: any[]) => {
  for (const item of toAdd) set.add(item);
}

/* eslint-disable @typescript-eslint/no-use-before-define */

function buildChild(context: Context, child: ChildType): VNode[] {
  if (typeof child === 'function') {
    return buildChild(context, child(context));
  } else if (Array.isArray(child)) {
    return buildChildren(context, child);
  } else if ((typeof child === 'string' && child.trim() !== '') || typeof child === 'number') {
    return [vnode(undefined, undefined, undefined, String(child), undefined)];
  } else if (child instanceof Component || child instanceof PrimaryComponent || child instanceof Fragment) {
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

let idTemp: string;
export const generateUniqueId = () => (idTemp || (idTemp = Array(16).fill(' ').join(''))).replace(/[ ]/g, () => (Math.random() * 16 | 0).toString(16));

export const every = <T>(array: T[], testFunction: (item: T) => boolean) => {
  for (const item of array) if (!testFunction(item)) return false;
  return true;
}
