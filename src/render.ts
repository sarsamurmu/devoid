import Component from './component';
import PrimaryComponent from './elements';
import { init } from 'snabbdom/snabbdom';
import { toVNode } from 'snabbdom/tovnode';
import classModule from 'snabbdom/modules/class';
import styleModule from 'snabbdom/modules/style';
import eventModule from 'snabbdom/modules/eventlisteners';
import attributeModule from 'snabbdom/modules/attributes';
import propsModule from 'snabbdom/modules/props';
import { log } from './utils';

export const patch = init([
  classModule,
  styleModule,
  eventModule,
  attributeModule,
  propsModule,
]);

const render = (component: Component | PrimaryComponent, element: HTMLElement) => {
  const elementVNode = toVNode(element);
  elementVNode.children = [component.render({ color: 'tomato' }, null)];
  patch(element, elementVNode);
}

export { render as default, render }
