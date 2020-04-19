import { copyMap } from './utils';

export class Context {
  private data = new Map();

  constructor(fromMap?: Map<any, any>) {
    if (fromMap) copyMap(fromMap, this.data);
  }

  set(key: any, value: any) {
    this.data.set(key, value);
  }

  get<T>(key: any): T {
    return this.data.get(key);
  }

  copy() {
    return new Context(this.data);
  }
}
