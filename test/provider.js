const {
  render,
  el,
  Component,
  Fragment,

  Provider,
  ChangeNotifier,
  Consumer
} = Devoid;

class ExpensiveComp extends Component {
  build() {
    return el('p', [
      'Some expensive component',
      new (class extends Component {
        constructor() {
          super();
          this.text = 'Child of expensive component';
        }

        didMount() {
          setTimeout(() => {
            this.text += ' (re-rendered)';
            this.rebuild();
            console.log(this.vNodes);
          }, 5000);
        }

        build() {
          return new Fragment([
            el('p', this.text),
            el('p', 'Another child of expensive component')
          ]);
        }
      })
    ]);
  }

  render() {
    console.log(`Expensive Component: Should call only one time`);
    return super.render();
  }
}

class DataModel extends ChangeNotifier {
  constructor() {
    super();
    console.log(`DataModel: Should call only one time`);
    this.value = 'Red';
  }

  setValue(value, tag) {
    this.value = value;
    this.notifyListeners(tag.trim() === '' ? [] : [tag]);
  }
}

let modelValue = '';
let modelTag = '';

render(el('div', [
  new Provider({
    create: () => new DataModel(),
    child: new Fragment([
      el('p', 'An element'),
      el('div', [
        el('p', 'Another element'),
        new Consumer({
          type: DataModel,
          tag: ['first'],
          builder: (context, dataModel, child) => el('div', [
            el('p', `(Tag: 'first') The value is ${dataModel.value}`),
            child,
          ]),
          child: new ExpensiveComp(),
        }),
        new Consumer({
          type: DataModel,
          tag: ['second'],
          builder: (context, dataModel, child) => el('p', `(Tag: 'second') The value is ${dataModel.value}`)
        }),
      ]),
      el('h4', 'New Value'),
      el('p.zust-form-el', [
        el('input.zust-input[placeholder="Enter new value"]', {
          on: {
            input: (e) => {
              modelValue = e.target.value;
            }
          }
        }),
      ]),
      el('h4', 'Tag'),
      el('p.zust-form-el', [
        el('input.zust-input[placeholder="Enter tag"]', {
          on: {
            input: (e) => {
              modelTag = e.target.value;
            }
          }
        })
      ]),
      el('br'),
      (context) => el('button.zust-btn', {
        on: {
          click: () => {
            Provider.of(context, DataModel).setValue(modelValue, modelTag);
          }
        }
      }, 'Set value for tag')
    ])
  })
]), document.querySelector('[renderBox]'));
