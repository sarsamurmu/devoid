// Component functionality
import { Component, build, value, el, debugStates, createState } from '../../../dist/devoid.es.js';
import { Hot } from './hot.js';

const MyComponent = () => Component(() => {
  let [state, setState] = createState({ count: 0 });
  let charCode = value(65);

  debugStates({ charCode, state });

  const style = {
    userSelect: 'none',
    fontFamily: 'Lexend Deca'
  };

  build(() => el('p', [
    el('p', {
      style,
      on: { click: () => charCode(charCode() + 1) }
    }, `Character is ${String.fromCharCode(charCode())}!!`),
    el('p', {
      style,
      on: { click: () => setState((pState) => pState.count++) }
    }, `Count is ${state.count}!!`),
    el('br'),
  ]));
});

export default Hot(module, MyComponent);
