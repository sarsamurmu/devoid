import { Component } from './component';
import { anyComp, log } from './utils';
import { Context } from './context';
import { DuzeNode } from './duzenode';

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
      .catch((error) => log(this) || (this.snapshot.error = error))
      .finally(() => this.setState());
  }

  build(context: Context): anyComp {
    return asyncBuilderOptions.builder(context, this.snapshot);
  }
});

const themeKey = 'DuzeDefaultThemeKey';

const Theme = (themeOptions: {
  themeData: any,
  child: anyComp | ((context: Context) => anyComp)
}) => new (class extends Component {
  build(context: Context): anyComp {
    return typeof themeOptions.child === 'function' ? themeOptions.child(context) : themeOptions.child;
  }

  render(context: Context): DuzeNode {
    this.context = context ? context.copy() : new Context();
    this.context.set(themeKey, themeOptions.themeData);
    return super.render(this.context);
  }
});

Theme.of = (context: Context) => context.get(themeKey);

export { Theme }
