import styleModule from 'snabbdom/es/modules/style';
import eventModule from 'snabbdom/es/modules/eventlisteners';
import attributeModule from 'snabbdom/es/modules/attributes';
import propsModule from 'snabbdom/es/modules/props';
import { toVNode } from 'snabbdom/es/tovnode';
import { Context } from './context';
import { init } from './vdom';
import { AnyComp, buildChildren } from './utils';
import { VNode } from 'snabbdom/es/vnode';
import { ClassType } from './element';

const getClassSet = (data: ClassType) => {
  const classSet = new Set<string>();
  if (Array.isArray(data)) {
    data.forEach((value) => {
      if (typeof value === 'string') value.split(' ').forEach((className) => classSet.add(className));
    });
  } else if (typeof data === 'string') {
    data.split(' ').forEach((className) => classSet.add(className));
  }
  return classSet;
}

const updateClass = (oldVNode: VNode, newVNode: VNode) => {
  const oldClassSet = getClassSet(oldVNode.data.class as unknown as ClassType);
  const newClassSet = getClassSet(newVNode.data.class as unknown as ClassType);
  const el = newVNode.elm as Element;
  
  newClassSet.forEach((className) => {
    if (!oldClassSet.has(className)) el.classList.add(className);
  });

  oldClassSet.forEach((className) => {
    if (!newClassSet.has(className)) el.classList.remove(className);
  });
}

const classModule = {
  create: updateClass,
  update: updateClass
}

export const { patch, updateChildren } = init([
  classModule,
  styleModule,
  eventModule,
  attributeModule,
  propsModule,
]);

export const render = (component: AnyComp, element: HTMLElement) => {
  const elementVNode = toVNode(element);
  elementVNode.children = buildChildren(new Context(new Map([['rootEl', element]])), [component]);
  patch(element, elementVNode);
}
