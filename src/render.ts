import { toVNode } from 'snabbdom/es/tovnode';
import classModule from 'snabbdom/es/modules/class';
import styleModule from 'snabbdom/es/modules/style';
import eventModule from 'snabbdom/es/modules/eventlisteners';
import attributeModule from 'snabbdom/es/modules/attributes';
import propsModule from 'snabbdom/es/modules/props';
import { anyComp, buildChildren } from './utils';
import { Context } from './context';
import { init } from './vnode';

export const { patch, updateChildren } = init([
  classModule,
  styleModule,
  eventModule,
  attributeModule,
  propsModule,
]);

export const render = (component: anyComp, element: HTMLElement) => {
  const elementVNode = toVNode(element);
  elementVNode.children = buildChildren(new Context(), [component]);
  patch(element, elementVNode);
}
