export {
  DevoidComponent,
  build,
  SetStateFun,
  createState,
  Value,
  value,
  watchValues,
  StatesType,
  debugStates,
  getRebuilder,
  onMount,
  onUpdate,
  onDestroy,
  Component,
  memoComponent,
  Fragment
} from './component';
export { Context } from './context';
export { createEl } from './createEl';
export {
  Ref,
  Tags,
  ElementData,
  ref,
  elR,
  el,
  elements
} from './element';
export {
  EventManager,
  createKey,
  globalKey,
  FC,
  ChildType
} from './utils';
export { mount } from './mount';
export * from './components';
export const version = '__VERSION__';
