import { anyComp, buildChildren, EventManager } from './utils';
import { h } from 'snabbdom/es/h';
import { Context } from './context';
import { patch } from './render';
import { DuzeNode } from './duzeNode';

type EventMap = {
  [N in keyof HTMLElementEventMap]?: (ev: HTMLElementEventMap[N]) => void;
} & {
  [event: string]: EventListener;
};

export type ChildType = anyComp | string | number | ((context: Context) => anyComp) | null | false | undefined;

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
  on?: EventMap;
  getComponent?: (component: anyComp) => void;
}

abstract class PrimaryComponent {
  elementData: PrimaryComponentData;
  context: Context;
  duzeNode: DuzeNode;
  eventManager: EventManager;

  constructor(elementData: PrimaryComponentData = {}) {
    this.elementData = elementData;
    if (!elementData.children) this.elementData.children = [];
    if (this.elementData.on) {
      for (const key in this.elementData.on) {
        this.elementData.on[key] = this.elementData.on[key].bind(this);
      }
    }
    this.eventManager = new EventManager();
  }

  /* eslint-disable-next-line */
  static create(props: Record<string, any>): PrimaryComponent {
    return null
  }

  rebuild() {
    patch(this.duzeNode, this.render(this.context));
  }

  abstract build(context: Context): DuzeNode;

  render(context: Context): DuzeNode {
    this.context = context;
    if (!this.eventManager) this.eventManager = new EventManager();
    this.duzeNode = this.build(context);
    return this.duzeNode;
  }
}

const createComponent = (tagName: string) => {
  return class ElementClass extends PrimaryComponent {
    static create(props: Record<string, any>): PrimaryComponent {
      return new ElementClass(props);
    }

    build(context: Context): DuzeNode {
      this.elementData.children = [this.elementData.children];

      if (this.elementData.getComponent) this.elementData.getComponent(this);

      return h(tagName, {
        key: this.elementData.key,
        class: this.elementData.class,
        style: this.elementData.style,
        attrs: this.elementData.attrs,
        props: this.elementData.props,
        on: this.elementData.on,
        hook: {
          insert: (vnode) => {
            this.duzeNode = vnode;
            this.eventManager.trigger('mount');
          },
          update: () => this.eventManager.trigger('update'),
          destroy: () => this.eventManager.trigger('destroy'),
        },
      }, buildChildren(context, this.elementData.children));
    }
  }
}

const elements = (() => {
  const elementsObject: Record<string, PrimaryComponent> = {};
  const tags = ['a', 'abbr', 'address', 'area', 'article', 'aside', 'audio', 'b', 'base', 'bdi', 'bdo', 'blockquote', 'body', 'br', 'button', 'canvas', 'caption', 'cite', 'code', 'col', 'colgroup', 'data', 'datalist', 'dd', 'del', 'details', 'dfn', 'dialog', 'div', 'dl', 'dt', 'em', 'embed', 'fieldset', 'figcaption', 'figure', 'footer', 'form', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'head', 'header', 'hr', 'html', 'i', 'iframe', 'img', 'input', 'ins', 'kbd', 'keygen', 'label', 'legend', 'li', 'link', 'main', 'map', 'mark', 'meta', 'meter', 'nav', 'noscript', 'object', 'ol', 'optgroup', 'option', 'output', 'p', 'param', 'pre', 'progress', 'q', 'rp', 'rt', 'ruby', 's', 'samp', 'script', 'section', 'select', 'small', 'source', 'span', 'strong', 'style', 'sub', 'summary', 'sup', 'table', 'tbody', 'td', 'textarea', 'tfoot', 'th', 'thead', 'time', 'title', 'tr', 'track', 'u', 'ul', 'var', 'video', 'wbr'];
  for (const tag of tags) {
    elementsObject[tag] = createComponent(tag) as any;
  }
  return elementsObject;
})();

export { PrimaryComponent, elements }
