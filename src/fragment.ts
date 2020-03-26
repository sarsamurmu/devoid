import { buildChildren, generateUniqueId } from './utils';
import { Context } from './context';
import { ChildrenArray } from './elements';
import vnode from 'snabbdom/es/vnode';

export class Fragment {
  private children: ChildrenArray;

  constructor(children: ChildrenArray) {
    this.children = children;
  }

  static create({ children }: { children: ChildrenArray }) {
    return new Fragment(children);
  }

  render(context: Context) {
    const vNodes = buildChildren(context, this.children);
    // If VNodes is empty array replace it with a array of comment VNode to store it's position
    if (vNodes.length === 0) vNodes.push(vnode('!', { key: generateUniqueId() }, undefined, 'dFrag', undefined));
    return vNodes;
  }
}
