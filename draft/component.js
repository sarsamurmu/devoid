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
    watchValues,
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
          onClick() {
            console.log(`Clicked ChildComponent`);
            setState((aState) => aState.count++);
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
            onClick: () => setState((data) => data.name = 'Ho')
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

    watchValues([count1, count2], () => {
      console.log('count1 or count2 Changed');
      count3(count3() + 1);
    });

    watchValues([count3], () => console.log('count3 Changed'));

    const inc = (valFun) => valFun(valFun() + 1);

    build(() => el('div', [
      el('p', {
        style: { userSelect: 'none' },
        onClick: () => inc(count1)
      }, `Count 1 is ${count1()}`),
      el('p', {
        style: { userSelect: 'none' },
        onClick: () => inc(count2)
      }, `Count 2 is ${count2()}`),
      el('p', {
        style: { userSelect: 'none' },
        onClick: () => inc(count3)
      }, `Count 3 is ${count3()}`),
      el('p', {
        style: { userSelect: 'none' },
        onClick: () => inc(count4)
      }, `Count 4 is ${count4()}`),
      el('p', {
        style: { userSelect: 'none' },
        onClick: () => inc(count5)
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
