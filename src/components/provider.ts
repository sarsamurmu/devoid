import { Notifier } from './shared';
import { AnyComp } from '../utils';
import { Component } from '../component';
import { Fragment } from '../fragment';
import { Context } from '../context';

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

  static of<T extends ChangeNotifier>(context: Context, type: new () => T): T {
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
