import { parseSelector } from '../src/element';
import { assert } from 'chai';

let renderBox: HTMLDivElement;

beforeEach(() => {
  renderBox = document.createElement('div');
  document.body.appendChild(renderBox);
});

afterEach(() => {
  renderBox.remove();
});

describe('element', () => {
  it('parseSelector', () => {
    let selData = parseSelector('a');
    assert(
      selData.tag === 'a' &&
      selData.class.length === 0 &&
      Object.keys(selData.attrs).length === 0 &&
      !selData.hasAttrs &&
      !selData.hasClass
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
});
