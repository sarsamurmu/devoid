import { includes, debug, warn, copyMap, createSymbol, generateUniqueId } from '../utils';
import { Component, build, onMount, onDestroy, getRebuilder, cacheComponent, DevoidComponent } from '../component';
import { Context } from '../context';

export class Model<D = any> {
  data: D;
  listeners = new Map<any, (tags: any[]) => void>();

  addListener(key: any, callback: (tags: any[]) => void) {
    this.listeners.set(key, callback);
  }

  removeListener(key: any) {
    this.listeners.delete(key);
  }

  notifyListeners(tags: any[] = []) {
    this.listeners.forEach((callback) => callback(tags));
  }
}

interface ProviderOptions {
  create: (context: Context) => Model;
  child: DevoidComponent;
}

const providerKey = createSymbol('ProviderKey');
type ProviderMap = Map<typeof Model.constructor, Model>;

export const createModel = <T, S>(builder: (notifyListeners: (tags: any[]) => void, props: T) => S) => class extends Model<S> {
  constructor(props?: T) {
    super();
    this.data = builder((tags = []) => this.notifyListeners(tags), props);
  }
}

export const Provider = (options: ProviderOptions) => Component((context) => {
  const providerContext = context.copy();
  const prevProvider = context.get<ProviderMap>(providerKey);
  const newProvider = new Map();
  if (prevProvider) copyMap(prevProvider, newProvider);
  providerContext.set(providerKey, newProvider);
  const model = options.create(context);
  providerContext.get<ProviderMap>(providerKey).set(model.constructor, model);

  build(() => options.child, providerContext);
});

Provider.of = <T extends Model>(context: Context, model: new() => T): T['data'] => {
  const providerMap = context.get<ProviderMap>(providerKey);
  if (debug) {
    if (!providerMap) {
      warn('Provider.of should be called on descendant context of a Provider component, but no Provider ancestor found');
      return null;
    }
  }
  return providerMap.get(model).data;
}

interface ConsumerOptions<T extends Model> {
  model: new() => T;
  tags: any[];
  child: DevoidComponent;
  builder: (context: Context, value: T['data'], child: DevoidComponent) => DevoidComponent;
}

export const Consumer = <T extends Model>(options: ConsumerOptions<T>) => Component((context) => {
  const changeNotifier = context.get<ProviderMap>(providerKey).get(options.model);
  const consumerKey = generateUniqueId();
  const rebuild = getRebuilder();
  const cachedComponent = cacheComponent(options.child);

  onMount(() => {
    if (debug) {
      if (changeNotifier === null) warn('Consumer should be a descendant of a Provider, but no Provider ancestor found');
    }
    changeNotifier.addListener(consumerKey, (tags) => {
      if (tags.length === 0 || !options.tags || tags.some((tag) => includes(options.tags, tag))) rebuild();
    });
  });

  onDestroy(() => {
    Provider.of(context, options.model).removeListener(consumerKey);
  });
  
  build(() => options.builder(
    context,
    Provider.of(context, options.model),
    cachedComponent,
  ));
});
