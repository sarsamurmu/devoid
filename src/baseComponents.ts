import { Component } from './component';
import { anyComp } from './utils';
import { Context } from './context';
import { PrimaryComponent } from './elements';

interface AsyncSnapshot {
  data: any;
  hasData: boolean;
  resolved: boolean;
  error: object;
}

interface AsyncBuilderOptions {
  getter: () => Promise<unknown>;
  builder: (context: Context, snapshot: AsyncSnapshot) => (anyComp);
}

export class AsyncBuilder extends Component {
  snapshot: AsyncSnapshot;
  options: AsyncBuilderOptions;

  constructor(asyncBuilderOptions: AsyncBuilderOptions) {
    super();
    this.options = asyncBuilderOptions;
    this.snapshot = {
      data: undefined,
      hasData: false,
      resolved: false,
      error: null,
    }
  }

  static create(props: AsyncBuilderOptions) {
    return new AsyncBuilder(props);
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

  build(context: Context): anyComp {
    return this.options.builder(context, this.snapshot);
  }
}

/////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////

const themeKey = 'StrutDefaultThemeKey';

interface ThemeOptions {
  themeData: any;
  child: anyComp | ((context: Context) => anyComp);
}

export class Theme extends Component {
  options: ThemeOptions;

  constructor(themeOptions: ThemeOptions) {
    super();
    this.options = themeOptions;
  }

  static of(context: Context) {
    return context.get(themeKey);
  }

  build(context: Context): anyComp {
    return typeof this.options.child === 'function' ? this.options.child(context) : this.options.child;
  }

  render(context: Context) {
    this.context = context.copy();
    this.context.set(themeKey, this.options.themeData);
    return super.render(this.context);
  }
}

////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////

export interface Notifier {
  setListener(key: any, callback: () => void): void;
  removeListener(key: any): void;
  notifyListeners(): void;
}

export const ValueNotifier = <T extends (Record<string, any> | any)>(data?: T) => {
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

  const proxify = (data: any) => {
    if (typeof data === 'object' && data !== null) {
      for (const [key, value] of Object.entries(data)) {
        data[key] = proxify(value);
      }
      return new Proxy(data, {
        set: (obj, key, value) => {
          if (Reflect.set(obj, key, proxify(value))) {
            obj.notifyListeners();
            return true;
          }
          return false;
        }
      });
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

  return new Proxy(obj, {
    set: (obj, key, value) => {
      if (Reflect.set(obj, key, proxify(value))) {
        obj.notifyListeners();
        return true;
      }
      return false;
    }
  }) as unknown as Notifier & T & Record<string, any>;
}

interface ListenerBuilderOptions {
  listenTo: Notifier[];
  child: anyComp | ((context: Context) => anyComp);
}

export class ListenerBuilder extends Component {
  options: ListenerBuilderOptions;

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

  build(context: Context): anyComp {
    return typeof this.options.child === 'function' ? this.options.child(context) : this.options.child;
  }
}

///////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////

interface LifecycleBuilderOptions {
  didMount(): void;
  didUpdate(): void;
  didDestroy(): void;
  child: anyComp | ((context: Context) => anyComp);
}

export class LifecycleBuilder extends Component {
  options: LifecycleBuilderOptions;

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

  build(context: Context): anyComp {
    return typeof this.options.child === 'function' ? this.options.child(context) : this.options.child;
  }
}
