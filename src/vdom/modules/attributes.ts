import { VNode, VNodeData } from '../vnode';
import { Module } from './module';

declare global {
  interface Element {
    setAttribute(name: string, value: string | number | boolean): void;
    setAttributeNS(namespaceURI: string, qualifiedName: string, value: string | number | boolean): void;
  }
}

export type Attrs = Record<string, string | number | boolean>;

const xlinkNS = 'http://www.w3.org/1999/xlink';
const xmlNS = 'http://www.w3.org/XML/1998/namespace';
const colonChar = 58;
const xChar = 120;

const updateAttrs = (oldVNode: VNode, vNode: VNode) => {
  let key: string;
  const el: Element = vNode.el as Element;
  let oldAttrs = (oldVNode.data as VNodeData).attrs;
  let attrs = (vNode.data as VNodeData).attrs;

  if (!oldAttrs && !attrs) return;
  if (oldAttrs === attrs) return;
  oldAttrs = oldAttrs || {};
  attrs = attrs || {};

  for (key in attrs) {
    const cur = attrs[key];
    const old = oldAttrs[key];
    if (old !== cur) {
      if (cur === true) {
        el.setAttribute(key, '');
      } else if (cur === false) {
        el.removeAttribute(key);
      } else {
        if (key.charCodeAt(0) !== xChar) {
          el.setAttribute(key, cur);
        } else if (key.charCodeAt(3) === colonChar) {
          // Assume xml namespace
          el.setAttributeNS(xmlNS, key, cur);
        } else if (key.charCodeAt(5) === colonChar) {
          // Assume xlink namespace
          el.setAttributeNS(xlinkNS, key, cur);
        } else {
          el.setAttribute(key, cur);
        }
      }
    }
  }

  for (key in oldAttrs) {
    if (!(key in attrs)) el.removeAttribute(key);
  }
}

export const attributesModule: Module = {
  create: updateAttrs,
  update: updateAttrs
}
