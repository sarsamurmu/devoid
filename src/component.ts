import PrimaryComponent from './elements';
import { log, anyComp } from './utils';
import { VNode } from 'snabbdom/vnode';
import { patch } from './render';
import Context from './context';

interface ComponentData {
  props?: object;
  style?: { [key: string]: string | number };
  events?: { [key: string]: () => void };
  child?: Component | string;
  children?: (Component | string)[];
}

class Component {
  componentData: ComponentData;
  context: Context;
  vnode: VNode;

  constructor(componentData: ComponentData = {}) {
    this.componentData = componentData;
    this.init();
  }

  init() {}

  setState(callback: () => void = () => {}) {
    callback();
    patch(this.vnode, this.render(this.context));
  }

  didMount() {}

  didUpdate() {}

  didDestroy() {}

  build(context: Context): anyComp {
    return null
  }

  render(context: Context): VNode {
    this.context = context;
    this.vnode = (this.build(context)).render(context, {
      onDidMount: this.didMount.bind(this),
      onDidUpdate: this.didUpdate.bind(this),
      onDidDestroy: this.didDestroy.bind(this),
    });
    return this.vnode;
  }
}

export { Component as default, Component, ComponentData }
