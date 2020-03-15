import { anyComp, buildChildren, EventManager } from './utils';
import { Context } from './context';
import { StrutNode } from './strutNode';
import { updateChildren } from './render';

export class Fragment {
  context: Context;
  children: anyComp[];
  eventManager: EventManager;
  mountedChildren: number;
  strutNodes: StrutNode[];

  constructor(children: anyComp[]) {
    this.children = children;
    this.eventManager = new EventManager;
    this.mountedChildren = 0;

    for (const child of children) {
      if (child.eventManager) {
        child.eventManager.set('mount', this, () => {
          if (++this.mountedChildren === this.children.length) this.eventManager.trigger('mount');
        });
        child.eventManager.set('destroy', this, () => {
          this.mountedChildren--;
          child.eventManager.removeKey(this);
        })
      }
    }
  }

  rebuild() {
    const newChildren = this.build(this.context);
    const insertedVnodeQueue: StrutNode[] = [];
    updateChildren(this.strutNodes[0].elm.parentElement, this.strutNodes, newChildren, insertedVnodeQueue);
    this.strutNodes = newChildren;
    for (const insertedVNode of insertedVnodeQueue) {
      insertedVNode.data!.hook!.insert!(insertedVNode);
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
