import { AnyComp, buildChildren, EventManager } from './utils';
import { h } from 'snabbdom/es/h';
import { Context } from './context';
import { VNode } from 'snabbdom/es/vnode';

export type ChildType = AnyComp | string | number | ((context: Context) => ChildType | ChildrenArray) | null | false | undefined;

export interface ChildrenArray extends Array<ChildrenArray | ChildType> {
  [index: number]: ChildrenArray | ChildType;
}

interface PrimaryComponentData {
  key?: any;
  props?: Record<string, any>;
  class?: Record<string, boolean>;
  attrs?: Record<string, string | number | boolean>;
  style?: Record<string, string>;
  children?: ChildType | ChildrenArray;
  on?: {
    [N in keyof HTMLElementEventMap]?: (ev: HTMLElementEventMap[N]) => void;
  } & {
    [event: string]: EventListener;
  };
}

export abstract class PrimaryComponent {
  elementData: PrimaryComponentData;
  eventManager = new EventManager();

  constructor(elementData: PrimaryComponentData = {}) {
    this.elementData = elementData;
    if (!elementData.children) this.elementData.children = [];
  }

  /* eslint-disable-next-line */
  static create(props: Record<string, any>): PrimaryComponent {
    return null
  }

  abstract build(context: Context): VNode;

  render(context: Context): VNode {
    return this.build(context);
  }
}

export const createComponent = (tagName: string) => {
  return class ElementClass extends PrimaryComponent {
    build(context: Context): VNode {
      const elementData = this.elementData;
      const eventManager = this.eventManager;

      elementData.children = [elementData.children];

      return h(tagName, {
        key: elementData.key,
        class: elementData.class,
        style: elementData.style,
        attrs: elementData.attrs,
        props: elementData.props,
        on: elementData.on,
        hook: {
          insert() {
            eventManager.trigger('mount');
          },
          update() {
            eventManager.trigger('update');
          },
          destroy() {
            eventManager.trigger('destroy');
          },
        },
        eventManager
      }, buildChildren(context, elementData.children));
    }
  }
}

const tags = [
  'a',
  'abbr',
  'address',
  'applet',
  'area',
  'article',
  'aside',
  'audio',
  'b',
  'base',
  'basefont',
  'bdi',
  'bdo',
  'blockquote',
  'br',
  'button',
  'canvas',
  'caption',
  'cite',
  'code',
  'col',
  'colgroup',
  'data',
  'datalist',
  'dd',
  'del',
  'details',
  'dfn',
  'dialog',
  'dir',
  'div',
  'dl',
  'dt',
  'em',
  'embed',
  'fieldset',
  'figcaption',
  'figure',
  'font',
  'footer',
  'form',
  'frame',
  'frameset',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'header',
  'hgroup',
  'hr',
  'i',
  'iframe',
  'img',
  'input',
  'ins',
  'kbd',
  'label',
  'legend',
  'li',
  'link',
  'main',
  'map',
  'mark',
  'marquee',
  'menu',
  'meta',
  'meter',
  'nav',
  'noscript',
  'object',
  'ol',
  'optgroup',
  'option',
  'output',
  'p',
  'param',
  'picture',
  'pre',
  'progress',
  'q',
  'rp',
  'rt',
  'ruby',
  's',
  'samp',
  'script',
  'section',
  'select',
  'slot',
  'small',
  'source',
  'span',
  'strong',
  'style',
  'sub',
  'summary',
  'sup',
  'table',
  'tbody',
  'td',
  'template',
  'textarea',
  'tfoot',
  'th',
  'thead',
  'time',
  'title',
  'tr',
  'track',
  'u',
  'ul',
  'var',
  'video',
  'wbr'
] as const;

type StyleMap = Record<string, string> & Partial<Omit<CSSStyleDeclaration, 'length' | 'parentRule' | 'getPropertyPriority' | 'getPropertyValue' | 'item' | 'removeProperty' | 'setProperty'>>;

type ElementsMap = {
  [N in typeof tags[number]]: new (options: PrimaryComponentData & {
    props?: {
      [E in keyof HTMLElementTagNameMap[N]]?: HTMLElementTagNameMap[N][E]
    };
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
  }) => typeof PrimaryComponent;
};

export const elements: ElementsMap = (() => {
  const elementsObject: Record<string, any> = {};
  for (const tag of tags) {
    elementsObject[tag] = createComponent(tag);
  }
  return elementsObject as ElementsMap;
})();

Object.freeze(elements);
