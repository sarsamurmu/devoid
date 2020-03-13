import { anyComp, EventManager } from './utils';
import { patch } from './render';
import { Context } from './context';
import { DuzeNode } from './duzeNode';

type compNodeTypes = DuzeNode | (string | number | DuzeNode)[];

abstract class Component {
  context: Context;
  child: anyComp;
  duzeNode: compNodeTypes;
  eventManager: EventManager;

  constructor() {
    this.eventManager = new EventManager();
  }

  setState(callback: () => void = () => {}) {
    callback();
    this.rebuild();
  }

  rebuild(): void {
    if (Array.isArray(this.duzeNode)) return this.child.rebuild();
    patch(this.duzeNode as DuzeNode, this.render(this.context) as DuzeNode);
  }

  didMount() {}

  didUpdate() {}

  didDestroy() {}

  static create(props: Record<string, any>): Component {
    return null
  }

  abstract build(context: Context): anyComp;

  render(context: Context): compNodeTypes {
    this.context = context;
    this.child = this.build(context);
    if (this.child.eventManager) {
      this.child.eventManager.set('mount', this, () => {
        this.didMount.bind(this)();
        this.eventManager.trigger('mount');
      });
      this.child.eventManager.set('update', this, () => {
        this.didUpdate.bind(this)();
        this.eventManager.trigger('update');
      });
      this.child.eventManager.set('destroy', this, () => {
        this.didUpdate.bind(this)();
        this.eventManager.trigger('destroy');
        this.child.eventManager.removeKey(this);
      });
    }
    this.duzeNode = this.child.render(context)
    return this.duzeNode;
  }
}

export { Component }
