import Component from './component';
import PrimaryComponent from './elements';
import { init } from 'snabbdom/snabbdom';
import classModule from 'snabbdom/modules/class';
import styleModule from 'snabbdom/modules/style';
import eventModule from 'snabbdom/modules/eventlisteners';

export const patch = init([
  classModule,
  styleModule,
  eventModule,
]);

const render = (component: Component | PrimaryComponent, element: HTMLElement) => {
  patch(element, component.render({ color: 'tomato' }, null));
}

export { render as default, render }
