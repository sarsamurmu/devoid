import { Component, build, createState, onMount, DevoidComponent } from '../component';
import { Context } from '../context';

export interface AsyncSnapshot<T> {
  data: T;
  hasData: boolean;
  resolved: boolean;
  fulfilled: boolean;
  error: Error;
  rejected: boolean;
  rejectReason: any;
}

export interface AsyncBuilderOptions<T> {
  getter: () => Promise<T>;
  builder: (context: Context, snapshot: AsyncSnapshot<T>) => DevoidComponent;
}

export const AsyncBuilder = <T>(options: AsyncBuilderOptions<T>) => Component((context) => {
  const [snapshot, setSnapshot] = createState<AsyncSnapshot<T>>({
    data: undefined,
    hasData: false,
    resolved: false,
    fulfilled: false,
    error: undefined,
    rejected: false,
    rejectReason: undefined,
  });

  onMount(() => {
    options.getter()
      .then((data) => setSnapshot({
        data,
        hasData: typeof data !== 'undefined',
        resolved: true,
        fulfilled: true
      }), (reason) => setSnapshot({
        resolved: true,
        rejected: true,
        rejectReason: reason
      }))
      .catch((error) => setSnapshot({
        error,
        resolved: true
      }));
  })

  build(() => options.builder(context, snapshot));
});
