import { debug, warn, copyMap, createSymbol, generateUniqueId } from '../utils';
import { Component, build, onMount, onDestroy, getRebuilder, memoComponent, DevoidComponent } from '../component';
import { Context } from '../context';

export class Model<D = any> {
  data: D;
  listeners = new Map<any, (tags: any[]) => void>();

  $add(key: any, callback: (tags: any[]) => void) {
    this.listeners.set(key, callback);
  }

  $remove(key: any) {
    this.listeners.delete(key);
  }

  $notify(tags: any[] = []) {
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
    this.data = builder((tags = []) => this.$notify(tags), props);
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

interface ConsumerOptions {
  models: (new() => Model)[];
  tags: any[];
  child: DevoidComponent;
  builder: (context: Context, getModel: <T extends Model>(model: new() => T) => T, child: DevoidComponent) => DevoidComponent;
}

export const Consumer = (options: ConsumerOptions) => Component((context) => {
  const providerMap = context.get<ProviderMap>(providerKey);
  const consumerKey = generateUniqueId();
  const rebuild = getRebuilder();
  const memoizedComponent = memoComponent(options.child);

  onMount(() => {
    if (debug) {
      if (!providerMap) warn('Consumer should be a descendant of a Provider, but no Provider ancestor found');
    }
    options.models.forEach((modelKey) => {
      const model = providerMap.get(modelKey);
      model.$add(consumerKey, (tags) => {
        if (
          tags.length === 0 ||
          !options.tags ||
          tags.some((tag) => options.tags.indexOf(tag) > -1)
        ) rebuild();
      });
    });
  });

  onDestroy(() => {
    options.models.forEach((modelKey) => {
      const model = providerMap.get(modelKey);
      model.$remove(consumerKey);
    });
  });
  
  build(() => options.builder(
    context,
    (model) => {
      if (debug) {
        if (options.models.indexOf(model) < 0) warn('Consumer is not subscribed to the model you are trying to get. The builder function - ', options.builder);
      }
      return Provider.of(context, model);
    },
    memoizedComponent,
  ));
});
