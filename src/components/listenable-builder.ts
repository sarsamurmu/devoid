import { Notifier } from './shared';
import { Context } from '../context';
import { AnyComp } from '../utils';
import { Component } from '../component';

export const ValueNotifier = <T>(data?: T) => {
  const obj = {} as Record<string, any>;
  const listenerMap = new Map<any, () => void>();
  const def = {
    configurable: false,
    enumerable: false
  }

  Object.defineProperties(obj, {
    addListener: {
      ...def,
      get: () => (key: any, callback: () => void) => listenerMap.set(key, callback),
    },
    removeListener: {
      ...def,
      get: () => (key: any) => listenerMap.delete(key),
    },
    notifyListeners: {
      ...def,
      get: () => () => listenerMap.forEach((callback) => callback()),
    }
  });

  /* eslint-disable @typescript-eslint/no-use-before-define */

  const proxyHandler = {
    set: (aObj: any, key: string, value: any) => {
      try {
        aObj[key] = proxify(value);
        obj.notifyListeners();
        return true;
      } catch {
        return false;
      }
    }
  }

  /* eslint-enable */

  function proxify(data: any) {
    if (typeof data === 'object' && data !== null) {
      if (Array.isArray(data)) {
        data.forEach((value, index) => data[index] = proxify(value));
      } else {
        for (const key in data) data[key] = proxify(data[key]);
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

interface ListenableBuilderOptions {
  listenTo: Notifier[];
  builder: (context: Context) => AnyComp;
}

export class ListenableBuilder extends Component {
  private readonly options: ListenableBuilderOptions;

  constructor(listenableBuilderOptions: ListenableBuilderOptions) {
    super();
    this.options = listenableBuilderOptions;
    listenableBuilderOptions.listenTo.forEach((notifier) => {
      notifier.addListener(this, () => this.rebuild());
    });
  }

  didDestroy() {
    this.options.listenTo.forEach((notifier) => notifier.removeListener(this));
  }

  build(context: Context) {
    return this.options.builder(context);
  }
}
