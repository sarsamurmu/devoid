import { AnyComp, every, log, EventManager } from './utils';
import { patch, updateChildren } from './render';
import { Context } from './context';
import { VNode } from 'snabbdom/es/vnode';

/* global MutationObserver */

const observerMap = new Map<Node, MutationObserver>();
const callbackMap = new Map<Node, Map<any, () => void>>();

const addObserver = (target: Node, key: any, callback: () => void) => {
  if (!observerMap.has(target)) {
    observerMap.set(target, new MutationObserver(() => callbackMap.get(target).forEach((callback) => callback())));
    observerMap.get(target).observe(target, {
      childList: true,
      subtree: true,
    });
  }
  if (!callbackMap.has(target)) callbackMap.set(target, new Map());
  callbackMap.get(target).set(key, callback);
}

const removeObserver = (target: Node, key: any) => {
  const currCallbackMap = callbackMap.get(target);
  currCallbackMap.delete(key);
  if (currCallbackMap.size === 0) {
    observerMap.get(target).disconnect();
    observerMap.delete(target);
    callbackMap.delete(target);
  }
}

export abstract class Component {
  protected context: Context;
  protected vNode: VNode | VNode[];
  protected mounted = false;
  protected shouldSetVNode = true;

  rebuild() {
    if (!this.mounted) return;
    this.shouldSetVNode = false;
    if (Array.isArray(this.vNode)) { // Children is probably fragment so use different method
      const newChildren = this.render(this.context) as VNode[];
      const oldChildren = this.vNode;
      updateChildren({
        parentElm: oldChildren[0].elm.parentElement,
        oldCh: oldChildren,
        newCh: newChildren,
        insertBefore: oldChildren[oldChildren.length - 1].elm.nextSibling,
      });
      this.vNode = newChildren;
    } else {
      const newChildren = this.render(this.context) as VNode;
      patch(this.vNode, newChildren);
      this.vNode = newChildren;
    }
    this.shouldSetVNode = true;
  }

  setState(callback: () => void) {
    if (callback) callback();
    this.rebuild();
  }

  /* eslint-disable @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars */

  didMount() {}

  didUpdate() {}

  didDestroy() {}

  static create(props: Record<string, any>): Component {
    return null
  }

  /* eslint-enable */

  onContext(context: Context) {
    this.context = context;
  }

  abstract build(context: Context): AnyComp;

  render(context: Context): VNode | VNode[] {
    const vNode = this.build(context).render(context);
    if (!Array.isArray(vNode)) {
      const eventManager = vNode.data.eventManager as EventManager;
      eventManager.add('mount', () => {
        if (this.mounted) return;
        this.mounted = true;
        this.didMount();
      }, this);
      eventManager.add('update', () => {
        this.didUpdate();
      }, this);
      eventManager.add('destroy', () => {
        if (!this.mounted) return;
        this.mounted = false;
        this.didDestroy();
        eventManager.removeKey(this);
      }, this);
    } else {
      const rootEl = context.get<Node>('rootEl');
      addObserver(rootEl, this, () => {
        const vNodes = this.vNode as VNode[];
        if (every(vNodes, (aVNode) => rootEl.contains(aVNode.elm))) {
          if (!this.mounted) {
            this.mounted = true;
            this.didMount();
          }
        } else {
          if (this.mounted) {
            this.mounted = false;
            this.didDestroy();
            removeObserver(rootEl, this);
          }
        }
      });
    }
    if (this.shouldSetVNode) this.vNode = vNode;
    return vNode;
  }
}
