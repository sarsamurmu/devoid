import { AnyComp, every } from './utils';
import { patch, updateChildren } from './render';
import { Context } from './context';
import { VNode } from 'snabbdom/es/vnode';

/* global MutationObserver */

const observerMap = new Map<Node, MutationObserver>();
const callbackMap = new Map<Node, Map<any, () => void>>();
const connectedMap = new Map<Node, boolean>();

const addObserver = (target: Node, key: any, callback: () => void) => {
  if (!observerMap.has(target)) observerMap.set(target, new MutationObserver(() => callbackMap.get(target).forEach((callback) => callback())));
  if (!connectedMap.has(target)) {
    observerMap.get(target).observe(target, {
      childList: true,
      subtree: true,
    });
    connectedMap.set(target, true);
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
    connectedMap.delete(target);
  }
}

export abstract class Component {
  protected context: Context;
  protected vNode: VNode | VNode[];
  protected mounted: boolean;

  rebuild() {
    if (Array.isArray(this.vNode)) { // Children is probably fragment so use different method
      const newChildren = this.render(this.context, false) as VNode[];
      const oldChildren = this.vNode;
      updateChildren({
        parentElm: oldChildren[0].elm.parentElement,
        oldCh: oldChildren,
        newCh: newChildren,
        insertBefore: oldChildren[oldChildren.length - 1].elm.nextSibling,
      });
      this.vNode = newChildren;
    } else {
      const newChildren = this.render(this.context, false) as VNode;
      patch(this.vNode, newChildren);
      this.vNode = newChildren;
    }
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

  abstract build(context: Context): AnyComp;

  render(context: Context, setVNode = true): VNode | VNode[] {
    this.context = context;
    const vNode = this.build(context).render(context);
    if (!Array.isArray(vNode)) {
      vNode.data.eventManager.set('mount', this, () => {
        if (this.mounted) return;
        this.mounted = true;
        this.didMount();
      });
      vNode.data.eventManager.set('update', this, () => {
        this.didUpdate();
      });
      vNode.data.eventManager.set('destroy', this, () => {
        if (!this.mounted) return;
        this.mounted = false;
        this.didDestroy();
        vNode.data.eventManager.removeKey(this);
      });
    } else {
      const rootEl = context.get<Node>('rootEl');
      addObserver(rootEl, this, () => {
        const vNodes = this.vNode as VNode[];
        const alreadyMounted = this.mounted;
        if (every(vNodes, (aVNode) => rootEl.contains(aVNode.elm))) {
          if (!alreadyMounted) {
            this.mounted = true;
            this.didMount();
          }
        } else {
          if (alreadyMounted) {
            this.mounted = false;
            this.didDestroy();
            removeObserver(rootEl, this);
          }
        }
      })
    }
    if (setVNode) this.vNode = vNode;
    return vNode;
  }
}
