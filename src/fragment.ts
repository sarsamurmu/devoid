import { anyComp, buildChildren, EventManager } from './utils';
import { Context } from './context';
import { DevetoNode } from './devetoNode';

export class Fragment {
  context: Context;
  children: anyComp[];
  eventManager: EventManager;
  devetoNodes: DevetoNode[];

  constructor(children: anyComp[]) {
    this.children = children;
    this.eventManager = new EventManager();

    for (const child of children) {
      if (child.eventManager) {
        child.eventManager.set('mount', this, () => {
          this.eventManager.trigger('mount');
        });
        child.eventManager.set('destroy', this, () => {
          child.eventManager.removeKey(this);
        })
      }
    }
  }

  build(context: Context) {
    return buildChildren(context, this.children);
  }

  render(context: Context) {
    this.devetoNodes = this.build(context);
    return this.devetoNodes;
  }
}
