import {
  generateUniqueId,
  copyMap,
  isObject,
  deepClone,
  mergeProperties,
  patchStateProperties,
  EventManager,
  createKey,
  globalKey
} from '../src/utils';
import { assert } from 'chai';

describe('Utility functions', () => {
  it('generateUniqueId', () => {
    const uniqueIds = new Set();

    for (let i = 0; i < 1000; i++) {
      const uniqueId = generateUniqueId();
      assert(!uniqueIds.has(uniqueId), 'Unique IDs should not contain a generated unique ID');
      uniqueIds.add(uniqueId);
    }
  });

  it('copyMap', () => {
    const arrKey: any[][] = [[]];
    const objKey = {};

    const oldMap = new Map();
    oldMap.set(arrKey, 100);
    oldMap.set(10, 'Ten');
    oldMap.set(objKey, true);

    const newMap = new Map();
    copyMap(oldMap, newMap);

    assert(newMap.get(arrKey) === 100);
    assert(newMap.get(10) === 'Ten');
    assert(newMap.get(objKey) === true);
  });

  it('EventManager', () => {
    const eventManager = new EventManager();
    const key = createKey('$key');
    const key2 = createKey('$key2');
    let initCallCount = 0;
    let initCallCount2 = 0;
    let updateCallCount = 0;
    let updateCallCount2 = 0;
    let destroyCallCount = 0;

    eventManager.add('@init', () => initCallCount++, key);
    eventManager.add('@init', () => initCallCount2++, key2);
    eventManager.add('@update', () => updateCallCount++, key);
    eventManager.add('@update', () => updateCallCount2++, key2);
    eventManager.add('@destroy', () => destroyCallCount++, key);

    eventManager.trigger('@init');
    assert(initCallCount === 1 && initCallCount2 === 1, 'Should call all @init callbacks');

    eventManager.trigger('@destroy');
    assert(destroyCallCount === 1, 'Should call @destroy callbacks');

    eventManager.removeKey(key2);
    eventManager.trigger('@init');
    eventManager.trigger('@update');
    assert(initCallCount === 2, 'Call count should be 2 because only key2 is removed');
    assert(initCallCount2 === 1, 'Call count should be 1 as key2 is removed');
    assert(updateCallCount === 1, 'Call count should be 1 because only key2 is removed');
    assert(updateCallCount2 === 0, 'Call count should be 0 as key2 is removed');

    eventManager.add('@init', () => initCallCount2++, key2);
    eventManager.removeKey(key, '@init');
    eventManager.trigger('@init');
    eventManager.trigger('@update');
    assert(initCallCount === 2, 'Call count should be 2 as @init callback is removed for key');
    assert(initCallCount2 === 2, 'Call count should be 2 as @init callback is only removed for key');
    assert(updateCallCount === 2, 'Call count should be 2 as @init callback is only removed for key');

    const eventManager2 = new EventManager();

    eventManager2.removeKey('unavailableKey');
    eventManager2.trigger('unavailableEvent');
    eventManager2.add('someEvent', () => 0 /* without key */);
    eventManager2.trigger('unavailableEvent');
  });

  it('globalKey', () => {
    const firstSymbol = globalKey('sameKey');
    const secondSymbol = globalKey('sameKey');

    assert(firstSymbol === secondSymbol, 'Global key with same name should be same');
  });

  it('isObject', () => {
    assert(isObject({}), '{} should be an object');
    assert(!isObject(new (class TestClass {})), 'A class should not be an object');
  });

  it('deepClone', () => {
    const obj = {
      direct: true,
      nested: {
        isNested: true,
        array: [
          {
            isObject: true
          },
          'String'
        ]
      }
    };

    const clonedObj = deepClone(obj);

    clonedObj.direct = false;
    clonedObj.nested.isNested = false;
    (clonedObj.nested.array[0] as any).isObject = false;
    (clonedObj.nested.array[1] as any) = 20;

    assert(
      obj.direct &&
      obj.nested.isNested &&
      (obj.nested.array[0] as any).isObject &&
      obj.nested.array[1] === 'String',
      'Deep cloned object should not contain reference to the original object'
    );
  });

  it('mergeProperties', () => {
    const toMerge = {
      first: 1,
      second: 2,
      nested: {
        first: 11,
        second: 12,
        nested: {
          first: 21,
          second: 22
        }
      }
    };

    const toMergeWith = {
      second: 4,
      third: 3,
      nested: {
        first: 15,
        third: 13,
        nested: {
          first: 10
        }
      },
      nestedOther: {
        first: 121,
        second: 122
      }
    };

    mergeProperties(toMerge, toMergeWith, true);

    assert(
      toMerge.first === 1 &&
      toMerge.second === 4 &&
      (toMerge as any).third === 3 &&
      toMerge.nested.first === 15 &&
      toMerge.nested.second === 12 &&
      (toMerge.nested as any).third === 13 &&
      toMerge.nested.nested.first === 10 &&
      toMerge.nested.nested.second === 22 &&
      (toMerge as any).nestedOther.first === 121 &&
      (toMerge as any).nestedOther.second === 122
    );
  });

  it('patchStateProperties', () => {
    const state = {
      first: 1,
      second: 2,
      nested: {
        first: 11,
        second: 12,
        nested: {
          first: 21,
          second: 22
        }
      }
    }

    patchStateProperties({
      first: 10,
      third: 30,
      nested: {
        second: 20,
        other: 75,
        nested: {
          first: 40
        }
      }
    }, state);

    assert(
      state.first === 10 &&
      state.second === 2 &&
      !('third' in state) &&
      state.nested.first === 11 &&
      state.nested.second === 20 &&
      !('other' in state.nested) &&
      state.nested.nested.first === 40 &&
      state.nested.nested.second === 22
    );
  })
});
