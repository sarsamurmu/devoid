/**
 * Forked version of Snabbdom
 * Original author Simon Friis Vindum
 * Licensed under MIT License - https://github.com/snabbdom/snabbdom/blob/master/LICENSE
 */

import { createVNode, VNode } from './vnode';
import { htmlDomApi, DOMAPI } from './domapi';

import { Module } from './modules/module';
import { attributesModule } from './modules/attributes';
import { classModule } from './modules/class';
import { eventModule } from './modules/event';
import { propsModule } from './modules/props';
import { styleModule } from './modules/style';

type KeyToIndexMap = { [key: string]: number };

type ArraysOf<T> = {
  [K in keyof T]: T[K][];
};

type ModuleHooks = ArraysOf<Module>;

const isUndef = (s: any): boolean => s === undefined;
const isDef = <A>(s: A): s is (A extends undefined ? never : A) => s !== undefined;

const emptyNode = createVNode('', {}, [], undefined, undefined);

const sameVNode = (aVNode: VNode, bVNode: VNode): boolean => aVNode.key === bVNode.key && aVNode.sel === bVNode.sel;
const isVNode = (vNode: any): vNode is VNode => isDef(vNode.sel);
const isFragment = (vNode: VNode) => vNode.sel === 'fragment';

const flattenFragment = (fragment: VNode, insertedVNodeQueue?: VNode[]) => {
  const vNodes: VNode[] = [];
  fragment.children.forEach((child) => {
    if (isFragment(child)) {
      if (insertedVNodeQueue) insertedVNodeQueue.push(child);
      vNodes.push(...flattenFragment(child));
    } else {
      vNodes.push(child);
    }
  });
  return vNodes;
}

const last = <T>(arr: T[]) => arr[arr.length - 1];

const toVNodeArr = (vNode: VNode) => isFragment(vNode) ? flattenFragment(vNode) : [vNode];

const createKeyToOldIdx = (children: VNode[], beginIdx: number, endIdx: number): KeyToIndexMap => {
  const map: KeyToIndexMap = {};
  for (let i = beginIdx; i <= endIdx; ++i) {
    const key = children[i]?.key;
    if (isDef(key)) {
      map[key] = i;
    }
  }
  return map;
}

const hooks: (keyof Module)[] = ['create', 'update', 'remove', 'destroy', 'pre', 'post'];

let i: number;
let j: number;
const cbs = {} as ModuleHooks;
const api: DOMAPI = htmlDomApi;
const modules: Module[] = [
  attributesModule,
  classModule,
  eventModule,
  propsModule,
  styleModule
]

for (i = 0; i < hooks.length; ++i) {
  cbs[hooks[i]] = [];
  for (j = 0; j < modules.length; ++j) {
    const hook = modules[j][hooks[i]];
    if (isDef(hook)) {
      (cbs[hooks[i]] as any[]).push(hook);
    }
  }
}

const emptyNodeAt = (elm: Element) => {
  return createVNode(api.tagName(elm).toLowerCase(), {}, [], undefined, elm);
}

const createRmCb = (childElm: Node, listeners: number) => {
  return () => {
    if (--listeners === 0) {
      const parent = api.parentNode(childElm);
      api.removeChild(parent, childElm);
    }
  }
}

const createElm = (vNode: VNode, insertedVNodeQueue: VNode[]): Node => {
  let i: any;
  const data = vNode.data;
  // We don't use `init` hook so it's disabled
  /*
  if (data !== undefined) {
    const init = data.hook?.init;
    if (isDef(init)) {
      init(vNode);
      data = vNode.data;
    }
  }
  */
  const children = vNode.children;
  const sel = vNode.sel;
  if (sel === '!') {
    if (isUndef(vNode.text)) vNode.text = '';
    vNode.elm = api.createComment(vNode.text);
    if (isDef(vNode.data) && isDef(vNode.data.hook) && vNode.data.hook.insert) {
      insertedVNodeQueue.push(vNode);
    }
  } else if (isDef(sel)) {
    const tag = sel;
    const elm = vNode.elm = isDef(data) && isDef(i = data.ns)
      ? api.createElementNS(i, tag)
      : api.createElement(tag);
    for (i = 0; i < cbs.create.length; ++i) cbs.create[i](emptyNode, vNode);
    for (i = 0; i < children.length; ++i) {
      const ch = children[i];
      if (ch) {
        api.appendChild(elm, createElm(ch as VNode, insertedVNodeQueue));
      }
    }
    const hook = vNode.data.hook;
    if (isDef(hook)) {
      // We don't use `create` hook at VNode level
      // hook.create?.(emptyNode, vNode);
      if (hook.insert) insertedVNodeQueue.push(vNode);
    }
  } else {
    vNode.elm = api.createTextNode(vNode.text);
    if (isDef(vNode.data) && isDef(vNode.data.hook) && vNode.data.hook.insert) {
      insertedVNodeQueue.push(vNode);
    }
  }
  return vNode.elm;
}

