import { copyMap } from './utils';

export class Context {
  protected contextData: Map<any, any>;

  constructor(fromMap?: Map<any, any>) {
    this.contextData = new Map();
    if (fromMap) copyMap(fromMap, this.contextData);
  }

  set(key: any, value: any) {
    this.contextData.set(key, value);
  }

  get<T>(key: any): T {
    return this.contextData.get(key);
  }

  copy() {
    return new Context(this.contextData);
  }
}
