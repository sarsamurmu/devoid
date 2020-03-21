import { Component } from './component';
import { PrimaryComponent, ChildrenArray } from './elements';
import { Context } from './context';
import { Fragment } from './fragment';
import vnode, { VNode } from 'snabbdom/es/vnode';

export type anyComp = Component | PrimaryComponent | Fragment;

/* global window, console */

const debug = window.location.hostname === 'localhost';
export const log = (...data: any): any => {
  if (debug) console.log(...data);
}

export class EventManager {
  events: Map<string, Map<any, () => void>>;

  set(eventName: string, key: any, callback: () => void) {
    if (!this.events) this.events = new Map();
    if (!this.events.has(eventName)) this.events.set(eventName, new Map());
    const currEvent = this.events.get(eventName);
    currEvent.set(key, callback);
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

const textVNode = (text: string | number) => {
  const eventManager = new EventManager();

  return vnode(undefined, {
    hook: {
      insert: () => {
        eventManager.trigger('mount');
      },
      update: () => eventManager.trigger('update'),
      destroy: () => eventManager.trigger('destroy'),
    },
    eventManager
  }, undefined, text + '', undefined)
}

export const buildChildren = (context: Context, childrenArray: ChildrenArray) => {
  const children = new Set<VNode>();
  for (const child of childrenArray.flat(Infinity)) {
    let built;
    switch (true) {
      case typeof child === 'function':
        built = (child as (((context: Context) => anyComp)))(context);
        if ((typeof built === 'string' && (built as string).trim() !== '') || typeof built === 'number') children.add(textVNode(built));
        if (Array.isArray(built)) addAll(children, buildChildren(context, built));
        if (built instanceof Component || built instanceof PrimaryComponent) {
          addAll(children, [(built as anyComp).render(context)].flat(Infinity));
        }
        if (built instanceof Fragment) addAll(children, [(built as anyComp).render(context)].flat(Infinity));
        break;

      case child instanceof Component || child instanceof PrimaryComponent:
        addAll(children, [(child as anyComp).render(context)].flat(Infinity));
        break;

      case child instanceof Fragment:
        addAll(children, [(child as anyComp).render(context)].flat(Infinity));
        break;
      
      case (typeof child === 'string' && (child as string).trim() !== '') || typeof child === 'number':
        children.add(textVNode(child));
        break;
    }
  }
  return [...children];
}
