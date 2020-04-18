const {
  mount,
  el,
  Component,
  createState,
  onMount,
  onUpdate,
  build,
  value,
  Fragment,
  withBuilder,
} = Devoid;

const ChildComponent = () => {
  return Component((context) => {
    const [state, setState] = createState({ count: 0 });
    console.log('Building');
    console.log(context);

    onMount(() => {
      console.log(`child mounted`);
    });

    onUpdate(() => {
      console.log(`child updated`);
    });

    build(() => {
      return el('p', {
        on: {
          click: () => {
            console.log(`Clicked ChildComponent`);
            setState((aState) => aState.count++);
          },
        }
      }, `I am child Component and my state is ${JSON.stringify(state)}`);
    });
  });
}

const MyComponent = () => {
  return Component((context) => {
    const [state, setState] = createState({ name: 'Component' });

    const useContext = context.copy();
    useContext.set('myKey', 100);

    onMount(() => {
      console.log(`parent mounted`);
    });

    onUpdate(() => {
      console.log(`parent updated`);
    });

    setState(() => 1);

    build(() => {
      return el('div', [
        el('p', {
          on: {
            click: () => setState((data) => data.name = 'Ho')
          }
        }, `Name is ${state.name}`),
        ChildComponent(),
      ])
    }, useContext);
  });
}

console.log(MyComponent());

mount(el('div', [
  MyComponent(),
  MyComponent(),
  MyComponent()
]), document.querySelector('[renderBox]'));
