import { AnyComp, EventManager } from './utils';
import { patch, updateChildren } from './render';
import { Context } from './context';
import { VNode } from 'snabbdom/es/vnode';

export const FLAG_STATELESS = 1;

export abstract class Component {
  protected context: Context;
  protected vNode: VNode | VNode[];
  protected mounted = false;
  protected shouldSetVNode = true;
  private readonly _flags: number;
  private _mountedVNodeCount = 0;

  constructor(flags = 0) {
    this._flags = flags;
  }

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
    const vNode = this.build(this.context).render(this.context);
    if (this._flags & FLAG_STATELESS) return vNode;

    const onMount = () => {
      if (this.mounted) return;
      this.mounted = true;
      this.didMount();
    }
    const onDestroy = () => {
      if (!this.mounted) return;
      this.mounted = false;
      this.didDestroy();
    }

    if (!Array.isArray(vNode)) {
      const eventManager = vNode.data.eventManager as EventManager;
      eventManager.add('mount', () => onMount(), this);
      eventManager.add('update', () => this.didUpdate(), this);
      eventManager.add('destroy', () => {
        onDestroy();
        eventManager.removeKey(this);
      }, this);
    } else {
      for (const aVNode of vNode) {
        const eventManager = aVNode.data.eventManager as EventManager;
        eventManager.add('mount', () => {
          if (++this._mountedVNodeCount === (this.vNode as VNode[]).length) onMount();
        }, this);
        eventManager.add('destroy', () => {
          if (--this._mountedVNodeCount === 0) {
            onDestroy();
            eventManager.removeKey(this);
          }
        }, this);
      }
    }

    if (this.shouldSetVNode) this.vNode = vNode;
    return vNode;
  }
}
