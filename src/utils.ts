import { Component } from './component';
import { PrimaryComponent, ChildrenArray } from './elements';
import { Context } from './context';
import { DuzeNode } from './duzeNode';
import { Fragment } from './fragment';

export type anyComp = Component | PrimaryComponent | Fragment;

const debug = window.location.hostname === 'localhost';
export const log = (...data: any): any => {
  if (debug) console.log(...data);
}

const addAll = (set: Set<any>, toAdd: any[]) => {
  for (const item of toAdd) set.add(item);
}

export const buildChildren = (context: Context, childrenArray: ChildrenArray) => {
  const children = new Set<DuzeNode | string | number>();
  for (const child of childrenArray.flat(Infinity)) {
    switch (true) {
      case typeof child === 'function':
        const built = (child as (((context: Context) => anyComp)))(context);
        if (typeof built === 'string') children.add(built);
        if (Array.isArray(built)) addAll(children, buildChildren(context, built));
        if (built instanceof Component || built instanceof PrimaryComponent) {
          addAll(children, [(built as anyComp).render(context)].flat(Infinity));
        }
        break;

      case child instanceof Component || child instanceof PrimaryComponent:
        addAll(children, [(child as anyComp).render(context)].flat(Infinity));
        break;

      case child instanceof Fragment:
        addAll(children, [(child as anyComp).render(context)].flat(Infinity));
        break;
      
      case typeof child === 'string' || typeof child === 'number':
        children.add(child as string | number);
        break;
    }
  }
  return [...children];
}

export class EventManager {
  events: Map<string, Map<any, () => void>>;

  constructor() {
    this.events = new Map();
  }

  set(eventName: string, key: any, callback: () => void) {
    if (!this.events.has(eventName)) this.events.set(eventName, new Map());
    const currEvent = this.events.get(eventName);
    currEvent.set(key, callback);
  }

  removeKey(key: any) {
    this.events.forEach((eventMap) => eventMap.delete(key));
  }

  trigger(eventName: string) {
    const callbacks = this.events.get(eventName);
    if (callbacks) callbacks.forEach((callback) => callback())
  }
}
