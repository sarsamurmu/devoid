import { Notifier } from './shared';
import { AnyComp, includes, any } from '../utils';
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
type providerMap = Map<typeof ChangeNotifier.constructor, ChangeNotifier>;

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
    const prevProvider = context.get<providerMap>(providerKey);
    this.context.set(providerKey, new Map(prevProvider ? prevProvider.entries() : undefined));
    this.value = this.options.create(context);
    this.value.addListener(this, () => this.rebuild());
    this.context.get<providerMap>(providerKey).set(this.value.constructor, this.value);
  }

  static of<T extends ChangeNotifier>(context: Context, type: new () => T): T {
    return context.get<providerMap>(providerKey).get(type) as T;
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

    render(context: Context) {
      return this.vNode || (this.vNode = super.render(context));
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
    Provider.of(this.context, this.options.type).addListener(this, (tags) => {
      if (tags.length === 0 || any(tags, (tag) => includes(this.options.tag, tag))) this.rebuild();
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
