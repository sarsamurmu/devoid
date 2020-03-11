import { Component } from './component';
import { PrimaryComponent } from './elements';

export type anyComp = Component | PrimaryComponent;

const debug = window.location.hostname === 'localhost';
export const log = (...data: any): any => {
  if (debug) console.log(...data);
}
