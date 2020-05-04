import { VNode } from '../vnode';
import { Module } from './module';

export type VNodeStyle = Record<string, string> & {
  delayed?: Record<string, string>;
  remove?: Record<string, string>;
};

// Binding `requestAnimationFrame` like this fixes a bug in IE/Edge.
const raf = (typeof window !== 'undefined' && (window.requestAnimationFrame).bind(window)) || setTimeout;
const nextFrame = (fn: any) => {
  raf(() => {
    raf(fn);
  });
}
let reflowForced = false;

const setNextFrame = (obj: any, prop: string, val: any) => {
  nextFrame(() => {
    obj[prop] = val;
  });
}

const updateStyle = (oldVNode: VNode, vNode: VNode) => {
  let cur: any;
  let name: string;
  const el = vNode.el;
  let oldStyle = oldVNode.data.style;
  let style = vNode.data.style;

  if (!oldStyle && !style) return;
  if (oldStyle === style) return;
  oldStyle = oldStyle || {};
  style = style || {};
  const oldHasDel = 'delayed' in oldStyle;

  for (name in oldStyle) {
    if (!style[name]) {
      if (name[0] === '-' && name[1] === '-') {
        (el as any).style.removeProperty(name);
      } else {
        (el as any).style[name] = '';
      }
    }
  }
  for (name in style) {
    cur = style[name];
    if (name === 'delayed' && style.delayed) {
      for (const name2 in style.delayed) {
        cur = style.delayed[name2];
        if (!oldHasDel || cur !== (oldStyle.delayed as any)[name2]) {
          setNextFrame((el as any).style, name2, cur);
        }
      }
    } else if (name !== 'remove' && cur !== oldStyle[name]) {
      if (name[0] === '-' && name[1] === '-') {
        (el as any).style.setProperty(name, cur);
      } else {
        (el as any).style[name] = cur;
      }
    }
  }
}

const applyDestroyStyle = (vNode: VNode) => {
  let style: any;
  let name: string;
  const el = vNode.el;
  const s = vNode.data.style;
  if (!s || !(style = s.destroy)) return;
  for (name in style) {
    (el as any).style[name] = style[name];
  }
}

const applyRemoveStyle = (vNode: VNode, rm: () => void) => {
  const s = vNode.data.style;
  if (!s || !s.remove) {
    rm();
    return;
  }
  if (!reflowForced) {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    (vNode.el as any).offsetLeft;
    reflowForced = true;
  }
  let name: string;
  const el = vNode.el;
  let i = 0;
  const style = s.remove;
  let amount = 0;
  const applied: string[] = [];
  for (name in style) {
    applied.push(name);
    (el as any).style[name] = style[name];
  }
  const compStyle = getComputedStyle(el as Element);
  const props = (compStyle as any)['transition-property'].split(', ');
  for (; i < props.length; ++i) {
    if (applied.indexOf(props[i]) !== -1) amount++;
  }
  (el as Element).addEventListener('transitionend', (ev: TransitionEvent) => {
    if (ev.target === el) --amount;
    if (amount === 0) rm();
  });
}

const forceReflow = () => {
  reflowForced = false;
}

export const styleModule: Module = {
  pre: forceReflow,
  create: updateStyle,
  update: updateStyle,
  destroy: applyDestroyStyle,
  remove: applyRemoveStyle
};
export default styleModule;
