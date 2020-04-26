import { Component, build, onMount, onUpdate, value, onDestroy } from '../src/component';
import { el, ref } from '../src/element';
import { assert } from 'chai';
import { mount } from '../src/mount';

const wait = (ms: number) => new Promise((resolve) => setTimeout(() => resolve(), ms));

describe('Component functions', () => {
  let renderBox: HTMLDivElement;

  beforeEach(() => {
    renderBox = document.createElement('div');
    document.body.appendChild(renderBox);
  });

  afterEach(() => renderBox.remove());

  it('Component', (done) => {
    let childMounted = false;
    let childUpdated = false;
    let childDestroyed = false;
    let updateChild: () => void;
    let destroyChild: () => void;
    
    const TestComp = () => Component(() => {
      const testVal = value(true);
      const elRef = ref();

      updateChild = async () => {
        assert(elRef.el instanceof HTMLElement, '<Ref>.el should be available when component is mounted');
        testVal(false);
        await wait(300);
        assert(childUpdated, 'Component should trigger update hook when value changes');
        destroyChild();
      }

      onMount(() => {
        childMounted = true;
      });

      onUpdate(() => {
        childUpdated = true;
      });

      onDestroy(() => {
        childDestroyed = true;
        assert(elRef.el === null, '<Ref>.el should be null when component is destroyed');
      })

      build(() => el('div', { ref: elRef }, `Value is ${testVal()}`));
    });

    const ParentComp = () => Component(() => {
      const childAttached = value(true);

      destroyChild = async () => {
        childAttached(false);
        await wait(300);
        assert(childDestroyed, 'Component should trigger destroy hook when removed from DOM');
        done();
      }

      onMount(async () => {
        await wait(300);
        assert(childMounted, 'Component should trigger mount hook when mounted to DOM');
        updateChild();
      });

      build(() => el('div', childAttached() ? TestComp() : 'Just text'));
    });

    mount(ParentComp(), renderBox);
  });
});
