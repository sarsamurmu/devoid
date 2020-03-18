// Follows these
// https://krausest.github.io/js-framework-benchmark/current.html
// https://github.com/krausest/js-framework-benchmark

const {
  render,
  Component,
} = Deveto;

const {
  div,
  p,
  tr,
  table
} = Deveto.elements;

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

class Row extends Component {
  constructor(data) {
    super();
    this.data = data;
  }

  build() {
    return new tr({
      style: {
        color: this.data.selected ? 'aquamarine' : undefined,
      },
      key: this.data.key,
      children: new p({ children: this.data.item.label })
    })
  }
}

const timeout = (func) => new Promise((resolve) => setTimeout(() => {
  func();
  resolve()
}, 5000));

class Main extends Component {
  constructor() {
    super();
    this.data = {
      items: [],
      selected: 0,
    }
    this.addKey = true;
  }

  async runAll() {
    await timeout(() => this.createRows());
    await timeout(() => this.updateRows());
    await timeout(() => this.updateRowsPartial());
    await timeout(() => this.selectRow());
    await timeout(() => this.swapRows());
    await timeout(() => this.removeRow());
    await timeout(() => this.clearRows());
    await timeout(() => this.createManyRows());
    await timeout(() => this.appendRows());
  }

  async didMount() {
    console.log('Starting keyed benchmark');
    await this.runAll();
    console.log('Keyed benchmark ended');

    this.addKey = false;
    this.data = {
      items: [],
      selected: 0,
    }
    this.rebuild();

    console.log('Starting non keyed benchmark');
    await this.runAll();
    console.log('Non keyed benchmark ended');
  }

  createRows() {
    const label = 'Setting 1000 rows';
    console.time(label);
    this.data.items = buildData(1000);
    this.rebuild();
    console.timeEnd(label);
  }

  createManyRows() {
    const label = 'Setting 10000 rows';
    console.time(label);
    this.data.items = buildData(10000);
    this.rebuild();
    console.timeEnd(label);
  }

  appendRows() {
    const label = 'Appending 1000 rows';
    console.time(label);
    this.data.items = this.data.items.concat(buildData(1000));
    this.rebuild();
    console.timeEnd(label);
  }

  updateRows() {
    const label = 'Updating all rows';
    console.time(label);
    const { items } = this.data;
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      items[i] = { id: item.id, label: item.label + ' !!!' };
    }
    this.rebuild();
    console.timeEnd(label);
  }

  updateRowsPartial() {
    const label = 'Updating every 10 rows';
    console.time(label);
    const { items } = this.data;
    for (let i = 0; i < items.length; i += 10) {
      const item = items[i];
      items[i] = { id: item.id, label: item.label + ' !!!' };
    }
    this.rebuild();
    console.timeEnd(label);
  }

  removeRow() {
    const label = 'Removing a random row';
    console.time(label);
    const { items } = this.data;
    items.splice(items.indexOf(random(items.length)), 1);
    this.rebuild();
    console.timeEnd(label);
  }

  clearRows() {
    const label = 'Clearing rows';
    console.time(label);
    this.data.items = [];
    this.rebuild();
    console.timeEnd(label);
  }

  swapRows() {
    const label = 'Swapping 2 rows';
    console.time(label);
    const { items }= this.data;
    if (items.length > 998) {
      let temp = items[1];
      items[1] = items[998];
      items[998] = temp;
    }
    this.rebuild();
    console.timeEnd(label);
  }

  selectRow() {
    const label = 'Selecting a random row';
    console.time(label);
    this.data.selected = random(this.data.items.length);
    this.rebuild();
    console.timeEnd(label);
  }

  build() {
    return new div({
      children: new table({
        children: this.data.items.map((item, i) => new Row({
          item,
          key: this.addKey ? i : undefined,
          selected: this.data.selected === item.id,
        }))
      })
    })
  }
}

render(new Main, document.querySelector('[renderBox]'));
