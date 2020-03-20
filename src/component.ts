import { anyComp, EventManager } from './utils';
import { patch, updateChildren } from './render';
import { Context } from './context';
import { VNode } from 'snabbdom/es/vnode';

abstract class Component {
  context: Context;
  child: anyComp;
  vNode: VNode | VNode[];
  eventManager: EventManager;

  constructor() {
    this.eventManager = new EventManager();
  }

  rebuild() {
    if (Array.isArray(this.vNode)) { // Children is probably fragment so use different method
      const newChildren = this.render(this.context, false) as VNode[];
      const oldChildren: VNode[] = this.vNode.length === 1 && this.vNode[0].sel === '!' ? [] : this.vNode;
      updateChildren(this.vNode[0].elm.parentElement, oldChildren, newChildren);
      // Apparently updateChildren can't replace comment nodes so do it manually
      if (oldChildren.length === 0) this.vNode[0].elm.parentElement.removeChild(this.vNode[0].elm);
      this.vNode = newChildren;
    } else {
      const newChildren = this.render(this.context, false) as VNode;
      patch(this.vNode, newChildren);
      this.vNode = newChildren;
    }
  }

  /* eslint-disable @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars */

  setState(callback: () => void = () => {}) {
    if (callback) callback();
    this.rebuild();
  }

  didMount() {}

  didUpdate() {}

  didDestroy() {}


  static create(props: Record<string, any>): Component {
    return null
  }

  /* eslint-enable */

  abstract build(context: Context): anyComp;

  render(context: Context, setVNode = true): VNode | VNode[] {
    this.context = context;
    this.child = this.build(context);
    if (this.child.eventManager) {
      this.child.eventManager.set('mount', this, () => {
        this.didMount();
        this.eventManager.trigger('mount');
      });
      this.child.eventManager.set('update', this, () => {
        this.didUpdate();
        this.eventManager.trigger('update');
      });
      this.child.eventManager.set('destroy', this, () => {
        this.didUpdate();
        this.eventManager.trigger('destroy');
        this.child.eventManager.removeKey(this);
      });
    }
    if (setVNode) this.vNode = this.child.render(context);
    return setVNode ? this.vNode : this.child.render(context);
  }
}

export { Component }
