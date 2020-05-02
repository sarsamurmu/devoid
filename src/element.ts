import { buildChildren, EventManager, ChildType, isObject } from './utils';
import { DevoidComponent } from './component';
import { Classes } from './vdom/modules/class';
import { Key, createVNode, VNode, VNodeData } from './vdom/vnode';

type EventMap = {
  onAbort: (e: UIEvent) => void;
  onAnimationCancel: (e: AnimationEvent) => void;
  onAnimationEnd: (e: AnimationEvent) => void;
  onAnimationIteration: (e: AnimationEvent) => void;
  onAnimationStart: (e: AnimationEvent) => void;
  onAuxClick: (e: MouseEvent) => void;
  onBlur: (e: FocusEvent) => void;
  onCancel: (e: Event) => void;
  onCanPlay: (e: Event) => void;
  onCanPlayThrough: (e: Event) => void;
  onChange: (e: Event) => void;
  onClick: (e: MouseEvent) => void;
  onClose: (e: Event) => void;
  onContextMenu: (e: MouseEvent) => void;
  onCopy: (e: ClipboardEvent) => void;
  onCueChange: (e: Event) => void;
  onCut: (e: ClipboardEvent) => void;
  onDblClick: (e: MouseEvent) => void;
  onDrag: (e: DragEvent) => void;
  onDragEnd: (e: DragEvent) => void;
  onDragEnter: (e: DragEvent) => void;
  onDragExit: (e: Event) => void;
  onDragLeave: (e: DragEvent) => void;
  onDragOver: (e: DragEvent) => void;
  onDragStart: (e: DragEvent) => void;
  onDrop: (e: DragEvent) => void;
  onDurationChange: (e: Event) => void;
  onEmptied: (e: Event) => void;
  onEnded: (e: Event) => void;
  onError: (e: ErrorEvent) => void;
  onFocus: (e: FocusEvent) => void;
  onFocusIn: (e: FocusEvent) => void;
  onFocusOut: (e: FocusEvent) => void;
  onFullScreenChange: (e: Event) => void;
  onFullScreenError: (e: Event) => void;
  onGotPointerCapture: (e: PointerEvent) => void;
  onInput: (e: Event) => void;
  onInvalid: (e: Event) => void;
  onKeyDown: (e: KeyboardEvent) => void;
  onKeyPress: (e: KeyboardEvent) => void;
  onKeyUp: (e: KeyboardEvent) => void;
  onLoad: (e: Event) => void;
  onLoadedData: (e: Event) => void;
  onLoadedMetadata: (e: Event) => void;
  onLoadStart: (e: Event) => void;
  onLostPointerCapture: (e: PointerEvent) => void;
  onMouseDown: (e: MouseEvent) => void;
  onMouseEnter: (e: MouseEvent) => void;
  onMouseLeave: (e: MouseEvent) => void;
  onMouseMove: (e: MouseEvent) => void;
  onMouseOut: (e: MouseEvent) => void;
  onMouseOver: (e: MouseEvent) => void;
  onMouseUp: (e: MouseEvent) => void;
  onPaste: (e: ClipboardEvent) => void;
  onPause: (e: Event) => void;
  onPlay: (e: Event) => void;
  onPlaying: (e: Event) => void;
  onPointerCancel: (e: PointerEvent) => void;
  onPointerDown: (e: PointerEvent) => void;
  onPointerEnter: (e: PointerEvent) => void;
  onPointerLeave: (e: PointerEvent) => void;
  onPointerMove: (e: PointerEvent) => void;
  onPointerOut: (e: PointerEvent) => void;
  onPointerOver: (e: PointerEvent) => void;
  onPointerUp: (e: PointerEvent) => void;
  onProgress: (e: ProgressEvent) => void;
  onRatechange: (e: Event) => void;
  onReset: (e: Event) => void;
  onResize: (e: UIEvent) => void;
  onScroll: (e: Event) => void;
  onSecurityPolicyViolation: (e: SecurityPolicyViolationEvent) => void;
  onSeeked: (e: Event) => void;
  onSeeking: (e: Event) => void;
  onSelect: (e: Event) => void;
  onSelectionChange: (e: Event) => void;
  onSelectStart: (e: Event) => void;
  onStalled: (e: Event) => void;
  onSubmit: (e: Event) => void;
  onSuspend: (e: Event) => void;
  onTimeUpdate: (e: Event) => void;
  onToggle: (e: Event) => void;
  onTouchCancel: (e: TouchEvent) => void;
  onTouchEnd: (e: TouchEvent) => void;
  onTouchMove: (e: TouchEvent) => void;
  onTouchStart: (e: TouchEvent) => void;
  onTransitionCancel: (e: TransitionEvent) => void;
  onTransitionEnd: (e: TransitionEvent) => void;
  onTransitionRun: (e: TransitionEvent) => void;
  onTransitionStart: (e: TransitionEvent) => void;
  onVolumeChange: (e: Event) => void;
  onWaiting: (e: Event) => void;
  onWheel: (e: WheelEvent) => void;
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
  'body',
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
  'head',
  'header',
  'hgroup',
  'hr',
  'html',
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

export type Ref<T extends Tags | any> = { el: null | T extends null ? HTMLElement : T extends Tags ? HTMLElementTagNameMap[T] : T };
type StyleMap = Record<string, string> & Partial<Omit<CSSStyleDeclaration, 'length' | 'parentRule' | 'getPropertyPriority' | 'getPropertyValue' | 'item' | 'removeProperty' | 'setProperty'>>;
export type Tags = typeof tags[number];

export type ElementData<T extends Tags = null> = {
  key?: Key;
  props?: (T extends Tags ? {
    [P in keyof HTMLElementTagNameMap[T]]?: HTMLElementTagNameMap[T][P];
  } : {
    [P in keyof HTMLElement]?: HTMLElement[P];
  }) & Record<string, any>;
  class?: Classes;
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
} & Partial<EventMap>;

/* istanbul ignore next */
export const ref = <T extends Tags | any = null>(): Ref<T> => ({ el: null });

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
      
      case '#':
        attrs.id = token.substring(1);
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

export const elR = (tagName: string, data: ElementData, children: ChildType[]): DevoidComponent => {
  const eventManager = new EventManager();

  (data as VNodeData).hook = {
    insert(vNode: VNode) {
      if (data.ref) data.ref.el = vNode.elm;
      eventManager.trigger('mount');
    },
    update(_: any, vNode: VNode) {
      if (data.ref) data.ref.el = vNode.elm;
      eventManager.trigger('update');
    },
    destroy() {
      if (data.ref) data.ref.el = null;
      eventManager.trigger('destroy');
    },
  };

  (data as VNodeData).events = eventManager;

  return {
    dComp: true,
    render: (context) => [createVNode(tagName, data, buildChildren(context, children), undefined, undefined)],
  }
}

export const convertEventKeys = (data: Record<string, any>) => {
  for (const key in data) {
    const match = /^on([A-Z])(.*)/.exec(key);
    if (!match) continue;
    if (!data.on) data.on = {};
    data.on[(match[1] + match[2]).toLowerCase()] = data[key];
  }
}

export const appendSelectorData = (selectorData: ReturnType<typeof parseSelector>, data: Record<string, any>) => {
  if (!data.attrs && selectorData.hasAttrs) data.attrs = {};
  if (!data.class && selectorData.hasClass) data.class = [];
  if (data.class && typeof data.class === 'string') data.class = [data.class];

  if (data.attrs) data.attrs = Object.assign(selectorData.attrs, data.attrs);
  if (data.class) (data.class as (string | boolean)[]).push(...selectorData.class);
}

interface El {
  <T extends Tags>(selector: T): DevoidComponent;
  (selector: string): DevoidComponent;

  <T extends Tags>(selector: T, data: ElementData<T>): DevoidComponent;
  <T extends Tags>(selector: string, data: ElementData<T>): DevoidComponent;
  (selector: string, data: ElementData): DevoidComponent;

  <T extends Tags>(selector: T, children: ChildType | ChildType[]): DevoidComponent;
  (selector: string, children: ChildType | ChildType[]): DevoidComponent;

  <T extends Tags>(selector: T, data: ElementData<T>, children: ChildType | ChildType[]): DevoidComponent;
  <T extends Tags>(selector: string, data: ElementData<T>, children: ChildType | ChildType[]): DevoidComponent;
  (selector: string, data: ElementData, children: ChildType | ChildType[]): DevoidComponent;
}

export const el: El = (selector: string, fArg?: any, sArg?: any): DevoidComponent => {
  const selData = parseSelector(selector);
  let children: ChildType[] = [];
  let data: ElementData;
  if (
    !sArg && (Array.isArray(fArg) ||
    (fArg && (fArg as DevoidComponent).dComp) ||
    (typeof fArg === 'string' && fArg.trim() !== '') ||
    typeof fArg === 'number')
  ) {
    children = Array.isArray(fArg) ? fArg : [fArg];
  } else if (typeof fArg === 'object') {
    data = fArg;
  }

  if (sArg) children = Array.isArray(sArg) ? sArg : [sArg];

  if (!data) data = {} as ElementData;
  
  convertEventKeys(data);
  appendSelectorData(selData, data);

  return elR(selData.tag, data, children);
}

type ElementDataWithSel<T extends Tags = null> = ElementData<T> & {
  sel?: string;
}

type ComposedElementsMap = {
  [T in Tags]: {
    (...children: ChildType[]): DevoidComponent;
    (data: ElementDataWithSel<T>, ...children: ChildType[]): DevoidComponent;
  };
} & {
  [key: string]: any;
}

const composedElements = {} as ComposedElementsMap;

export const composeEls = (): ComposedElementsMap => {
  if (!composedElements.initialized) {
    tags.forEach((tag) => {
      const createElFun = (dataOrChild: any, ...children: ChildType[]) => {
        let data = {} as ElementDataWithSel;
        if (
          dataOrChild &&
          ((dataOrChild as DevoidComponent).dComp ||
          (typeof dataOrChild === 'string' && dataOrChild.trim() !== '') ||
          typeof dataOrChild === 'number')
        ) {
          children.push(dataOrChild as ChildType);
        } else if (isObject(dataOrChild)) {
          data = dataOrChild;
          convertEventKeys(data);
          if (data.sel) appendSelectorData(parseSelector(data.sel), data);
        }
        return elR(tag, data, children);
      }
      composedElements[tag] = createElFun;
    });
    composedElements.initialized = true;
  }
  return composedElements;
}
