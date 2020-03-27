import classModule from 'snabbdom/es/modules/class';
import styleModule from 'snabbdom/es/modules/style';
import eventModule from 'snabbdom/es/modules/eventlisteners';
import attributeModule from 'snabbdom/es/modules/attributes';
import propsModule from 'snabbdom/es/modules/props';
import { toVNode } from 'snabbdom/es/tovnode';
import { Context } from './context';
import { init } from './vdom';
import { AnyComp, buildChildren } from './utils';

export const { patch, updateChildren } = init([
  classModule,
  styleModule,
  eventModule,
  attributeModule,
  propsModule,
]);

export const render = (component: AnyComp, element: HTMLElement) => {
  const elementVNode = toVNode(element);
  elementVNode.children = buildChildren(new Context(new Map([['rootEl', element]])), [component]);
  patch(element, elementVNode);
}
