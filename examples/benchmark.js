// Follows these
// https://krausest.github.io/js-framework-benchmark/current.html
// https://github.com/krausest/js-framework-benchmark

const {
  mount,
  Component,
  build,
  onMount,
  createState,
  el
} = Devoid;

const random = (max) => Math.round(Math.random() * 1000) % max;

const A = ['pretty', 'large', 'big', 'small', 'tall', 'short', 'long', 'handsome', 'plain', 'quaint', 'clean', 'elegant', 'easy', 'angry', 'crazy', 'helpful', 'mushy', 'odd', 'unsightly', 'adorable', 'important', 'inexpensive', 'cheap', 'expensive', 'fancy'];
const C = ['red', 'yellow', 'blue', 'green', 'pink', 'brown', 'purple', 'brown', 'white', 'black', 'orange'];
const N = ['table', 'chair', 'house', 'bbq', 'desk', 'car', 'pony', 'cookie', 'sandwich', 'burger', 'pizza', 'mouse', 'keyboard'];

let nextId = 1;

const buildData = (count) => {
  const data = new Array(count);
  for (let i = 0; i < count; i++) {
    data[i] = {
      id: nextId++,
      label: `${A[random(A.length)]} ${C[random(C.length)]} ${N[random(N.length)]}`,
    }
  }
  return data;
}

const Row = ({ selected, key, item }) => Component(() => {
  build(() => el('tr', {
    style: {
      color: selected ? 'aquamarine' : undefined,
    },
    key: key,
  }, el('p', item.label)));
});

const timeout = (func) => new Promise((resolve) => setTimeout(() => {
  func();
  resolve()
}, 5000));

const showTime = (label, callback) => {
  console.time(label);
  callback();
  console.timeEnd(label);
}

const Main = () => Component(() => {
  const [data, setData] = createState({
    items: [],
    selected: 0,
    addKey: true,
  });

  const createRows = () => showTime('Create 1000 rows', () => setData({ items: buildData(1000) }));
  const createManyRows = () => showTime('Create 10000 rows', () => setData({ items: buildData(10000) }));
  const appendRows = () => showTime('Append 1000 rows', () => setData((pData) => pData.items.push(...buildData(1000))));
  const updateRows = () => showTime('Update all rows', () => setData((pData) => {
    const { items } = pData;
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      items[i] = { id: item.id, label: item.label + ' !!!' };
    }
  }));
  const updateRowsPartial = () => showTime('Update every 10 rows', () => setData((pData) => {
    const { items } = pData;
    for (let i = 0; i < items.length; i += 10) {
      const item = items[i];
      items[i] = { id: item.id, label: item.label + ' !!!' };
    }
  }));
  const removeRow = () => showTime('Remove a random row', () => setData((pData) => {
    const { items } = pData;
    items.splice(items.indexOf(random(items.length)), 1);
  }));
  const clearRows = () => showTime('Clear rows', () => setData({ items: [] }));
  const swapRows = () => showTime('Swap 2 rows', () => setData((pData) => {
    const { items } = pData;
    if (items.length > 998) {
      let temp = items[1];
      items[1] = items[998];
      items[998] = temp;
    }
  }));
  const selectRow = () => showTime('Select a random row', () => setData({ selected: random(data.items.length) }));

  const runAll = async () => {
    await timeout(createRows);
    await timeout(updateRows);
    await timeout(updateRowsPartial);
    await timeout(selectRow);
    await timeout(swapRows);
    await timeout(removeRow);
    await timeout(clearRows);
    await timeout(createManyRows);
    await timeout(appendRows);
  }

  onMount(async () => {
    console.log('Starting keyed benchmark');
    await runAll();
    console.log('Keyed benchmark ended');

    setData({ addKey: false });

    console.log('Starting non keyed benchmark');
    await runAll();
    console.log('Non keyed benchmark ended');
  });

  build(() => el('div', [
    el('table', data.items.map((item, i) => Row({
      item,
      key: data.addKey ? i : undefined,
      selected: data.selected === item.id,
    })))
  ]))
});

mount(Main(), document.querySelector('[renderBox]'));
