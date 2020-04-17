const {
  mount,
  el,
  build,
  Component,
  Fragment,
  Builder,

  Provider,
  Consumer,
  createModel,
} = Devoid;

const ExpensiveComponent = () => Component(() => {
  build(() => {
    console.log(`Expensive Component: Should call only one time`);

    return el('p', [
      'Some expensive component',
      el('p', 'Child of expensive component')
    ])
  })
})

const ProviderApp = () => Component(() => {
  let modelValue = '';
  let modelTag = '';

  const DataModel = createModel((notify) => {
    console.log(`DataModel: Should call only one time`);

    let value = 'Red';

    return {
      get value() {
        return value;
      },
      setValue(newValue, tag) {
        value = newValue;
        notify(modelTag.trim() === '' ? [] : [tag]);
      }
    }
  });
  
  build(() => Provider({
    create: () => new DataModel(),
    child: Fragment([
      el('p', 'An element'),
      el('div', [
        el('p', 'Another element'),
        Consumer({
          model: DataModel,
          tags: ['first'],
          builder: (context, dataModel, child) => el('div', [
            el('p', `(Tag: 'first') The value is ${dataModel.value}`),
            child,
          ]),
          child: ExpensiveComponent(),
        }),
        Consumer({
          model: DataModel,
          tags: ['second'],
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
      Builder((context) => el('button.zust-btn', {
        on: {
          click: () => Provider.of(context, DataModel).setValue(modelValue, modelTag),
        }
      }, 'Set value for tag'))
    ])
  }))
});

mount(ProviderApp(), document.querySelector('[renderBox]'));
