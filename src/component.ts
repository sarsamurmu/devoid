import { anyComp, EventManager } from './utils';
import { patch } from './render';
import { Context } from './context';
import { StrutNode } from './strutNode';
import { PrimaryComponent } from './elements';

type compNodeTypes = StrutNode | (string | number | StrutNode)[];

abstract class Component {
  context: Context;
  child: anyComp;
  strutNode: compNodeTypes;
  eventManager: EventManager;

  constructor() {
    this.eventManager = new EventManager();
  }

  /* eslint-disable @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars */

  setState(callback: () => void = () => {}) {
    if (callback) callback();
    this.rebuild();
  }

  rebuild(): void {
    if (Array.isArray(this.strutNode)) return this.child.rebuild();
    patch(this.strutNode as StrutNode, this.render(this.context) as StrutNode);
  }

  didMount() {}

  didUpdate() {}

  didDestroy() {}


  static create(props: Record<string, any>): Component {
    return null
  }

  /* eslint-enable */

  abstract build(context: Context): anyComp;

  render(context: Context): compNodeTypes {
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
    this.strutNode = this.child.render(context);
    return this.strutNode;
  }
}

export { Component }
