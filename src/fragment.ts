import { anyComp, buildChildren, EventManager } from './utils';
import { Context } from './context';
import { StrutNode } from './strutNode';

export class Fragment {
  context: Context;
  children: anyComp[];
  eventManager: EventManager;
  strutNodes: StrutNode[];

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
    this.strutNodes = this.build(context);
    return this.strutNodes;
  }
}
