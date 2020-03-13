import { log, anyComp, EventManager } from './utils';
import { patch } from './render';
import { Context } from './context';
import { DuzeNode } from './duzeNode';

interface ComponentData {
  props?: object;
  style?: { [key: string]: string | number };
  events?: { [key: string]: () => void };
  child?: Component | string;
  children?: (Component | string)[];
}

type compNodeTypes = DuzeNode | (string | number | DuzeNode)[];

abstract class Component {
  context: Context;
  child: anyComp;
  eventManager: EventManager;

  constructor() {
    this.eventManager = new EventManager();
  }

  setState(callback: () => void = () => {}) {
    callback();
    this.rebuild();
  }

  rebuild() {
    this.child.rebuild();
  }

  didMount() {}

  didUpdate() {}

  didDestroy() {}

  static create(props: Record<string, any>): Component {
    return null
  }

  abstract build(context: Context): anyComp;

  render(context: Context): compNodeTypes {
    this.context = context;
    this.child = this.build(context);
    this.child.eventManager.set('mount', this, () => {
      this.didMount.bind(this)();
      this.eventManager.trigger('mount');
    });
    this.child.eventManager.set('update', this, () => {
      this.didUpdate.bind(this)();
      this.eventManager.trigger('update');
    });
    this.child.eventManager.set('destroy', this, () => {
      this.didUpdate.bind(this)();
      this.eventManager.trigger('destroy');
      this.child.eventManager.removeKey(this);
    });
    return this.child.render(context);
  }
}

export { Component, ComponentData }
