import { buildChildren } from './utils';
import { Context } from './context';
import { ChildrenArray } from './elements';
import vnode, { VNode } from 'snabbdom/es/vnode';

export class Fragment {
  private children: ChildrenArray;
  private vNodes: VNode[];

  constructor(children: ChildrenArray) {
    this.children = children;
  }

  static create({ children }: { children: ChildrenArray }) {
    return new Fragment(children);
  }

  build(context: Context) {
    return buildChildren(context, this.children);
  }

  render(context: Context) {
    this.vNodes = this.build(context);
    // If VNodes is empty array replace it with a array of comment DVNode to store it's position
    if (this.vNodes.length === 0) this.vNodes = [vnode('!', undefined, undefined, `Empty Frag ${Date.now()}`, undefined)];
    return this.vNodes;
  }
}
