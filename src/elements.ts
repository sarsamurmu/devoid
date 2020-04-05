import { AnyComp, buildChildren, EventManager, isCompatibleComp } from './utils';
import { Context } from './context';
import vnode, { VNode } from 'snabbdom/es/vnode';

export type ChildType = AnyComp | string | number | ((context: Context) => ChildType) | VNode | null | false | undefined;
export type ClassType = string | boolean | (string | boolean)[];

type StyleMap = Record<string, string> & Partial<Omit<CSSStyleDeclaration, 'length' | 'parentRule' | 'getPropertyPriority' | 'getPropertyValue' | 'item' | 'removeProperty' | 'setProperty'>>;

interface ElementData {
  key?: any;
  props?: Record<string, any>;
  class?: ClassType;
  attrs?: Record<string, string | number | boolean>;
  style?: StyleMap & {
    /** Whenever these properties change, the change is not applied until after the next frame. */
    delayed?: StyleMap;
    /**
     * Styles set in the remove property will take effect once the element is about to be directly removed from the DOM.
     * Doesn't work if the element is indirectly being removed from the DOM.
     * The applied styles should be animated with CSS transitions.
     * Only once all the styles are done animating, the element will be removed from the DOM. */
    remove?: StyleMap;
    /** Applied whenever the element is removed from the DOM. Element being removed directly from parent element or removed indirectly doesn't matter.  */
    destroy?: StyleMap;
  };
  on?: {
    [N in keyof HTMLElementEventMap]?: (ev: HTMLElementEventMap[N]) => void;
  } & {
    [event: string]: EventListener;
  };
  ref?: Record<string, any>;
}

const parseSelector = (selector: string) => {
  let tag = 'div';
  const aClass: string[] = [];
  const attrs = {} as Record<string, string>;
  let hasAttrs = false;
  let hasClass = false;
  let equalIndex;
  let attrValue;
  let attrKey;
  selector.split(/(?=\.)|(?=#)|(?=\[)/g).forEach((token) => {
    switch (token[0]) {
      case '.':
        aClass.push(token.substring(1));
        hasClass = true;
        break;

      case '[':
        equalIndex = token.indexOf('=');
        attrKey = equalIndex !== -1 ? token.substring(1, equalIndex) : token.substring(1, token.length - 1);
        attrValue = equalIndex !== -1 ? token.substring(equalIndex + 1, token.length - 1) : ' ';
        attrs[attrKey] = attrValue[0].match(/["']/) && attrValue[attrValue.length - 1].match(/["']/)
          ? attrValue.substring(1, attrValue.length - 1) : attrValue;
        hasAttrs = true;
        break;

      default:
        tag = token;
    }
  });

  return {
    tag,
    class: aClass,
    attrs,
    hasAttrs,
    hasClass
  }
}

type rType = (context: Context) => VNode;

export function elR(tagName: string, data: ElementData, children: ChildType[]): rType {
  const eventManager = new EventManager();

  (data as any).hook = {
    insert(vNode: VNode) {
      if (data.ref) data.ref.el = vNode.elm;
      eventManager.trigger('mount');
    },
    update() {
      eventManager.trigger('update');
    },
    destroy() {
      if (data.ref) data.ref.el = null;
      eventManager.trigger('destroy');
    },
  };

  (data as any).eventManager = eventManager;

  return (context) => vnode(tagName, data, buildChildren(context, children), undefined, undefined);
}

export function el(selector: string): rType;
export function el(selector: string, data: ElementData): rType;
export function el(selector: string, children: ChildType | ChildType[]): rType;
export function el(selector: string, data: ElementData, children: ChildType | ChildType[]): rType;
export function el(selector: string, fArg?: any, sArg?: any): rType {
  const selData = parseSelector(selector);
  let children: ChildType[] = [];
  let data: ElementData;
  if (
    !sArg && (Array.isArray(fArg) ||
    isCompatibleComp(fArg) ||
    typeof fArg === 'function' ||
    (typeof fArg === 'string' && fArg.trim() !== '') ||
    typeof fArg === 'number')
  ) {
    children = Array.isArray(fArg) ? fArg : [fArg];
  } else if (typeof fArg === 'object') {
    data = fArg;
  }

  if (sArg) children = Array.isArray(sArg) ? sArg : [sArg];

  if (!data) data = {};
  if (!data.attrs && selData.hasAttrs) data.attrs = {};
  if (!data.class && selData.hasClass) data.class = [];
  if (data.class && typeof data.class === 'string') data.class = [data.class];

  if (data.attrs) data.attrs = Object.assign(selData.attrs, data.attrs);
  if (data.class) (data.class as any[]).push(...selData.class);

  return elR(selData.tag, data, children);
}
