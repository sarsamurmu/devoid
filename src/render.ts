import { Component } from './component';
import { PrimaryComponent } from './elements';
import { init } from 'snabbdom/snabbdom';
import { toVNode } from 'snabbdom/tovnode';
import styleModule from 'snabbdom/modules/style';
import eventModule from 'snabbdom/modules/eventlisteners';
import attributeModule from 'snabbdom/modules/attributes';
import propsModule from 'snabbdom/modules/props';

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
