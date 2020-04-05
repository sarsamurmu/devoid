// Follows these
// https://krausest.github.io/js-framework-benchmark/current.html
// https://github.com/krausest/js-framework-benchmark

const {
  render,
  Component,
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

class Row extends Component {
  constructor(data) {
    super();
    this.data = data;
  }

  build() {
    return el('tr', {
      style: {
        color: this.data.selected ? 'aquamarine' : undefined,
      },
      key: this.data.key,
    }, el('p', this.data.item.label));
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

  runTimed(label, callback) {
    console.log(label);
    console.time('  - Whole');
    callback();
    console.time('  - Rebuild');
    this.rebuild();
    console.timeEnd('  - Rebuild');
    console.timeEnd('  - Whole');
  }

  createRows() {
    this.runTimed('Setting 1000 rows', () => {
      this.data.items = buildData(1000);
    })
  }

  createManyRows() {
    this.runTimed('Setting 10000 rows', () => {
      this.data.items = buildData(10000);
    });
  }

  appendRows() {
    this.runTimed('Appending 1000 rows', () => {
      this.data.items = this.data.items.concat(buildData(1000));
    });
  }

  updateRows() {
    this.runTimed('Updating all rows', () => {
      const { items } = this.data;
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        items[i] = { id: item.id, label: item.label + ' !!!' };
      }
    })
  }

  updateRowsPartial() {
    this.runTimed('Updating every 10 rows', () => {
      const { items } = this.data;
      for (let i = 0; i < items.length; i += 10) {
        const item = items[i];
        items[i] = { id: item.id, label: item.label + ' !!!' };
      }
    });
  }

  removeRow() {
    this.runTimed('Removing a random row', () => {
      const { items } = this.data;
      items.splice(items.indexOf(random(items.length)), 1);
    })
  }

  clearRows() {
    this.runTimed('Clearing rows', () => {
      this.data.items = [];
    })
  }

  swapRows() {
    this.runTimed('Swapping 2 rows', () => {
      const { items } = this.data;
      if (items.length > 998) {
        let temp = items[1];
        items[1] = items[998];
        items[998] = temp;
      }
    });
  }

  selectRow() {
    this.runTimed('Selecting a random row', () => {
      this.data.selected = random(this.data.items.length);
    });
  }

  build() {
    return el('div', [
      el('table', this.data.items.map((item, i) => new Row({
        item,
        key: this.addKey ? i : undefined,
        selected: this.data.selected === item.id,
      })))
    ]);
  }
}

render(new Main, document.querySelector('[renderBox]'));
