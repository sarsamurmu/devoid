import {
  EventManager,
  debug,
  warn,
  buildChild,
  generateUniqueId,
  buildChildren,
  mergeProperties,
  patchStateProperties
} from './utils';
import { updateChildren, patch } from './mount';
import { Context } from './context';
import vnode, { VNode } from 'snabbdom/es/vnode';
import { ChildType } from './utils';

type voidFun = () => void;

/* istanbul ignore next */
const hookWarn = (array: any[], name: string) => {
  if (debug) {
    if (array.length === 0) warn(`You shouldn't call ${name}() outside of Component function. This can cause error.`);
  }
}

export interface DevoidComponent {
  states?: StatesType;
  reloadWith?: (newComp: DevoidComponent) => void;
  render: (context: Context, prevVNodes?: VNode[], prevStates?: StatesType) => VNode[];
}

const buildCbs: [() => DevoidComponent, Context][] = [];
export const build = (buildFun: () => DevoidComponent, useContext?: Context) => buildCbs[buildCbs.length - 1] = [buildFun, useContext];

type DeepPartial<T> = {
  [K in keyof T]?: DeepPartial<T[K]> | T[K];
};

interface CallbackOrData<T extends Record<string, any>> {
  (callback: (currentState: T) => void): void;
  (newData: DeepPartial<T>, shouldClone?: boolean): void;
}

const stateChangeCbs: voidFun[][] = [];
export const createState = <T extends Record<string, any>>(stateData: T): [Readonly<T>, CallbackOrData<T>] => {
  hookWarn(stateChangeCbs, 'createState');

  const state = stateData;
  const listeners = stateChangeCbs[stateChangeCbs.length - 1];

  Object.defineProperty(state, '$devoidState', {
    enumerable: false,
    configurable: false,
    get: () => true
  });

  const setState = (callbackOrData: ((cState: T) => void) | DeepPartial<T>, shouldClone = false) => {
    if (typeof callbackOrData === 'function') {
      (callbackOrData as (cState: T) => void)(state);
    } else {
      mergeProperties(state, callbackOrData, shouldClone);
    }
    listeners.forEach((cb) => cb());
  }

  return [state, setState];
}

interface Value<T = any> {
  /** Returns the value of the value holder */
  (): T;
  /** Sets the new value and triggers rebuild process of the component */
  (newValue: T): T;
  /** Sets the new value but doesn't trigger rebuild process of the component */
  $(newValue: T): T;
}

interface ValueWatchable<T = any> extends Value<T> {
  watch(onChange: voidFun): voidFun;
}

const valueDataArr: ({ canUseSetter: boolean })[] = [];
export const value = <T = any>(initialValue: T): Value<T> => {
  hookWarn(stateChangeCbs, 'value');

  let val: T = initialValue;
  let used = false;

  const listeners = stateChangeCbs[stateChangeCbs.length - 1];
  const valueData = valueDataArr[valueDataArr.length - 1];
  const valueListeners = new Set<voidFun>();

  function setOrGet(newValue?: T): T {
    if (arguments.length === 0) {
      used = true;
    } else if (val !== newValue) {
      if (!valueData.canUseSetter) {
        if (debug) warn('You cannot set value inside of watch callback, because it can cause infinite loops');
        return;
      }
      val = newValue;
      valueData.canUseSetter = false;
      valueListeners.forEach((cb) => cb());
      valueData.canUseSetter = true;
      if (used) listeners.forEach((cb) => cb());
    }
    return val;
  }
  setOrGet.$ = (newValue: T) => val = newValue;
  setOrGet.watch = (onChange: voidFun) => {
    valueListeners.add(onChange);
    return () => valueListeners.delete(onChange);
  }

  Object.defineProperty(setOrGet, '$devoidValue', {
    enumerable: false,
    configurable: false,
    get: () => true
  });

  return setOrGet;
}

export const watchValues = <T extends readonly Value[]>(values: T, onChange: () => void) => {
  const removeCbs: voidFun[] = [];
  values.forEach((val: ValueWatchable) => removeCbs.push(val.watch(onChange)));
  return () => removeCbs.forEach((removeCb) => removeCb());
}

type StatesType = Record<string, Readonly<Record<string, any>> | Value>;
const debugStatesArr: StatesType[] = [];
export const debugStates = (states: StatesType) => {
  hookWarn(debugStatesArr, 'debugStates');
  debugStatesArr[debugStatesArr.length - 1] = states;
}

export const getRebuilder = () => {
  hookWarn(stateChangeCbs, 'getRebuilder');
  const listeners = stateChangeCbs[stateChangeCbs.length - 1];
  return () => listeners.forEach((cb) => cb());
}

const onMountCbs: voidFun[][] = [];
export const onMount = (callback: voidFun) => {
  hookWarn(onMountCbs, 'onMount');
  onMountCbs[onMountCbs.length - 1].push(callback);
}

const onUpdateCbs: voidFun[][] = [];
export const onUpdate = (callback: voidFun) => {
  hookWarn(onUpdateCbs, 'onUpdate');
  onUpdateCbs[onUpdateCbs.length - 1].push(callback);
}

const onDestroyCbs: voidFun[][] = [];
export const onDestroy = (callback: voidFun) => {
  hookWarn(onDestroyCbs, 'onDestroy');
  onDestroyCbs[onDestroyCbs.length - 1].push(callback);
}

