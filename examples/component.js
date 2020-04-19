window.addEventListener('load', () => {
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

  const ValueComponent = () => Component(() => {
    const count1 = value(0);
    const count2 = value(0);
    const count3 = value(0);
    const count4 = value(0);
    const count5 = value(0);

    const setVal = (valFun) => valFun(valFun() + 1);

    build(() => el('div', [
      el('p', {
        style: { userSelect: 'none' },
        on: { click: [setVal, count1] }
      }, `Count 1 is ${count1()}`),
      el('p', {
        style: { userSelect: 'none' },
        on: { click: [setVal, count2] }
      }, `Count 2 is ${count2()}`),
      el('p', {
        style: { userSelect: 'none' },
        on: { click: [setVal, count3] }
      }, `Count 3 is ${count3()}`),
      el('p', {
        style: { userSelect: 'none' },
        on: { click: [setVal, count4] }
      }, `Count 4 is ${count4()}`),
      el('p', {
        style: { userSelect: 'none' },
        on: { click: [setVal, count5] }
      }, `Count 5 is ${count5()}`),
    ]))
  });

  mount(el('div', [
    MyComponent(),
    MyComponent(),
    MyComponent(),
    ValueComponent(),
  ]), document.querySelector('[renderBox]'));
});
