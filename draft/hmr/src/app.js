
import { mount, Component, build, el } from '../../../dist/devoid.es.js';
import ChildComponent from './component.js';

const App = () => Component(() => {
  build(() => el('div', [
    ChildComponent(),
    ChildComponent(),
  ]));
});

mount(App(), document.querySelector('[box]'));
