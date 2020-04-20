import { DevoidComponent } from './component';
import { Context } from './context';
import vnode, { VNode } from 'snabbdom/es/vnode';

export interface FC {
  (...args: any[]): DevoidComponent;
  jsx(props: Record<string, any>): DevoidComponent;
}

export type ChildType = DevoidComponent | string | number | false;

/* global console, process */

export const debug = process.env.NODE_ENV !== 'production';
export const log = console.log.bind(console);
/* istanbul ignore next */
export const warn = (...data: any) => console.warn('[Devoid]:', ...data);

export const generateUniqueId = () => '               '.replace(/[ ]/g, () => (Math.random() * 16 | 0).toString(16));
export const copyMap = <K, V>(from: Map<K, V>, to: Map<K, V>) => from.forEach((value, key) => to.set(key, value));

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
  if ((typeof child === 'string' && child.trim() !== '') || typeof child === 'number') {
    return [vnode(undefined, undefined, undefined, String(child), undefined)];
  } else if (child && typeof (child as DevoidComponent).render === 'function') {
    const ch = child as DevoidComponent;
    return ch.render(context);
  }
  return [];
}

export function buildChildren(context: Context, children: ChildType[]): VNode[] {
  const builtChildren = [] as VNode[];
  children.forEach((child) => builtChildren.push(...buildChild(context, child)));
  return builtChildren;
}

/* eslint-enable */

const keyMap = new Map();

export const createKey = (key: string) => [[key]];

export const globalKey = (key: string) => {
  if (keyMap.has(key)) return keyMap.get(key);
  const symbol = [[key]];
  keyMap.set(key, symbol);
  return symbol;
}

export const isObject = (data: any) => !!data && data.constructor === Object;

const isObjectOrArray = (data: any) => isObject(data) || Array.isArray(data);

export const deepClone = <T extends Record<string, any> | any[]>(data: T) => {
  const clone = Array.isArray(data) ? [] : {};
  if (Array.isArray(data)) {
    data.forEach((value: any, index: number) => {
      (clone as any[])[index] = isObjectOrArray(value) ? deepClone(value) : value;
    })
  } else {
    for (const key in data) {
      const value = (data as Record<string, any>)[key];
      (clone as Record<string, any>)[key] = isObjectOrArray(value) ? deepClone(value) : value;
    }
  }
  return clone as T;
}

export const mergeProperties = (source: Record<string, any>, target: Record<string, any>, shouldClone = false) => {
  for (const key in target) {
    if (isObject(source[key]) && isObject(target[key])) {
      mergeProperties(source[key], target[key]);
    } else {
      source[key] = shouldClone && isObjectOrArray(target[key]) ? deepClone(target[key]) : target[key];
    }
  }
}
