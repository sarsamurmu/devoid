import Component from './component';
import Context from './context';
import { anyComp, log } from './utils';

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
  getter: Promise<unknown>
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
    asyncBuilderOptions.getter
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
