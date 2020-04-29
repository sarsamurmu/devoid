import { elR, convertEventKeys, ElementData, Tags } from './element';
import { FC, ChildType } from './utils';
import { DevoidComponent } from './component';

interface FCWithJSX {
  jsx(props: Record<string, any>): DevoidComponent;
}

type RSA = Record<string, any>;

type PropType<T> = T extends FCWithJSX
  ? Parameters<T['jsx']>[0]
  : T extends FC
    ? Parameters<T>[0] extends undefined
      ? {}
      : Parameters<T>[0] extends RSA
        ? Parameters<T>[0]
        : {}
    : T extends string
      ? T extends Tags
        ? ElementData<T>
        : ElementData
      : {};

export const createEl = <T extends FC | string>(
  component: T,
  props: PropType<T>,
  ...children: ChildType[]
): DevoidComponent => {
  if (!props) props = {} as any;
  props.children = children;

  if (typeof component === 'string') {
    convertEventKeys(props);
    return elR(component, props, children);
  } else if (typeof component === 'function') {
    const comp = component as FC;
    return typeof comp.jsx !== 'undefined' ? comp.jsx(props) : comp(props);
  }
}
