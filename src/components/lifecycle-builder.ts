import { AnyComp } from '../utils';
import { Context } from '../context';
import { Component } from '../component';

interface LifecycleBuilderOptions {
  didMount(): void;
  didUpdate(): void;
  didDestroy(): void;
  child: AnyComp;
}

export class LifecycleBuilder extends Component {
  private readonly options: LifecycleBuilderOptions;

  constructor(options: LifecycleBuilderOptions) {
    super();
    this.options = Object.assign({
      didMount: () => 0,
      didUpdate: () => 0,
      didDestroy: () => 0,
    }, options);
  }

  didMount() {
    this.options.didMount();
  }

  didUpdate() {
    this.options.didUpdate();
  }

  didDestroy() {
    this.options.didDestroy();
  }

  build() {
    return this.options.child;
  }
}
