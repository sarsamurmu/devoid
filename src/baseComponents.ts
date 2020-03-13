import { Component } from './component';
import { anyComp, log } from './utils';
import { Context } from './context';
import { DuzeNode } from './duzeNode';

export const Builder = (builderOptions: {
  builder: (context: Context) => (anyComp)
}) => new (class extends Component {
  build(context: Context): anyComp {
    return builderOptions.builder(context);
  }
});

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

const themeKey = 'DuzeDefaultThemeKey';

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

class Notifier {
  listeners: Map<any, () => void>;

  constructor() {
    this.listeners = new Map();
  }

  setListener(key: any, callback: () => void) {
    this.listeners.set(key, callback);
  }

  removeListener(key: any) {
    this.listeners.delete(key);
  }

  notifyListeners() {
    for (const [key, callback] of this.listeners) callback();
  }
}

export const ValueNotifier = (initialValue: any) => new (class extends Notifier {
  _$: any;

  constructor() {
    super();
    this._$ = initialValue;
  }

  set value(newValue: any) {
    this._$ = newValue;
    this.notifyListeners();
  }

  get value() {
    return this._$;
  }
});

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
