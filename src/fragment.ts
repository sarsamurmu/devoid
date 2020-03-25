import { buildChildren, EventManager, generateUniqueId } from './utils';
import { Context } from './context';
import { ChildrenArray } from './elements';
import vnode from 'snabbdom/es/vnode';

export class Fragment {
  private children: ChildrenArray;
  private fallbackData: {
    hook: {
      insert: () => void;
      destroy: () => void;
    };
    eventManager: EventManager;
  };

  constructor(children: ChildrenArray) {
    this.children = children;
    const evM = new EventManager();
    this.fallbackData = {
      hook: {
        insert: () => evM.trigger('mount'),
        destroy: () => evM.trigger('destroy'),
      },
      eventManager: evM,
    }
  }

  static create({ children }: { children: ChildrenArray }) {
    return new Fragment(children);
  }

  render(context: Context) {
    const vNodes = buildChildren(context, this.children);
    // If VNodes is empty array replace it with a array of comment DVNode to store it's position
    if (vNodes.length === 0) vNodes.push(vnode('!', { key: generateUniqueId() }, undefined, 'dFrag', undefined));
    if (!vNodes[0].data) vNodes[0].data = {};
    Object.assign(vNodes[0].data, this.fallbackData);
    return vNodes;
  }
}
