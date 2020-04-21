import { buildChildren, EventManager, ChildType } from './utils';
import vnode, { VNode } from 'snabbdom/es/vnode';
import { DevoidComponent } from './component';

export type ClassType = string | boolean | (string | boolean)[];

type Ref<T> = { el: null | T };
type StyleMap = Record<string, string> & Partial<Omit<CSSStyleDeclaration, 'length' | 'parentRule' | 'getPropertyPriority' | 'getPropertyValue' | 'item' | 'removeProperty' | 'setProperty'>>;
type Tags = keyof HTMLElementTagNameMap;

interface ElementData<T extends Tags = null> {
  key?: any;
  props?: (T extends Tags ? {
    [P in keyof HTMLElementTagNameMap[T]]: HTMLElementTagNameMap[T][P];
  } : {
    [P in keyof HTMLElement]: HTMLElement[P];
  }) | Record<string, any>;
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

/* istanbul ignore next */
export const ref = <T extends HTMLElement = HTMLElement>(): Ref<T> => ({ el: null });

export const parseSelector = (selector: string) => {
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

export function elR(tagName: string, data: ElementData, children: ChildType[]): DevoidComponent {
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
      if (data.ref) data.ref.el = undefined;
      eventManager.trigger('destroy');
    },
  };

  (data as any).eventManager = eventManager;

  return {
    render: (context) => [vnode(tagName, data, buildChildren(context, children), undefined, undefined)],
  }
}

export function el<T extends Tags>(selector: T): DevoidComponent;
export function el(selector: string): DevoidComponent;

export function el<T extends Tags>(selector: T, data: ElementData<T>): DevoidComponent;
export function el<T extends Tags>(selector: string, data: ElementData<T>): DevoidComponent;
export function el(selector: string, data: ElementData): DevoidComponent;

export function el<T extends Tags>(selector: T, children: ChildType | ChildType[]): DevoidComponent;
export function el(selector: string, children: ChildType | ChildType[]): DevoidComponent;

export function el<T extends Tags>(selector: T, data: ElementData<T>, children: ChildType | ChildType[]): DevoidComponent;
export function el<T extends Tags>(selector: string, data: ElementData<T>, children: ChildType | ChildType[]): DevoidComponent;
export function el(selector: string, data: ElementData, children: ChildType | ChildType[]): DevoidComponent;

export function el(selector: string, fArg?: any, sArg?: any): DevoidComponent {
  const selData = parseSelector(selector);
  let children: ChildType[] = [];
  let data: ElementData;
  if (
    !sArg && (Array.isArray(fArg) ||
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
