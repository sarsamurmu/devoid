import { anyComp } from './utils';
import { Context } from './context';
import { PrimaryComponent, ChildType } from './elements';
import { Component } from './component';
import { elements } from './elements';

interface ProtoClass {
  prototype: any;
}

export const createEl = (
  component: anyComp | ((context: Context, props: Record<string, any>) => ChildType),
  props: Record<string, any>,
  ...children: (anyComp | ((context: Context) => ChildType))[]
) => {
  if (!props) props = {};
  props.children = children.flat(Infinity);

  if (elements[component as any]) {
    return (elements[component as any] as any).create(props);
  } else if (
    (component as ProtoClass).prototype instanceof PrimaryComponent ||
    (component as ProtoClass).prototype instanceof Component
  ) {
    return (component as any).create(props);
  } else if (typeof component === 'function') {
    return (context: Context) => component(context, props);
  }
}
