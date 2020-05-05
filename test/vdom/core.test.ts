// Based on original core Snabbdom tests - https://github.com/snabbdom/snabbdom/tree/master/src/test

import { assert } from 'chai';
import { h, VNode } from '../../src/vdom/vnode';
import { patch } from '../../src/vdom';

let v0: Element;
let el: Node & Partial<HTMLElement>;

beforeEach(() => {
  v0 = document.createElement('div');
});

const map = (list: any, cb: (item: any) => any) => {
  const mapped = [];
  for (const item of list) mapped.push(cb(item));
  return mapped;
}

const html = (item: HTMLElement) => item.innerHTML;
const str = (a: any) => String(a);

describe('Virtual DOM', () => {
  describe('with keys', () => {
    const asI = (...items: (null | undefined | string | number)[]) => {
      return items.map(
        (item) => typeof item === 'number' || typeof item === 'string' ? h('i', { key: item }, item + '') : item
      );
    }

    describe('addition of elements', () => {
      it('appends elements', () => {
        const v1 = h('i', asI(1));
        const v2 = h('i', asI(1, 2, 3));

        el = patch(v0, v1).el;
        assert.strictEqual(el.children.length, 1);

        el = patch(v1, v2).el;
        assert.strictEqual(el.children.length, 3);
        assert.strictEqual(el.children[1].innerHTML, '2');
        assert.strictEqual(el.children[2].innerHTML, '3');
      });

      it('prepends elements', () => {
        const v1 = h('i', asI(4, 5));
        const v2 = h('i', asI(1, 2, 3, 4, 5));

        el = patch(v0, v1).el;
        assert.strictEqual(el.children.length, 2);

        el = patch(v1, v2).el;
        assert.deepEqual(map(el.children, html), [1, 2, 3, 4, 5].map(str));
      });

      it('adds element in the middle', () => {
        const v1 = h('i', asI(1, 2, 4, 5));
        const v2 = h('i', asI(1, 2, 3, 4, 5));

        el = patch(v0, v1).el;
        assert.strictEqual(el.children.length, 4);

        el = patch(v1, v2).el;
        assert.deepEqual(map(el.children, html), [1, 2, 3, 4, 5].map(str));
      });

      it('add elements at begin and end', () => {
        const v1 = h('i', asI(2, 3, 4));
        const v2 = h('i', asI(1, 2, 3, 4, 5));

        el = patch(v0, v1).el;
        assert.strictEqual(el.children.length, 3);

        el = patch(v1, v2).el;
        assert.deepEqual(map(el.children, html), [1, 2, 3, 4, 5].map(str));
      });

      it('adds children to parent with no children', () => {
        const v1 = h('i', { key: 'sp' });
        const v2 = h('i', { key: 'sp' }, asI(1, 2, 3));

        el = patch(v0, v1).el;
        assert.strictEqual(el.children.length, 0);

        el = patch(v1, v2).el;
        assert.deepEqual(map(el.children, html), [1, 2, 3].map(str));
      });

      it('removes all children from parent', () => {
        const v1 = h('i', { key: 'sp' }, asI(1, 2, 3));
        const v2 = h('i', { key: 'sp' });

        el = patch(v0, v1).el;
        assert.deepEqual(map(el.children, html), [1, 2, 3].map(str));

        el = patch(v1, v2).el;
        assert.strictEqual(el.children.length, 0);
      });

      it('update one child with same key but different sel', () => {
        const v1 = h('i', { key: 'sp' }, asI(1, 2, 3));
        const v2 = h('i', { key: 'sp' }, [
          h('i', { key: 1 }, '1'),
          h('i', { key: 2 }, '2'),
          h('i', { key: 3 }, '3')
        ]);

        el = patch(v0, v1).el;
        assert.deepEqual(map(el.children, html), [1, 2, 3].map(str));

        el = patch(v1, v2).el;
        assert.deepEqual(map(el.children, html), [1, 2, 3].map(str));
        assert.strictEqual(el.children.length, 3);
        assert.strictEqual(el.children[1].tagName, 'I');
      });
    });

    describe('removal of elements', () => {
      it('removes elements from the beginning', () => {
        const v1 = h('i', asI(1, 2, 3, 4, 5));
        const v2 = h('i', asI(3, 4, 5));

        el = patch(v0, v1).el;
        assert.strictEqual(el.children.length, 5);

        el = patch(v1, v2).el;
        assert.deepEqual(map(el.children, html), [3, 4, 5].map(str));
      });

      it('removes elements from the end', () => {
        const v1 = h('i', asI(1, 2, 3, 4, 5));
        const v2 = h('i', asI(1, 2, 3));

        el = patch(v0, v1).el;
        assert.strictEqual(el.children.length, 5);

        el = patch(v1, v2).el;
        assert.deepEqual(map(el.children, html), [1, 2, 3].map(str));
      });

      it('removes elements from the middle', () => {
        const v1 = h('i', asI(1, 2, 3, 4, 5));
        const v2 = h('i', asI(1, 2, 4, 5));

        el = patch(v0, v1).el;
        assert.strictEqual(el.children.length, 5);

        el = patch(v1, v2).el;
        assert.deepEqual(map(el.children, html), [1, 2, 4, 5].map(str));
      });

      it('removes element from the beginning and end', () => {
        const v1 = h('i', asI(1, 2, 3, 4, 5));
        const v2 = h('i', asI(2, 3, 4));

        el = patch(v0, v1).el;
        assert.strictEqual(el.children.length, 5);

        el = patch(v1, v2).el;
        assert.deepEqual(map(el.children, html), [2, 3, 4].map(str));
      });
    });

    describe('element reordering', () => {
      it('moves element forward', () => {
        const v1 = h('i', asI(1, 2, 3, 4));
        const v2 = h('i', asI(2, 3, 1, 4));

        el = patch(v0, v1).el;
        assert.strictEqual(el.children.length, 4);

        el = patch(v1, v2).el;
        assert.deepEqual(map(el.children, html), [2, 3, 1, 4].map(str));
      });

      it('moves element to end', () => {
        const v1 = h('i', asI(1, 2, 3));
        const v2 = h('i', asI(2, 3, 1));

        el = patch(v0, v1).el;
        assert.strictEqual(el.children.length, 3);

        el = patch(v1, v2).el;
        assert.deepEqual(map(el.children, html), [2, 3, 1].map(str));
      });

      it('moves element backwards', () => {
        const v1 = h('i', asI(1, 2, 3, 4));
        const v2 = h('i', asI(1, 4, 2, 3));

        el = patch(v0, v1).el;
        assert.strictEqual(el.children.length, 4);

        el = patch(v1, v2).el;
        assert.deepEqual(map(el.children, html), [1, 4, 2, 3].map(str));
      });

      it('swaps first and last', () => {
        const v1 = h('i', asI(1, 2, 3, 4));
        const v2 = h('i', asI(4, 2, 3, 1));

        el = patch(v0, v1).el;
        assert.strictEqual(el.children.length, 4);

        el = patch(v1, v2).el;
        assert.deepEqual(map(el.children, html), [4, 2, 3, 1].map(str));
      });
    });

    describe('combinations of additions, removals and re-orderings', () => {
      it('move to left and replace', () => {
        const v1 = h('i', asI(1, 2, 3, 4, 5));
        const v2 = h('i', asI(4, 1, 2, 3, 6));

        el = patch(v0, v1).el;
        assert.strictEqual(el.children.length, 5);

        el = patch(v1, v2).el;
        assert.deepEqual(map(el.children, html), [4, 1, 2, 3, 6].map(str));
      });

      it('moves to left and leaves hole', () => {
        const v1 = h('i', asI(1, 4, 5));
        const v2 = h('i', asI(4, 6));

        el = patch(v0, v1).el;
        assert.strictEqual(el.children.length, 3);

        el = patch(v1, v2).el;
        assert.deepEqual(map(el.children, html), [4, 6].map(str));
      });

      it('handles moved and set to undefined element ending at the end', () => {
        const v1 = h('i', asI(2, 4, 5));
        const v2 = h('i', asI(4, 5, 3));

        el = patch(v0, v1).el;
        assert.strictEqual(el.children.length, 3);

        el = patch(v1, v2).el;
        assert.deepEqual(map(el.children, html), [4, 5, 3].map(str));
      });

      it('moves a key in non-keyed nodes with a size up', () => {
        const v1 = h('i', asI(1, 'a', 'b', 'c'));
        const v2 = h('i', asI('d', 'a', 'b', 'c', 1, 'e'));

        el = patch(v0, v1).el;
        assert.strictEqual(el.children.length, 4);

        el = patch(v1, v2).el;
        assert.deepEqual(map(el.children, html), ['d', 'a', 'b', 'c', 1, 'e'].map(str));
      });
    });

    it('reverses elements', () => {
      const v1 = h('i', asI(1, 2, 3, 4, 5, 6, 7));
      const v2 = h('i', asI(7, 6, 5, 4, 3, 2, 1));

      el = patch(v0, v1).el;
      assert.strictEqual(el.children.length, 7);

      el = patch(v1, v2).el;
      assert.deepEqual(map(el.children, html), [7, 6, 5, 4, 3, 2, 1].map(str));
    });

    it('handles random shuffles', () => {
      const elementsCount = 14;
      const testCount = 5;
      const opacities: string[] = [];
      const spanWithOpacity = (key: number, opacity: string) => h('i', { key, style: { opacity } }, key + '');

      for (let i = 0; i < testCount; i++) {
        el = document.createElement('div');

        const array = Array(elementsCount).fill('').map((_, idx) => idx);
        const v1 = h('i', array.map((key) => spanWithOpacity(key, '1')));
        const shuffledArray = array.slice(0).sort(() => Math.random() - 0.5);
        el = patch(el as Element, v1).el;

        for (let j = 0; j < elementsCount; j++) {
          assert.strictEqual(el.children[j].innerHTML, j + '');
          opacities[j] = Math.random().toFixed(5).toString();
        }

        const v2 = h('i', array.map((key) => spanWithOpacity(shuffledArray[key], opacities[key])));
        el = patch(v1, v2).el;

        for (let j = 0; j < elementsCount; j++) {
          assert.strictEqual(el.children[j].innerHTML, shuffledArray[j] + '');
          assert.strictEqual(opacities[j].indexOf((el.children[j] as HTMLElement).style.opacity), 0);
        }
      }
    });

    it('supports null/undefined children', () => {
      const v1 = h('i', asI(1, 2, 3, 4, 5, 6));
      const v2 = h('i', asI(null, undefined, 2, null, 4, 6, undefined, null, 3, null, 1, 5));

      el = patch(v0, v1).el;
      assert.strictEqual(el.children.length, 6);

      el = patch(v1, v2).el;
      assert.deepEqual(map(el.children, html), [2, 4, 6, 3, 1, 5].map(str));
    });

    it('supports all null/undefined children', () => {
      const v1 = h('i', asI(0, 1, 2, 3, 4, 5));
      const v2 = h('i', [null, null, undefined, null, null, undefined]);
      const v3 = h('i', asI(5, 4, 3, 2, 1, 0));
      patch(v0, v1);

      el = patch(v1, v2).el;
      assert.strictEqual(el.children.length, 0);

      el = patch(v2, v3).el;
      assert.deepEqual(map(el.children, html), [5, 4, 3, 2, 1, 0].map(str));
    });

    it('handles random shuffles with null/undefined children', () => {
      const testCount = 5;
      const maxArrayLength = 15;
      let v1: Element | VNode = v0;

      for (let i = 0; i < testCount; i++) {
        const arrayLength = Math.floor(Math.random() * maxArrayLength);
        const array = Array(arrayLength).fill('').map((_, idx) => {
          const random = Math.random();
          return (random < 0.5 ? idx + '' : (random < 0.75 ? null : undefined));
        }).sort(() => Math.random() - 0.5);

        const v2 = h('i', asI(...array));

        el = patch(v1, v2).el;
        assert.deepEqual(map(el.children, html), array.filter((a) => !!a));

        v1 = v2;
      }
    });
  });

  describe('updating children without keys', () => {
    it('appends element', () => {
      const v1 = h('i', [h('i', 'Hi')]);
      const v2 = h('i', [h('i', 'Hi'), h('i', 'There')]);

      el = patch(v0, v1).el;
      assert.deepEqual(map(el.children, html), ['Hi']);

      el = patch(v1, v2).el;
      assert.deepEqual(map(el.children, html), ['Hi', 'There']);
    });

    it('handles unmoved text nodes', () => {
      const v1 = h('i', ['Text', h('i', 'Italic')]);
      const v2 = h('i', ['Text', h('i', 'Italic')]);

      el = patch(v0, v1).el;
      assert.strictEqual(el.childNodes[0].textContent, 'Text');

      el = patch(v1, v2).el;
      assert.strictEqual(el.childNodes[0].textContent, 'Text');
    });

    it('handles changing text children', () => {
      const v1 = h('i', ['Text', h('i', 'Italic')]);
      const v2 = h('i', ['New Text', h('i', 'Italic')]);

      el = patch(v0, v1).el;
      assert.strictEqual(el.childNodes[0].textContent, 'Text');

      el = patch(v1, v2).el;
      assert.strictEqual(el.childNodes[0].textContent, 'New Text');
    });

    it('handles unmoved comment nodes', () => {
      const v1 = h('i', [h('!', 'Comment'), h('i', 'Italic')]);
      const v2 = h('i', [h('!', 'Comment'), h('i', 'Italic')]);

      el = patch(v0, v1).el;
      assert.strictEqual(el.childNodes[0].textContent, 'Comment');

      el = patch(v1, v2).el;
      assert.strictEqual(el.childNodes[0].textContent, 'Comment');
    });

    it('handles changing comment text', () => {
      const v1 = h('i', [h('!', 'Comment Text'), h('i', 'Italic')]);
      const v2 = h('i', [h('!', 'New Comment Text'), h('i', 'Italic')]);

      el = patch(v0, v1).el;
      assert.strictEqual(el.childNodes[0].textContent, 'Comment Text');

      el = patch(v1, v2).el;
      assert.strictEqual(el.childNodes[0].textContent, 'New Comment Text');
    });

    it('handles changing empty comment', () => {
      const v1 = h('i', [h('!'), h('i', 'Italic')]);
      const v2 = h('i', [h('!', 'Comment'), h('i', 'Italic')]);

      el = patch(v0, v1).el;
      assert.strictEqual(el.childNodes[0].textContent, '');

      el = patch(v1, v2).el;
      assert.strictEqual(el.childNodes[0].textContent, 'Comment');
    });

    it('prepends element', () => {
      const v1 = h('i', [h('i', 'There')]);
      const v2 = h('i', [h('i', 'Hi'), h('i', 'There')]);

      el = patch(v0, v1).el;
      assert.deepEqual(map(el.children, html), ['There']);

      el = patch(v1, v2).el;
      assert.deepEqual(map(el.children, html), ['Hi', 'There']);
    });

    it('prepends elements of different tag', () => {
      const v1 = h('i', [h('i', 'There')]);
      const v2 = h('i', [h('div', 'Hi'), h('i', 'There')]);

      el = patch(v0, v1).el;
      assert.deepEqual(map(el.children, html), ['There']);

      el = patch(v1, v2).el;
      assert.deepEqual(map(el.children, html), ['Hi', 'There']);
      assert.deepEqual(map(el.children, (node: Element) => node.tagName), ['DIV', 'I']);
    });

    it('removes elements', () => {
      const v1 = h('i', [h('i', '1'), h('i', '2'), h('i', '3')]);
      const v2 = h('i', [h('i', '1'), h('i', '3')]);

      el = patch(v0, v1).el;
      assert.deepEqual(map(el.children, html), [1, 2, 3].map(str));

      el = patch(v1, v2).el;
      assert.deepEqual(map(el.children, html), [1, 3].map(str));
    });

    it('removes a single text node', () => {
      const v1 = h('i', 'Text');
      const v2 = h('i');

      el = patch(v0, v1).el;
      assert.strictEqual(el.textContent, 'Text');

      el = patch(v1, v2).el;
      assert.strictEqual(el.textContent, '');
    });

    it('removes a single text node when children are updated', () => {
      const v1 = h('i', 'Text');
      const v2 = h('i', [h('i', '1'), h('i', '2'), h('i', '3')]);

      el = patch(v0, v1).el;
      assert.strictEqual(el.textContent, 'Text');

      el = patch(v1, v2).el;
      assert.deepEqual(map(el.children, html), [1, 2, 3].map(str));
    });

    it('removes a text node among other elements', () => {
      const v1 = h('i', ['1', h('i', '2')]);
      const v2 = h('i', h('u', '3'));

      el = patch(v0, v1).el;
      assert.deepEqual(map(el.childNodes, (node: Node) => node.textContent), ['1', '2'].map(str));

      el = patch(v1, v2).el;
      assert.strictEqual(el.childNodes.length, 1);
      assert.strictEqual((el.childNodes[0] as Element).tagName, 'U');
      assert.strictEqual(el.childNodes[0].textContent, '3');
    });

    it('reorders elements', () => {
      const v1 = h('i', [
        h('u', '1'),
        h('i', '2'),
        h('b', '3')
      ]);
      const v2 = h('i', [
        h('b', '3'),
        h('u', '1'),
        h('i', '2')
      ]);

      el = patch(v0, v1).el;
      assert.deepEqual(map(el.children, html), [1, 2, 3].map(str));

      el = patch(v1, v2).el;
      assert.deepEqual(map(el.children, html), [3, 1, 2].map(str));
      assert.deepEqual(map(el.children, (node: Element) => node.tagName), ['B', 'U', 'I']);
    });

    it('support null/undefined children', () => {
      const v1 = h('i', [
        null,
        h('i', '1'),
        h('i', '2'),
        null
      ]);
      const v2 = h('i', [
        h('i', '2'),
        undefined,
        undefined,
        h('i', '1'),
        undefined
      ]);
      const v3 = h('i', [
        null,
        h('i', '1'),
        undefined,
        null,
        h('i', '2'),
        undefined,
        null
      ]);

      el = patch(v0, v1).el;
      assert.deepEqual(map(el.children, html), ['1', '2']);

      el = patch(v1, v2).el;
      assert.deepEqual(map(el.children, html), ['2', '1']);

      el = patch(v2, v3).el;
      assert.deepEqual(map(el.children, html), ['1', '2']);
    });

    it('supports all null/undefined children', () => {
      const v1 = h('i', [h('i', '1'), h('i', '2')]);
      const v2 = h('i', [null, undefined]);
      const v3 = h('i', [h('i', '2'), h('i', '1')]);

      el = patch(v0, v1).el;
      assert.deepEqual(map(el.children, html), ['1', '2']);

      el = patch(v1, v2).el;
      assert.strictEqual(el.children.length, 0);

      el = patch(v2, v3).el;
      assert.deepEqual(map(el.children, html), ['2', '1']);
    });
  });
});
