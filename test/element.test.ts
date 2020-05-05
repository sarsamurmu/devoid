import { ref, elR, parseSelector, convertEventKeys, appendSelectorData, composeEls } from '../src/element';
import { assert } from 'chai';
import { updateChildren } from '../src/vdom';
import { mount } from '../src/mount';

let renderBox: HTMLDivElement;

beforeEach(() => {
  renderBox = document.createElement('div');
  document.body.appendChild(renderBox);
});

afterEach(() => {
  renderBox.remove();
});

const resetRenderBox = () => {
  renderBox.remove();
  renderBox = document.createElement('div');
  document.body.appendChild(renderBox);
}

describe('element', () => {
  it('ref', () => {
    const elRef = ref();
    assert.strictEqual(elRef.el, null);

    const element = elR('div', {
      ref: elRef,
      props: {
        id: 'firstDiv'
      }
    }, []).render(null);

    updateChildren({
      parentEl: renderBox,
      oldCh: [],
      newCh: element
    });
    assert.strictEqual(elRef.el, document.querySelector('#firstDiv'), 'Ref is not same as element');

    const newElement = elR('div', {
      ref: elRef,
      props: {
        id: 'secondDiv'
      }
    }, []).render(null);

    updateChildren({
      parentEl: renderBox,
      oldCh: element,
      newCh: newElement
    })
    assert.strictEqual(elRef.el, document.querySelector('#secondDiv'), 'Ref should update when element is replaced');

    updateChildren({
      parentEl: renderBox,
      oldCh: newElement,
      newCh: []
    });
    assert.strictEqual(elRef.el, null, 'Ref should be null when element is removed');
  });

  it('parseSelector', () => {
    let selData = parseSelector('a');
    assert(
      selData.tag === 'a' &&
      selData.class.length === 0 &&
      Object.keys(selData.attrs).length === 0 &&
      !selData.hasAttrs &&
      !selData.hasClass
    );

    selData = parseSelector('button#someID');
    assert(
      selData.tag === 'button' &&
      selData.hasAttrs &&
      selData.attrs.id === 'someID'
    );

    selData = parseSelector('.aClass');
    assert(
      selData.tag === 'div' &&
      selData.class[0] === 'aClass' &&
      selData.hasClass
    );

    selData = parseSelector('[key=value]');
    assert(
      selData.tag === 'div' &&
      selData.attrs.key === 'value' &&
      selData.hasAttrs
    );

    selData = parseSelector('input[type=text]');
    assert(
      selData.tag === 'input' &&
      selData.attrs.type === 'text'
    );

    selData = parseSelector('input[placeholder="Enter your email"][type=\'email\']');
    assert(
      selData.tag === 'input' &&
      selData.attrs.placeholder === 'Enter your email' &&
      selData.attrs.type === 'email'
    );

    selData = parseSelector('p[editable]');
    assert(
      selData.tag === 'p' &&
      selData.attrs.editable === ' '
    );
  });

  it('convertEventKeys', () => {
    let dataToConvert = {
      otherKey: 'someKey',
      onClick: 'Do on click',
      onFocus: 'Do on focus'
    } as Record<string, any>;

    convertEventKeys(dataToConvert);
    assert(
      ('on' in dataToConvert) &&
      dataToConvert.on.click === 'Do on click' &&
      dataToConvert.on.focus === 'Do on focus'
    );

    dataToConvert = {
      otherKey: 'someKey',
      onClick: 'Do on click',
      onFocus: 'Do on focus',
      on: {
        input: 'Do on input'
      }
    }

    convertEventKeys(dataToConvert);
    assert(
      dataToConvert.on.click === 'Do on click' &&
      dataToConvert.on.focus === 'Do on focus' &&
      dataToConvert.on.input === 'Do on input'
    );
  });

  it('appendSelectorData', () => {
    let data = {} as Record<string, any>;

    appendSelectorData(parseSelector('.classOne.classTwo[attribute]'), data);
    assert(
      data.attrs &&
      data.attrs.attribute === ' ' &&
      data.class[0] === 'classOne' &&
      data.class[1] === 'classTwo'
    );

    data = {
      attrs: {
        disabled: true
      },
      class: ['first', 'second']
    }

    appendSelectorData(parseSelector('.classOne.classTwo[some=val]'), data);
    assert(
      data.attrs &&
      data.attrs.disabled === true &&
      data.attrs.some === 'val' &&
      data.class[0] === 'first' &&
      data.class[1] === 'second' &&
      data.class[2] === 'classOne' &&
      data.class[3] === 'classTwo'
    );

    data = {
      class: 'class as string'
    }

    appendSelectorData(parseSelector('.classOne.classTwo'), data);
    assert(
      data.class[0] === 'class as string' &&
      data.class[1] === 'classOne' &&
      data.class[2] === 'classTwo'
    );
  });

  it('composeEls', () => {
    let { div, p, a } = composeEls();
    let element;

    const runTest = () => {
      const qs = (selector: string) => renderBox.querySelector(selector) as HTMLElement;
      element = div('With just text');
      mount(element, renderBox);
      assert.strictEqual(qs('div').innerText, 'With just text');

      element = p(
        {
          attrs: { id: 'p1' },
          class: 'firstClass'
        },
        'With data and child and num - ',
        '' /* Empty text = ignored */,
        20
      );
      mount(element, renderBox);
      assert(
        qs('#p1').innerText === 'With data and child and num - 20' &&
        qs('#p1').classList.contains('firstClass')
      );

      element = a({ sel: '.hyperLink#link' }, '<a> using `sel`', div('Just a <div>'));
      mount(element, renderBox);
      assert(
        qs('#link').querySelector('div').innerText === 'Just a <div>' &&
        qs('#link').classList.contains('hyperLink')
      );

      element = p(null, 'With incompatible child');
      mount(element, renderBox);
      assert.strictEqual(qs('p:last-child').innerText, 'With incompatible child');
    }

    runTest();

    const elements = composeEls();
    div = elements.div;
    p = elements.p;
    a = elements.a;

    resetRenderBox();
    runTest();
  });
});
