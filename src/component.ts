import { AnyComp, log } from './utils';
import { patch, updateChildren } from './render';
import { Context } from './context';
import { VNode } from 'snabbdom/es/vnode';

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
    const aVNode = Array.isArray(vNode) ? vNode[0] : vNode;
    if (aVNode.data && aVNode.data.eventManager) {
      aVNode.data.eventManager.set('mount', this, () => {
        this.mounted = true;
        this.didMount();
      });
      aVNode.data.eventManager.set('update', this, () => {
        this.didUpdate();
      });
      aVNode.data.eventManager.set('destroy', this, () => {
        this.mounted = false;
        this.didDestroy();
        aVNode.data.eventManager.removeKey(this);
      });
    }
    if (setVNode) this.vNode = vNode;
    return vNode;
  }
}
