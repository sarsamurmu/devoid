const {
  render,
  el,
  Component,
  Fragment,
  makeComp,
} = Devoid;

const MComponent = makeComp(({ build, rebuild }) => {
  let toggled = false;

  build(() => {
    return el('p', {
      on: {
        click: () => rebuild(() => toggled = !toggled)
      }
    }, `This item is ${!toggled ? 'not' : ''} toggled (Click to toggle)`);
  });
});

render(new Fragment([
  MComponent,
  MComponent,
  MComponent,
]), document.querySelector('[renderBox]'));
