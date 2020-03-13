import { anyComp, log } from './utils';
import { Context } from './context';
import { PrimaryComponent, ChildType } from './elements';
import { Component } from './component';

interface protoClass {
  prototype: any;
}

export const createEl = (
  component: anyComp | ((context: Context, props: Record<string, any>) => ChildType),
  props: Record<string, any>,
  ...children: (anyComp | ((context: Context) => ChildType))[]
) => {
  if (!props) props = {};
  props.children = children.flat(Infinity);

  if (
    (component as protoClass).prototype instanceof PrimaryComponent ||
    (component as protoClass).prototype instanceof Component
  ) {
    return (component as any).create(props);
  } else if (typeof component === 'function') {
    return (context: Context) => component(context, props);
  }
}
