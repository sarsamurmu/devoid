import { Component } from '../component';
import { Context } from '../context';
import { AnyComp } from '../utils';

interface AsyncSnapshot<T> {
  data: T;
  hasData: boolean;
  resolved: boolean;
  error: Error;
}

interface AsyncBuilderOptions<T> {
  getter: () => Promise<T>;
  builder: (context: Context, snapshot: AsyncSnapshot<T>) => AnyComp;
}

export class AsyncBuilder<T> extends Component {
  private snapshot: AsyncSnapshot<T>;
  private readonly options: AsyncBuilderOptions<T>;

  constructor(asyncBuilderOptions: AsyncBuilderOptions<T>) {
    super();
    this.options = asyncBuilderOptions;
    this.snapshot = {
      data: undefined,
      hasData: false,
      resolved: false,
      error: null,
    }
  }

  didMount() {
    const re = () => this.rebuild();
    this.options.getter()
      .then((data) => {
        this.snapshot.data = data;
        this.snapshot.hasData = typeof data !== 'undefined';
        this.snapshot.resolved = true;
        re();
      }, (error) => {
        this.snapshot.error = error;
        re();
      })
      .catch((error) => {
        this.snapshot.error = error;
        re();
      });
  }

  build(context: Context) {
    return this.options.builder(context, this.snapshot);
  }
}
