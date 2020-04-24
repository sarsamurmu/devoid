import { Context } from '../context';
import { DevoidComponent } from '../component';
import { buildChild } from '../utils';

export const Builder = (builder: (context: Context) => DevoidComponent): DevoidComponent => ({
  dComp: true,
  render: (context) => buildChild(context, builder(context))
});
