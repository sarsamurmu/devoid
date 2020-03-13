import { anyComp, buildChildren, EventManager } from './utils';
import { Context } from './context';
import { DuzeNode } from './duzeNode';

export class Fragment {
  context: Context;
  children: anyComp[];
  duzeNodes: DuzeNode[];
  eventManager: EventManager;

  constructor(children: anyComp[]) {
    this.children = children;
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
