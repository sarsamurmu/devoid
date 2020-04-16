import { elR } from './element';
import { DevoidComponent } from './component';
import { FC } from './utils';

export const createEl = (
  component: DevoidComponent | FC | string,
  props: Record<string, any>,
  ...children: DevoidComponent[]
): DevoidComponent => {
  if (!props) props = {};
  props.children = children;

  if (typeof component === 'string') {
    return elR(component, props, children);
  } else if (typeof component === 'function') {
    return typeof component.jsx !== 'undefined' ? component.jsx(props) : component(props);
  }
}
