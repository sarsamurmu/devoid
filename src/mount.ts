import { Context } from './context';
import { buildChildren } from './utils';
import { DevoidComponent } from './component';
import { updateChildren } from './vdom';

export const mount = (component: DevoidComponent, element: HTMLElement) => updateChildren({
  parentEl: element,
  oldCh: [],
  newCh: buildChildren(new Context(new Map([['rootEl', element]])), [component])
});
