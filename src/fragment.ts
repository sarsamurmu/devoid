import { anyComp, buildChildren, EventManager } from './utils';
import { Context } from './context';

export class Fragment {
  context: Context;
  children: anyComp[];
  eventManager: EventManager;
  mountedChildren: number;

  constructor(children: anyComp[]) {
    this.children = children;
    this.eventManager = new EventManager;
    this.mountedChildren = 0;

    for (const child of children) {
      child.eventManager.set('mount', this, () => {
        this.mountedChildren++;
        if (this.mountedChildren === this.children.length) this.eventManager.trigger('mount');
      });
      child.eventManager.set('destroy', this, () => {
        this.mountedChildren--;
        child.eventManager.removeKey(this);
      })
    }
  }

  rebuild() {
    for (const child of this.children) child.rebuild();
  }

  build(context: Context) {
    return buildChildren(context, this.children);
  }

  render(context: Context) {
    return this.build(context);
  }
}
