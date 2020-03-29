import { Notifier } from './shared';
import { Context } from '../context';
import { AnyComp } from '../utils';
import { Component } from '../component';

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