const addVNodes = (
  parentElm: Node,
  before: Node | null,
  vNodes: VNode[],
  startIdx: number,
  endIdx: number,
  insertedVNodeQueue: VNode[]
) => {
  for (; startIdx <= endIdx; ++startIdx) {
    const ch = vNodes[startIdx];
    if (ch) {
      if (isFragment(ch)) {
        const children = ch.children;
        ch.elm = parentElm;
        insertedVNodeQueue.push(ch);
        addVNodes(parentElm, before, children, 0, children.length - 1, insertedVNodeQueue);
      } else {
        api.insertBefore(parentElm, createElm(ch, insertedVNodeQueue), before);
      }
    }
  }
}

const invokeDestroyHook = (vNode: VNode) => {
  const data = vNode.data;
  if (isDef(data)) {
    if (data.hook && data.hook.destroy) data.hook.destroy(vNode);
    for (let i = 0; i < cbs.destroy.length; ++i) cbs.destroy[i](vNode);
    if (isDef(vNode.children)) {
      for (let j = 0; j < vNode.children.length; ++j) {
        const child = vNode.children[j];
        if (child && typeof child !== 'string') {
          invokeDestroyHook(child);
        }
      }
    }
  }
}

const removeVNodes = (
  parentElm: Node,
  vNodes: VNode[],
  startIdx: number,
  endIdx: number
) => {
  for (; startIdx <= endIdx; ++startIdx) {
    let listeners: number;
    let rm: () => void;
    const ch = vNodes[startIdx];
    if (ch) {
      if (isDef(ch.sel)) {
        invokeDestroyHook(ch);
        if (isFragment(ch)) {
          const children = flattenFragment(ch);
          removeVNodes(ch.elm, children, 0, children.length - 1);
        } else {
          listeners = cbs.remove.length + 1;
          rm = createRmCb(ch.elm, listeners);
          for (let i = 0; i < cbs.remove.length; ++i) cbs.remove[i](ch, rm);
          if (ch.data && ch.data.hook && ch.data.hook.remove) {
            ch.data.hook.remove(ch, rm);
          } else {
            rm();
          }
        }
      } else { // Text node
        api.removeChild(parentElm, ch.elm);
        invokeDestroyHook(ch);
      }
    }
  }
}

/* eslint-disable @typescript-eslint/no-use-before-define */

