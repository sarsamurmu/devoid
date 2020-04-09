import { buildChildren, generateUniqueId, EventManager } from './utils';
import { Context } from './context';
import { ChildType } from './element';
import vnode from 'snabbdom/es/vnode';

const createVNodeData = () => {
  const eventManager = new EventManager();
  return {
    hook: {
      insert() {
        eventManager.trigger('mount');
      },
      destroy() {
        eventManager.trigger('destroy');
      }
    },
    eventManager
  }
}

export class Fragment {
  private children: ChildType[];
  private uniqueId = generateUniqueId();

  constructor(children: ChildType[]) {
    this.children = children;
  }

  static create({ children }: { children: ChildType[] }) {
    return new Fragment(children);
  }

  render(context: Context) {
    const vNodes = buildChildren(context, this.children);
    // If VNodes is empty array replace it with a array of comment VNode to store it's position
    if (vNodes.length === 0) vNodes.push(vnode('!', { key: this.uniqueId }, undefined, 'dFrag', undefined));
    vNodes.forEach((vNode) => {
      if (!vNode.data) {
        vNode.data = createVNodeData();
      } else if (!vNode.data.hook) {
        Object.assign(vNode.data, createVNodeData());
      }
    });
    return vNodes;
  }
}