export const Component = (builder: (context: Context) => void): DevoidComponent => {
  const instance = {} as DevoidComponent;

  let mountedVNodeCount = 0;
  let childVNodes: VNode[];
  let mounted = false;
  let buildData: [() => DevoidComponent, Context];
  let onStateChange: voidFun[];
  let mountedCbs: voidFun[];
  let updateCbs: voidFun[];
  let destroyCbs: voidFun[];
  let states: StatesType;
  let context: Context;
  const componentKey = generateUniqueId();

  const init = (aContext: Context) => {
    buildCbs.push([] as any);
    stateChangeCbs.push([]);
    valueDataArr.push({ canUseSetter: true });
    debugStatesArr.push(null);
    onMountCbs.push([]);
    onUpdateCbs.push([]);
    onDestroyCbs.push([]);

    builder(aContext);

    buildData = buildCbs.pop();
    onStateChange = stateChangeCbs.pop();
    mountedCbs = onMountCbs.pop();
    updateCbs = onUpdateCbs.pop();
    destroyCbs = onDestroyCbs.pop();
    states = debugStatesArr.pop();
    context = aContext;
    valueDataArr.pop();

    if (debug) {
      if (!buildData[0]) {
        warn('build() function should be called inside of a component, but no build call found in', builder);
      }

      if (states) {
        instance.states = states;
      }
    }
  }

  const render = () => {
    const vNodes = buildChild(buildData[1] instanceof Context ? buildData[1] : context, buildData[0]());

    const doOnMount = () => {
      if (mounted) return;
      mounted = true;
      mountedCbs.forEach((cb) => cb());
    }
    const doOnUpdate = () => updateCbs.forEach((cb) => cb());
    const doOnDestroy = () => {
      if (!mounted) return;
      mounted = false;
      destroyCbs.forEach((cb) => cb());
    }

    if (vNodes.length === 1) {
      const eventManager = vNodes[0].data.eventManager as EventManager;
      eventManager.add('mount', doOnMount, componentKey);
      eventManager.add('update', doOnUpdate, componentKey);
      eventManager.add('destroy', () => {
        doOnDestroy();
        eventManager.removeKey(componentKey);
      }, componentKey);
    } else {
      vNodes.forEach((vNode) => {
        const eventManager = vNode.data.eventManager as EventManager;
        eventManager.add('mount', () => {
          if (++mountedVNodeCount === childVNodes.length) doOnMount();
        }, componentKey);
        eventManager.add('destroy', () => {
          if (--mountedVNodeCount === 0) {
            doOnDestroy();
            eventManager.removeKey(componentKey);
          }
        }, componentKey);
      });
    }

    return vNodes;
  }

  const rebuild = (prevVNodes?: VNode[]) => {
    if (prevVNodes) {
      childVNodes = prevVNodes;
      mounted = true;
    }
    if (!mounted) {
      if (debug) warn('Component triggering rebuild before it is mounted', builder);
      return;
    }
    const newVNodes = render();
    if (childVNodes.length === 1 && newVNodes.length === 1) {
      patch(childVNodes[0], newVNodes[0]);
      childVNodes[0] = newVNodes[0];
    } else {
      updateChildren({
        parentElm: childVNodes[0].elm.parentElement,
        oldCh: childVNodes,
        newCh: newVNodes,
        insertBefore: childVNodes[childVNodes.length - 1].elm.nextSibling,
      });
      childVNodes.length = newVNodes.length;
      newVNodes.forEach((newVNode, index) => childVNodes[index] = newVNode);
    }
    return childVNodes;
  }

  instance.render = (aContext: Context, prevVNodes, prevStates) => {
    init(aContext);
    if (onStateChange) onStateChange.push(() => rebuild());
    if (debug) {
      if (prevVNodes) {
        if (states && prevStates) {
          for (const stateKey in prevStates) {
            const prevVal = prevStates[stateKey] as any;
            const val = states[stateKey] as any;
            if (!(val && prevVal)) continue;
            if (prevVal.$devoidValue && val.$devoidValue) {
              val.$(prevVal());
            } else if (prevVal.$devoidState && val.$devoidState) {
              patchStateProperties(prevVal, val);
            }
          }
        }
        return rebuild(prevVNodes);
      }
    }
    return (childVNodes = render());
  }

  if (debug) {
    instance.reloadWith = (newComp) => {
      childVNodes.forEach((vNode) => {
        const eventManager = vNode.data.eventManager as EventManager;
        eventManager.removeKey(componentKey);
      });
      newComp.render(context, childVNodes, states);
    }
  }

  return instance;
}

export const memoComponent = (componentToCache: DevoidComponent): DevoidComponent => {
  let renderedComponent: VNode[];
  return {
    render: (context) => renderedComponent || (renderedComponent = componentToCache.render(context))
  }
}

const createVNodeData = () => {
  const eventManager = new EventManager();
  return {
    hook: {
      insert() { eventManager.trigger('mount') },
      destroy() { eventManager.trigger('destroy') }
    },
    eventManager
  }
}

export const Fragment = (children: ChildType[]): DevoidComponent => {
  const fragmentKey = generateUniqueId();
  return {
    render: (context) => {
      const vNodes = buildChildren(context, children);
      if (vNodes.length === 0) vNodes.push(vnode('!', { key: fragmentKey }, undefined, 'dFrag', undefined));
      vNodes.forEach((vNode) => {
        if (!vNode.data) {
          vNode.data = createVNodeData();
        } else if (!vNode.data.hook) {
          Object.assign(vNode.data, createVNodeData());
        }
      });
      return vNodes;
    }
  }
}