function updateChildren(
  parentElm: Node,
  oldCh: VNode[],
  newCh: VNode[],
  insertedVNodeQueue: VNode[],
  insertBefore: Node = null
) {
  let oldStartIdx = 0;
  let newStartIdx = 0;
  let oldEndIdx = oldCh.length - 1;
  let oldStartVNode = oldCh[0];
  let oldEndVNode = oldCh[oldEndIdx];
  let newEndIdx = newCh.length - 1;
  let newStartVNode = newCh[0];
  let newEndVNode = newCh[newEndIdx];
  let oldKeyToIdx: KeyToIndexMap | undefined;
  let idxInOld: number;
  let elmToMove: VNode;
  let before: Node;

  while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
    if (!oldStartVNode) {
      oldStartVNode = oldCh[++oldStartIdx]; // VNode might have been moved left
    } else if (!oldEndVNode) {
      oldEndVNode = oldCh[--oldEndIdx];
    } else if (!newStartVNode) {
      newStartVNode = newCh[++newStartIdx];
    } else if (!newEndVNode) {
      newEndVNode = newCh[--newEndIdx];
    } else if (sameVNode(oldStartVNode, newStartVNode)) {
      patchVNode(oldStartVNode, newStartVNode, insertedVNodeQueue);
      oldStartVNode = oldCh[++oldStartIdx];
      newStartVNode = newCh[++newStartIdx];
    } else if (sameVNode(oldEndVNode, newEndVNode)) {
      patchVNode(oldEndVNode, newEndVNode, insertedVNodeQueue);
      oldEndVNode = oldCh[--oldEndIdx];
      newEndVNode = newCh[--newEndIdx];
    } else if (sameVNode(oldStartVNode, newEndVNode)) { // VNode moved right
      patchVNode(oldStartVNode, newEndVNode, insertedVNodeQueue);
      const toInsertBefore = api.nextSibling(last(toVNodeArr(oldEndVNode)).elm);
      if (isFragment(oldStartVNode)) {
        // If fragment, get all children and insert before the next children of last element
        flattenFragment(oldStartVNode).forEach((child) => {
          api.insertBefore(parentElm, child.elm, toInsertBefore);
        });
      } else {
        api.insertBefore(parentElm, oldStartVNode.elm, toInsertBefore);
      }
      oldStartVNode = oldCh[++oldStartIdx];
      newEndVNode = newCh[--newEndIdx];
    } else if (sameVNode(oldEndVNode, newStartVNode)) { // VNode moved left
      patchVNode(oldEndVNode, newStartVNode, insertedVNodeQueue);
      const toInsertBefore = toVNodeArr(oldStartVNode)[0].elm;
      if (isFragment(oldEndVNode)) {
        // If fragment, get all children and insert before the first children of first element
        flattenFragment(oldEndVNode).forEach((child) => {
          api.insertBefore(parentElm, child.elm, toInsertBefore);
        });
      } else {
        api.insertBefore(parentElm, oldEndVNode.elm, toInsertBefore);
      }
      oldEndVNode = oldCh[--oldEndIdx];
      newStartVNode = newCh[++newStartIdx];
    } else {
      if (!oldKeyToIdx) {
        oldKeyToIdx = createKeyToOldIdx(oldCh, oldStartIdx, oldEndIdx);
      }
      idxInOld = oldKeyToIdx[newStartVNode.key as string];
      if (isUndef(idxInOld)) { // New Element
        const toInsertBefore = toVNodeArr(oldStartVNode)[0].elm;
        if (isFragment(newStartVNode)) {
          insertedVNodeQueue.push(newStartVNode);
          flattenFragment(newStartVNode, insertedVNodeQueue).forEach((child) => {
            api.insertBefore(parentElm, createElm(child, insertedVNodeQueue), toInsertBefore);
          });
        } else {
          api.insertBefore(parentElm, createElm(newStartVNode, insertedVNodeQueue), toInsertBefore);
        }
      } else {
        elmToMove = oldCh[idxInOld];
        if (elmToMove.sel !== newStartVNode.sel) {
          const toInsertBefore = toVNodeArr(oldStartVNode)[0].elm;
          if (isFragment(newStartVNode)) {
            flattenFragment(newStartVNode, insertedVNodeQueue).forEach((child) => {
              api.insertBefore(parentElm, createElm(child, insertedVNodeQueue), toInsertBefore);
            });
          } else {
            api.insertBefore(parentElm, createElm(newStartVNode, insertedVNodeQueue), toInsertBefore);
          }
        } else {
          patchVNode(elmToMove, newStartVNode, insertedVNodeQueue);
          oldCh[idxInOld] = undefined as any;
          const toInsertBefore = toVNodeArr(oldStartVNode)[0].elm;
          if (isFragment(elmToMove)) {
            flattenFragment(elmToMove).forEach((child) => {
              api.insertBefore(parentElm, child.elm, toInsertBefore);
            });
          } else {
            api.insertBefore(parentElm, elmToMove.elm, toInsertBefore);
          }
        }
      }
      newStartVNode = newCh[++newStartIdx];
    }
  }
  if (oldStartIdx <= oldEndIdx || newStartIdx <= newEndIdx) {
    if (oldStartIdx > oldEndIdx) {
      const beforeVNode = newCh[newEndIdx + 1];
      if (beforeVNode && isFragment(beforeVNode)) {
        before = toVNodeArr(beforeVNode)[0].elm;
      } else {
        before = !newCh[newEndIdx + 1] ? insertBefore : newCh[newEndIdx + 1].elm;
      }

      addVNodes(parentElm, before, newCh, newStartIdx, newEndIdx, insertedVNodeQueue);
    } else {
      removeVNodes(parentElm, oldCh, oldStartIdx, oldEndIdx);
    }
  }
}

