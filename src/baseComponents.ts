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

export const AsyncBuilder = (asyncBuilderOptions: {
  getter: () => Promise<unknown>,
  builder: (context: Context, snapshot: AsyncSnapshot) => (anyComp)
}) => new (class extends Component {
  snapshot: AsyncSnapshot;

  init() {
    this.snapshot = {
      data: undefined,
      hasData: false,
      resolved: false,
      error: null,
    }
  }

  didMount() {
    asyncBuilderOptions.getter()
      .then((data) => {
        this.snapshot.data = data;
        this.snapshot.hasData = typeof data !== 'undefined';
        this.snapshot.resolved = true;
      }, (error) => (this.snapshot.error = error))
      .catch((error) => (this.snapshot.error = error))
      .finally(() => this.setState());
  }

  build(context: Context): anyComp {
    return asyncBuilderOptions.builder(context, this.snapshot);
  }
});

const themeKey = 'DuzeDefaultThemeKey';

export const Theme = (themeOptions: {
  themeData: any,
  child: anyComp | ((context: Context) => anyComp)
}) => new (class extends Component {
  build(context: Context): anyComp {
    return typeof themeOptions.child === 'function' ? themeOptions.child(context) : themeOptions.child;
  }

  render(context: Context): DuzeNode {
    this.context = context.copy();
    this.context.set(themeKey, themeOptions.themeData);
    return super.render(this.context);
  }
});

Theme.of = (context: Context) => context.get(themeKey);

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
  _value: any;

  constructor() {
    super();
    this._value = initialValue;
  }

  set value(newValue: any) {
    this._value = newValue;
    this.notifyListeners();
  }

  get value() {
    return this._value;
  }
});

export const ListenerBuilder = (listenerBuilderOptions: {
  listenTo: Notifier[],
  child: anyComp | ((context: Context) => anyComp)
}) => new (class extends Component {
  constructor() {
    super();
    for (const notifier of listenerBuilderOptions.listenTo) {
      notifier.setListener(this, () => this.setState());
    }
  }

  didDestroy() {
    for (const notifier of listenerBuilderOptions.listenTo) {
      notifier.removeListener(this);
    }
  }

  build(context: Context): anyComp {
    return typeof listenerBuilderOptions.child === 'function' ? listenerBuilderOptions.child(context) : listenerBuilderOptions.child;
  }
});
