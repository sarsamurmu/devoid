import { Component } from './component';
import { AnyComp } from './utils';
import { Context } from './context';
import { Fragment } from './fragment';

interface AsyncSnapshot<T> {
  data: T;
  hasData: boolean;
  resolved: boolean;
  error: Error;
}

interface AsyncBuilderOptions<T> {
  getter: () => Promise<T>;
  builder: (context: Context, snapshot: AsyncSnapshot<T>) => AnyComp;
}

export class AsyncBuilder<T> extends Component {
  private snapshot: AsyncSnapshot<T>;
  private readonly options: AsyncBuilderOptions<T>;

  constructor(asyncBuilderOptions: AsyncBuilderOptions<T>) {
    super();
    this.options = asyncBuilderOptions;
    this.snapshot = {
      data: undefined,
      hasData: false,
      resolved: false,
      error: null,
    }
  }

  didMount() {
    this.options.getter()
      .then((data) => {
        this.snapshot.data = data;
        this.snapshot.hasData = typeof data !== 'undefined';
        this.snapshot.resolved = true;
      }, (error) => (this.snapshot.error = error))
      .catch((error) => (this.snapshot.error = error))
      .finally(() => this.rebuild());
  }

  build(context: Context) {
    return this.options.builder(context, this.snapshot);
  }
}

////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////

export interface Notifier {
  setListener(key: any, callback: () => void): void;
  removeListener(key: any): void;
  notifyListeners(): void;
}

export const ValueNotifier = <T>(data?: T) => {
  interface NotifierObject extends Notifier, Record<string, any> {
    '#listeners#': Map<any, () => void>;
  }
  const obj = {} as NotifierObject;
  const listenerMap = new Map();
  const def = {
    configurable: false,
    enumerable: false
  }

  Object.defineProperties(obj, {
    '#listeners#': {
      ...def,
      get: () => listenerMap,
    },
    setListener: {
      ...def,
      get: () => (key: any, callback: () => void) => obj['#listeners#'].set(key, callback),
    },
    removeListener: {
      ...def,
      get: () => (key: any) => obj['#listeners#'].delete(key),
    },
    notifyListeners: {
      ...def,
      get: () => () => {
        for (const callback of obj['#listeners#'].values()) callback();
      },
    }
  });

  /* eslint-disable @typescript-eslint/no-use-before-define */

  const proxyHandler = {
    set: (_: any, key: string, value: any) => {
      try {
        obj[key] = proxify(value);
        obj.notifyListeners();
        return true;
      } catch {
        return false;
      }
    }
  }

  function proxify(data: any) {
    if (typeof data === 'object' && data !== null) {
      for (const [key, value] of Object.entries(data)) {
        data[key] = proxify(value);
      }
      return new Proxy(data, proxyHandler);
    }
    return data;
  }

  if (typeof data === 'object' && obj !== null) {
    for (const key in data) {
      obj[key] = proxify(data[key]);
    }
  } else {
    obj.value = data;
  }

  return new Proxy(obj, proxyHandler) as any as Notifier & (T extends Record<string, any> ? T : { value: T }) & Record<string, any>;
}

/* eslint-enable */

interface ListenerBuilderOptions {
  listenTo: Notifier[];
  builder: (context: Context) => AnyComp;
}

export class ListenerBuilder extends Component {
  private readonly options: ListenerBuilderOptions;

  constructor(listenerBuilderOptions: ListenerBuilderOptions) {
    super();
    this.options = listenerBuilderOptions;
    for (const notifier of listenerBuilderOptions.listenTo) {
      notifier.setListener(this, () => this.rebuild());
    }
  }

  didDestroy() {
    for (const notifier of this.options.listenTo) {
      notifier.removeListener(this);
    }
  }

  build(context: Context) {
    return this.options.builder(context);
  }
}

///////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////

interface LifecycleBuilderOptions {
  didMount(): void;
  didUpdate(): void;
  didDestroy(): void;
  child: AnyComp | ((context: Context) => AnyComp);
}

export class LifecycleBuilder extends Component {
  private readonly options: LifecycleBuilderOptions;

  constructor(options: LifecycleBuilderOptions) {
    super();
    this.options = options;
  }

  didMount() {
    this.options.didMount();
  }

  didUpdate() {
    this.options.didUpdate();
  }

  didDestroy() {
    this.options.didDestroy();
  }

  build(context: Context) {
    return typeof this.options.child === 'function' ? this.options.child(context) : this.options.child;
  }
}

///////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////

export class ChangeNotifier implements Notifier {
  listeners = new Map<any, () => void>();

  setListener(key: any, callback: () => void) {
    this.listeners.set(key, callback);
  }

  removeListener(key: any) {
    this.listeners.delete(key);
  }

  notifyListeners() {
    this.listeners.forEach((callback) => callback());
  }
}

interface ProviderOptions {
  value: ChangeNotifier;
  children: AnyComp;
}

const providerKey = Symbol('ProviderKey');
type providerMap = Map<typeof ChangeNotifier.constructor, ChangeNotifier>;

export class Provider extends Component {
  private readonly options: ProviderOptions;

  constructor(options: ProviderOptions) {
    super();
    this.options = options;
  }

  build() {
    return new Fragment([this.options.children]);
  }

  static of<T extends ChangeNotifier>(context: Context, type: new() => T): T {
    return context.get<providerMap>(providerKey).get(type) as T;
  }

  render(context: Context) {
    this.context = context.copy();
    const prevProvider = this.context.get<providerMap>(providerKey);
    this.context.set(providerKey, new Map(prevProvider ? prevProvider.entries() : undefined));
    this.options.value.setListener(this, () => this.rebuild());
    this.context.get<providerMap>(providerKey).set(this.options.value.constructor, this.options.value);
    return super.render(this.context);
  }
}