function patchVNode(oldVNode: VNode, vNode: VNode, insertedVNodeQueue: VNode[]) {
  // const hook = vNode.data?.hook;
  // We don't use prePatch hook
  // hook?.prePatch?.(oldVNode, vNode);
  const elm = vNode.elm = oldVNode.elm;
  const oldCh = oldVNode.children as VNode[];
  const ch = vNode.children as VNode[];
  if (oldVNode === vNode) return;
  if (isDef(vNode.data)) {
    for (let i = 0; i < cbs.update.length; ++i) cbs.update[i](oldVNode, vNode);
    if (vNode.data.hook && vNode.data.hook.update) vNode.data.hook.update(oldVNode, vNode);
  }
  if (isUndef(vNode.text)) {
    if (isDef(oldCh) && isDef(ch)) {
      if (oldCh !== ch) updateChildren(elm, oldCh, ch, insertedVNodeQueue);
    } else if (isDef(ch)) {
      if (isDef(oldVNode.text)) api.setTextContent(elm, '');
      addVNodes(elm, null, ch, 0, ch.length - 1, insertedVNodeQueue);
    } else if (isDef(oldCh)) {
      removeVNodes(elm, oldCh, 0, oldCh.length - 1);
    } else if (isDef(oldVNode.text)) {
      api.setTextContent(elm, '');
    }
  } else if (oldVNode.text !== vNode.text) {
    if (isDef(oldCh)) {
      removeVNodes(elm, oldCh, 0, oldCh.length - 1);
    }
    api.setTextContent(elm, vNode.text);
  }
  // We don't use prePatch hook
  // hook?.postPatch?.(oldVNode, vNode);
}

/* eslint-enable */

export const patch = (oldVNode: VNode | Element, vNode: VNode): VNode => {
  let i: number, elm: Node, parent: Node;
  const insertedVNodeQueue: VNode[] = [];
  for (i = 0; i < cbs.pre.length; ++i) cbs.pre[i]();

  if (!isVNode(oldVNode)) {
    oldVNode = emptyNodeAt(oldVNode);
  }

  if (sameVNode(oldVNode, vNode)) {
    patchVNode(oldVNode, vNode, insertedVNodeQueue);
  } else {
    elm = oldVNode.elm;
    parent = api.parentNode(elm);

    createElm(vNode, insertedVNodeQueue);

    if (parent) {
      api.insertBefore(parent, vNode.elm, api.nextSibling(elm));
      removeVNodes(parent, [oldVNode], 0, 0);
    }
  }

  for (i = 0; i < insertedVNodeQueue.length; ++i) {
    insertedVNodeQueue[i]?.data?.hook?.insert?.(insertedVNodeQueue[i]);
  }
  for (i = 0; i < cbs.post.length; ++i) cbs.post[i]();
  return vNode;
}

const expUpdateChildren = ({
  parentElm,
  oldCh,
  newCh,
  insertBefore = null
}: {
  parentElm: Node;
  oldCh: VNode[];
  newCh: VNode[];
  insertBefore?: Node;
}) => {
  const insertedVNodeQueue: VNode[] = [];
  updateChildren(parentElm, oldCh, newCh, insertedVNodeQueue, insertBefore);
  insertedVNodeQueue.forEach((insertedVNode) => insertedVNode.data?.hook?.insert?.(insertedVNode));
}

export { expUpdateChildren as updateChildren }
