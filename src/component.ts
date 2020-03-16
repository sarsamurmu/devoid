import { anyComp, EventManager } from './utils';
import { patch, updateChildren } from './render';
import { Context } from './context';
import { StrutNode } from './strutNode';

abstract class Component {
  context: Context;
  child: anyComp;
  strutNode: StrutNode | StrutNode[];
  eventManager: EventManager;

  constructor() {
    this.eventManager = new EventManager();
  }

  rebuild() {
    if (Array.isArray(this.strutNode)) { // Children is probably fragment so use different method
      const newChildren = this.render(this.context, false) as StrutNode[];
      updateChildren(this.strutNode[0].elm.parentElement, this.strutNode, newChildren);
      this.strutNode = newChildren;
    } else {
      const newChildren = this.render(this.context, false) as StrutNode;
      patch(this.strutNode, newChildren);
      this.strutNode = newChildren;
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

  render(context: Context, setStrutNode = true): StrutNode | StrutNode[] {
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
    if (setStrutNode) this.strutNode = this.child.render(context);
    return setStrutNode ? this.strutNode : this.child.render(context);
  }
}

export { Component }
