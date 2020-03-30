import { AnyComp, isCompatibleComp } from './utils';
import { Context } from './context';
import { PrimaryComponent, ChildType, createComponent } from './elements';
import { Component } from './component';
import { elements } from './elements';
import { Fragment } from './fragment';

export const createEl = (
  component: typeof Component | typeof PrimaryComponent | typeof Fragment | ((context: Context, props: Record<string, any>) => ChildType) | string,
  props: Record<string, any>,
  ...children: (AnyComp | ((context: Context) => ChildType))[]
): ChildType => {
  if (!props) props = {};
  props.children = children.flat(Infinity);

  if (typeof component === 'string') {
    if (component in elements) return ((elements as any)[component] as typeof PrimaryComponent).create(props);
    return createComponent(component).create(props);
  } else if (isCompatibleComp(component.prototype)) {
    return (component as any).create(props) || new (component as any)(props);
  } else if (typeof component === 'function') {
    return (context: Context) => (component as any)(context, props);
  }
}
