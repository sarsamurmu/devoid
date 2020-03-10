import { Component } from './component';
import { PrimaryComponent } from './elements';
import { init } from 'snabbdom/es/snabbdom';
import { toVNode } from 'snabbdom/es/tovnode';
import styleModule from 'snabbdom/es/modules/style';
import eventModule from 'snabbdom/es/modules/eventlisteners';
import attributeModule from 'snabbdom/es/modules/attributes';
import propsModule from 'snabbdom/es/modules/props';

export const patch = init([
  styleModule,
  eventModule,
  attributeModule,
  propsModule,
]);

const render = (component: Component | PrimaryComponent, element: HTMLElement) => {
  const elementVNode = toVNode(element);
  elementVNode.children = [component.render(null, null)];
  patch(element, elementVNode);
}

export { render }
