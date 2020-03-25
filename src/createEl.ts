import { AnyComp } from './utils';
import { Context } from './context';
import { PrimaryComponent, ChildType, createComponent } from './elements';
import { Component } from './component';
import { elements } from './elements';
import { Fragment } from './fragment';

interface ProtoClass {
  prototype: any;
}

export const createEl = (
  component: AnyComp | ((context: Context, props: Record<string, any>) => ChildType) | string,
  props: Record<string, any>,
  ...children: (AnyComp | ((context: Context) => ChildType))[]
) => {
  if (!props) props = {};
  props.children = children.flat(Infinity);

  if (
    (component as ProtoClass).prototype instanceof PrimaryComponent ||
    (component as ProtoClass).prototype instanceof Component ||
    (component as ProtoClass).prototype instanceof Fragment
  ) {
    return (component as any).create(props) || new (component as any)(props);
  } else if (typeof component === 'function') {
    return (context: Context) => component(context, props);
  } else if (elements[component as any]) {
    return (elements[component as any] as any).create(props);
  } else if (typeof component === 'string') {
    return createComponent(component).create(props);
  }
}
