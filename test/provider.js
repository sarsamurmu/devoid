const {
  render,
  elements: {
    div,
    p,
    input,
    h4,
    button,
    br,
  },
  Component,
  Fragment,

  Provider,
  ChangeNotifier,
  Consumer
} = Devoid;

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

render(new div({
  children: new Provider({
    create: () => new DataModel(),
    child: new Fragment([
      new p({ children: 'A element' }),
      () => new div({
        children: [
          new p({ children: 'Another element' }),
          new Consumer({
            type: DataModel,
            tag: ['first'],
            builder: (context, dataModel, child) => new div({
              children: [
                new p({
                  children: `(Tag: 'first') The value is ${dataModel.value}`
                }),
                child,
              ]
            }),
            child: new (class extends Component {
              build() {
                return new p({
                  children: 'Some expensive component'
                })
              }

              render() {
                console.log(`Expensive Component: Should call only one time`);
                return super.render();
              }
            })
          }),
          new Consumer({
            type: DataModel,
            tag: ['second'],
            builder: (context, dataModel, child) => new p({ children: `(Tag: 'second') The value is ${dataModel.value}` })
          }),
        ]
      }),
      new h4({ children: 'New Value' }),
      new p({
        props: {
          classList: 'zust-form-el'
        },
        children: [
          new input({
            props: {
              classList: 'zust-input',
              placeholder: 'Enter new value'
            },
            on: {
              input: (e) => {
                modelValue = e.target.value;
              }
            }
          }),
        ]
      }),
      new h4({ children: 'Tag' }),
      new p({
        props: {
          classList: 'zust-form-el'
        },
        children: [
          new input({
            props: {
              classList: 'zust-input',
              placeholder: 'Enter tag'
            },
            on: {
              input: (e) => {
                modelTag = e.target.value;
              }
            }
          }),
        ]
      }),
      new br(),
      (context) => new button({
        children: 'Set value for tag',
        props: {
          classList: 'zust-btn'
        },
        on: {
          click: () => {
            Provider.of(context, DataModel).setValue(modelValue, modelTag);
          }
        }
      })
    ])
  })
}), document.querySelector('[renderBox]'));
