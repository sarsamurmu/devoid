import { Context } from '../src/context';
import { assert } from 'chai';
import { createKey } from '../src/utils';

it('Context', () => {
  const ctx = new Context();
  const key1 = createKey('key1');

  ctx.set(key1, true);
  ctx.set('first', 10);
  ctx.set('second', 20);
  assert.strictEqual(ctx.get(key1), true);
  assert.strictEqual(ctx.get('first'), 10);
  assert.strictEqual(ctx.get('second'), 20);

  const copiedCtx = ctx.copy();
  copiedCtx.set(key1, false);
  assert.strictEqual(copiedCtx.get(key1), false);
  assert.strictEqual(ctx.get(key1), true);
  assert.strictEqual(copiedCtx.get('first'), 10);
  assert.strictEqual(copiedCtx.get('second'), 20);
});
