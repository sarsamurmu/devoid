import { buildChildren, EventManager } from './utils';
import { Context } from './context';
import { ChildType } from './elements';
import vnode, { VNode } from 'snabbdom/es/vnode';

export class Fragment {
  context: Context;
  children: ChildType[];
  eventManager: EventManager;
  vNodes: VNode[];

  constructor(children: ChildType[]) {
    this.children = children;
    this.eventManager = new EventManager();

    for (const child of children) {
      if ((child as any).eventManager) {
        (child as any).eventManager.set('mount', this, () => {
          this.eventManager.trigger('mount');
        });
        (child as any).eventManager.set('destroy', this, () => {
          (child as any).eventManager.removeKey(this);
        })
      }
    }
  }

  build(context: Context) {
    return buildChildren(context, this.children);
  }

  render(context: Context) {
    this.vNodes = this.build(context);
    // If VNodes is empty array replace it with a array of comment VNode to store it's position
    if (this.vNodes.length === 0) this.vNodes = [vnode('!', undefined, undefined, `Fragment Placeholder ${Date.now()}`, undefined)];
    return this.vNodes;
  }
}
