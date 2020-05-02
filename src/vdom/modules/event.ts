import { VNode, VNodeData } from '../vnode';
import { Module } from './module';

export type On = {
  [N in keyof HTMLElementEventMap]?: (ev: HTMLElementEventMap[N]) => void
} & {
  [event: string]: EventListener;
};

type Handler = {
  vNode?: VNode;
}

const invokeHandler = (handler: any, vNode?: VNode, event?: Event) => {
  if (typeof handler === 'function') {
    // call function handler
    handler.call(vNode, event, vNode);
  } else if (typeof handler === 'object') {
    // call handler with arguments
    if (typeof handler[0] === 'function') {
      // special case for single argument for performance
      if (handler.length === 2) {
        handler[0].call(vNode, handler[1], event, vNode);
      } else {
        const args = handler.slice(1);
        args.push(event);
        args.push(vNode);
        handler[0].apply(vNode, args);
      }
    } else {
      // call multiple handlers
      for (let i = 0; i < handler.length; i++) {
        invokeHandler(handler[i], vNode, event);
      }
    }
  }
}

const handleEvent = (event: Event, vNode: VNode) => {
  const name = event.type;
  const on = (vNode.data as VNodeData).on;

  // call event handler(s) if exists
  if (on && on[name]) {
    invokeHandler(on[name], vNode, event);
  }
}

const createListener = () => {
  return function handler(event: Event) {
    handleEvent(event, (handler as Handler).vNode);
  }
}

const updateEventListeners = (oldVNode: VNode, vNode?: VNode) => {
  const oldOn = (oldVNode.data as VNodeData).on;
  const oldListener = (oldVNode as any).listener;
  const oldElm: Element = oldVNode.elm as Element;
  const on = vNode && (vNode.data as VNodeData).on;
  const elm: Element = (vNode && vNode.elm) as Element;
  let name: string;

  // optimization for reused immutable handlers
  if (oldOn === on) {
    return;
  }

  // remove existing listeners which no longer used
  if (oldOn && oldListener) {
    // if element changed or deleted we remove all existing listeners unconditionally
    if (!on) {
      for (name in oldOn) {
        // remove listener if element was changed or existing listeners removed
        oldElm.removeEventListener(name, oldListener, false);
      }
    } else {
      for (name in oldOn) {
        // remove listener if existing listener removed
        if (!on[name]) {
          oldElm.removeEventListener(name, oldListener, false);
        }
      }
    }
  }

  // add new listeners which has not already attached
  if (on) {
    // reuse existing listener or create new
    const listener = (vNode as any).listener = (oldVNode as any).listener || createListener();
    // update vnode for listener
    (listener as Handler).vNode = vNode;

    // if element changed or added we add all needed listeners unconditionally
    if (!oldOn) {
      for (name in on) {
        // add listener if element was changed or new listeners added
        elm.addEventListener(name, listener, false);
      }
    } else {
      for (name in on) {
        // add listener if new listener added
        if (!oldOn[name]) {
          elm.addEventListener(name, listener, false);
        }
      }
    }
  }
}

export const eventModule: Module = {
  create: updateEventListeners,
  update: updateEventListeners,
  destroy: updateEventListeners
}
