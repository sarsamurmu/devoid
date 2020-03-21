import { anyComp } from './utils';
import { patch, updateChildren } from './render';
import { Context } from './context';
import { VNode } from 'snabbdom/es/vnode';

const emptyFun = () => 1;

interface Hooks {
  insert: () => void;
  update: () => void;
  destroy: () => void;
}

abstract class Component {
  context: Context;
  vNode: VNode | VNode[];
  hooks: Hooks;
  mounted: boolean;

  rebuild() {
    if (Array.isArray(this.vNode)) { // Children is probably fragment so use different method
      const newChildren = this.render(this.context, false) as VNode[];
      const oldChildren: VNode[] = this.vNode.length === 1 && this.vNode[0].sel === '!' ? [] : this.vNode;
      updateChildren({
        parentElm: this.vNode[0].elm.parentElement,
        oldCh: oldChildren,
        newCh: newChildren,
        insertBefore: this.vNode[this.vNode.length - 1].elm.nextSibling
      });
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
    const vNode = this.build(context).render(context);
    const aVNode = Array.isArray(vNode) ? vNode[0] : vNode;
    if (aVNode.data) {
      if (!aVNode.data.hook) aVNode.data.hook = {};
      if (!this.hooks) {
        const prevInsertHook = (aVNode.data.hook.insert || emptyFun) as () => void;
        const prevUpdateHook = (aVNode.data.hook.update || emptyFun) as () => void;
        const prevDestroyHook = (aVNode.data.hook.destroy || emptyFun) as () => void;
        this.hooks = {
          insert: () => {
            prevInsertHook();
            this.didMount();
          },
          update: () => {
            prevUpdateHook();
            this.didUpdate();
          },
          destroy: () => {
            prevDestroyHook();
            this.didDestroy();
          }
        }
      }
      aVNode.data.hook = this.hooks;
    }
    if (setVNode) this.vNode = vNode;
    return vNode;
  }
}

export { Component }
