import { anyComp, EventManager } from './utils';
import { patch, updateChildren } from './render';
import { Context } from './context';
import { DevetoNode } from './devetoNode';

abstract class Component {
  context: Context;
  child: anyComp;
  devetoNode: DevetoNode | DevetoNode[];
  eventManager: EventManager;

  constructor() {
    this.eventManager = new EventManager();
  }

  rebuild() {
    if (Array.isArray(this.devetoNode)) { // Children is probably fragment so use different method
      const newChildren = this.render(this.context, false) as DevetoNode[];
      updateChildren(this.devetoNode[0].elm.parentElement, this.devetoNode, newChildren);
      this.devetoNode = newChildren;
    } else {
      const newChildren = this.render(this.context, false) as DevetoNode;
      patch(this.devetoNode, newChildren);
      this.devetoNode = newChildren;
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

  render(context: Context, setDevetoNode = true): DevetoNode | DevetoNode[] {
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
    if (setDevetoNode) this.devetoNode = this.child.render(context);
    return setDevetoNode ? this.devetoNode : this.child.render(context);
  }
}

export { Component }
