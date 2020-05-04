import { VNode } from '../vnode';
import { Module } from './module';

export type Classes = string | boolean | (string | boolean)[];

const getClassSet = (data: Classes) => {
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
  const oldClassSet = getClassSet(oldVNode.data.class);
  const newClassSet = getClassSet(newVNode.data.class);
  const el = newVNode.el as Element;

  newClassSet.forEach((className) => {
    if (!oldClassSet.has(className)) el.classList.add(className);
  });

  oldClassSet.forEach((className) => {
    if (!newClassSet.has(className)) el.classList.remove(className);
  });
}

export const classModule: Module = {
  create: updateClass,
  update: updateClass
}
