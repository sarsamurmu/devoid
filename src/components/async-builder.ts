import { Component, build, createState, onMount, DevoidComponent } from '../component';
import { Context } from '../context';
import { log } from '../utils';

interface AsyncSnapshot<T> {
  data: T;
  hasData: boolean;
  resolved: boolean;
  fulfilled: boolean;
  error: Error;
  rejected: boolean;
  rejectReason: any;
}

interface AsyncBuilderOptions<T> {
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
    log('AsyncBuilder Mounted');
    options.getter()
      .then((data) => {
        setSnapshot((state) => {
          state.data = data;
          state.hasData = typeof data !== 'undefined';
          state.resolved = true;
          state.fulfilled = true;
        })
      }, (reason) => setSnapshot((state) => {
        state.resolved = true;
        state.rejected = true;
        state.rejectReason = reason;
      }))
      .catch((error) => setSnapshot((state) => {
        state.error = error;
        state.resolved = true;
      }));
  })

  build(() => options.builder(context, snapshot));
});
