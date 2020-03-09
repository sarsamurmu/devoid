import Component from './component';
import { log, anyComp } from './utils';
import { VNode } from 'snabbdom/vnode';
import { h } from 'snabbdom/h';
import Context from './context';
import { patch } from './render';

type EventMap = {
  [N in keyof HTMLElementEventMap]?: (ev: HTMLElementEventMap[N]) => void;
} & {
  [event: string]: EventListener;
};

type ChildType = anyComp | string | (() => (anyComp));

interface ChildrenArray extends Array<ChildrenArray | ChildType> {
  [index: number]: (ChildrenArray | ChildType);
}

interface PrimaryComponentData {
  props?: Record<string, any>;
  attrs?: Record<string, string | number | boolean>;
  style?: Record<string, string>;
  child?: ChildType | ChildrenArray;
  children?: ChildrenArray;
  events?: EventMap;
  getComponent?: (component: anyComp) => void;
}

class PrimaryComponent {
  elementData: PrimaryComponentData;
  context: Context;
  vnode: VNode;
  lifeCycleCallbacks: Record<string, () => void>;

  constructor(elementData: PrimaryComponentData) {
    this.elementData = elementData;
    if (this.elementData.events) {
      for (const key in this.elementData.events) {
        this.elementData.events[key] = this.elementData.events[key].bind(this);
      }
    }
  }

  setState(callback: () => void = () => {}) {
    callback();
    patch(this.vnode, this.render(this.context, this.lifeCycleCallbacks));
  }

  build(context: Context): VNode {
    return null
  }

  render(context: Context, lifeCycleCallbacks: Record<string, () => void>): VNode {
    this.lifeCycleCallbacks = lifeCycleCallbacks || {};
    this.context = context;
    this.vnode = this.build(context);
    return this.vnode;
  }
}

const createComponent = (tagName: string) => {
  return (primaryComponentData: PrimaryComponentData) => new (class extends PrimaryComponent {
    build(context: object) {
      if (this.elementData.child) this.elementData.children = [this.elementData.child];
      if (!this.elementData.children) this.elementData.children = [];
      if (this.elementData.getComponent) this.elementData.getComponent(this);
      return h(tagName, {
        style: this.elementData.style,
        attrs: this.elementData.attrs,
        props: this.elementData.props,
        on: this.elementData.events,
        hook: {
          insert: (vnode) => {
            this.vnode = vnode;
            if (this.lifeCycleCallbacks.didMount) this.lifeCycleCallbacks.didMount();
          },
          update: () => this.lifeCycleCallbacks.didUpdate ? this.lifeCycleCallbacks.didUpdate() : null,
          destroy: () => this.lifeCycleCallbacks.didDestroy ? this.lifeCycleCallbacks.didDestroy() : null,
        },
      }, this.elementData.children.flat(Infinity).map((item) => {
        if (typeof item === 'string') return item;
        if (typeof item === 'function') {
          const builtItem = item();
          if (typeof builtItem === 'string') return builtItem;
          return builtItem.render(context, this.lifeCycleCallbacks);
        }
        return item.render(context, this.lifeCycleCallbacks);
      }));
    }
  })(primaryComponentData)
}

const elements = (() => {
  const elementsObject: Record<string, (primaryComponentData: PrimaryComponentData) => PrimaryComponent> = {};
  const tags = ['a','abbr','address','area','article','aside','audio','b','base','bdi','bdo','blockquote','body','br','button','canvas','caption','cite','code','col','colgroup','data','datalist','dd','del','details','dfn','dialog','div','dl','dt','em','embed','fieldset','figcaption','figure','footer','form','h1','h2','h3','h4','h5','h6','head','header','hr','html','i','iframe','img','input','ins','kbd','keygen','label','legend','li','link','main','map','mark','meta','meter','nav','noscript','object','ol','optgroup','option','output','p','param','pre','progress','q','rp','rt','ruby','s','samp','script','section','select','small','source','span','strong','style','sub','summary','sup','table','tbody','td','textarea','tfoot','th','thead','time','title','tr','track','u','ul','var','video','wbr'];
  for (const tag of tags) {
    elementsObject[tag] = createComponent(tag);
  }
  return elementsObject;
})();

export { PrimaryComponent as default, PrimaryComponent, elements };
