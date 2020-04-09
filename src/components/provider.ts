import { Notifier } from './shared';
import { AnyComp, includes, debug, warn, copyMap } from '../utils';
import { Component, FLAG_STATELESS } from '../component';
import { Context } from '../context';

export class ChangeNotifier implements Notifier {
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
  create: (context: Context) => ChangeNotifier;
  child: AnyComp;
}

const providerKey = Symbol('ProviderKey');
type ProviderMap = Map<typeof ChangeNotifier.constructor, ChangeNotifier>;

export class Provider extends Component {
  private readonly options: ProviderOptions;
  private value: ChangeNotifier;

  constructor(options: ProviderOptions) {
    super(FLAG_STATELESS);
    this.options = options;
  }

  build() {
    return this.options.child;
  }

  onContext(context: Context) {
    this.context = context.copy();
    const prevProvider = context.get<ProviderMap>(providerKey);
    const newProvider = new Map();
    if (prevProvider) copyMap(prevProvider, newProvider);
    this.context.set(providerKey, newProvider);
    this.value = this.options.create(context);
    this.context.get<ProviderMap>(providerKey).set(this.value.constructor, this.value);
  }

  static of<T extends ChangeNotifier>(context: Context, type: new () => T): T {
    const providerMap = context.get<ProviderMap>(providerKey);
    if (debug) {
      if (!providerMap) {
        warn('Provider.of should be called on descendant context of a Provider component, but no Provider ancestor found');
        return null;
      }
    }
    return providerMap.get(type) as T;
  }
}

const makeCachedComponent = (component: AnyComp): Component => {
  return new (class CachedComponent extends Component {
    constructor() {
      super(FLAG_STATELESS);
    }

    build() {
      return component;
    }

    render() {
      return this.vNodes || (this.vNodes = super.render());
    }
  })
}

interface ConsumerOptions<T extends ChangeNotifier> {
  type: new() => T;
  builder: (context: Context, value: T, child: AnyComp) => AnyComp;
  tag?: any[];
  child?: AnyComp;
}

export class Consumer<T extends ChangeNotifier> extends Component {
  private options: ConsumerOptions<T>;

  constructor(options: ConsumerOptions<T>) {
    super();
    this.options = options;
    this.options.child = makeCachedComponent(this.options.child);
  }

  didMount() {
    const changeNotifier = Provider.of(this.context, this.options.type);
    if (debug) {
      if (changeNotifier === null) warn('Consumer should be a descendant of a Provider, but no Provider ancestor found');
    }
    changeNotifier.addListener(this, (tags) => {
      if (tags.length === 0 || !this.options.tag || tags.some((tag) => includes(this.options.tag, tag))) this.rebuild();
    });
  }

  didDestroy() {
    Provider.of(this.context, this.options.type).removeListener(this);
  }

  build(context: Context) {
    return this.options.builder(
      context,
      Provider.of(context, this.options.type),
      this.options.child
    );
  }
}
