import { log, anyComp } from './utils';
import { patch } from './render';
import { Context } from './context';
import { DuzeNode } from './duzenode';

interface ComponentData {
  props?: object;
  style?: { [key: string]: string | number };
  events?: { [key: string]: () => void };
  child?: Component | string;
  children?: (Component | string)[];
}

abstract class Component {
  componentData: ComponentData;
  context: Context;
  duzeNode: DuzeNode;

  constructor(componentData: ComponentData = {}) {
    this.componentData = componentData;
    this.init();
  }

  init() {}

  setState(callback: () => void = () => {}) {
    callback();
    patch(this.duzeNode, this.render(this.context));
  }

  didMount() {}

  didUpdate() {}

  didDestroy() {}

  abstract build(context: Context): anyComp;

  render(context: Context): DuzeNode {
    this.context = context;
    this.duzeNode = (this.build(context)).render(context, {
      didMount: this.didMount.bind(this),
      didUpdate: this.didUpdate.bind(this),
      didDestroy: this.didDestroy.bind(this),
    });
    return this.duzeNode;
  }
}

export { Component, ComponentData }
