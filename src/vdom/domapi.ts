export interface DOMAPI {
  createElement: (tagName: any) => HTMLElement;
  createElementNS: (namespaceURI: string, qualifiedName: string) => Element;
  createTextNode: (text: string) => Text;
  createComment: (text: string) => Comment;
  insertBefore: (parentNode: Node, newNode: Node, referenceNode: Node | null) => void;
  removeChild: (node: Node, child: Node) => void;
  appendChild: (node: Node, child: Node) => void;
  parentNode: (node: Node) => Node | null;
  nextSibling: (node: Node) => Node | null;
  tagName: (elm: Element) => string;
  setTextContent: (node: Node, text: string | null) => void;
  getTextContent: (node: Node) => string | null;
  isElement: (node: Node) => node is Element;
  isText: (node: Node) => node is Text;
  isComment: (node: Node) => node is Comment;
}

const createElement = (tagName: any): HTMLElement => document.createElement(tagName);

const createElementNS = (namespaceURI: string, qualifiedName: string): Element => {
  return document.createElementNS(namespaceURI, qualifiedName);
}

const createTextNode = (text: string): Text => document.createTextNode(text);

const createComment = (text: string): Comment => document.createComment(text);

const insertBefore = (parentNode: Node, newNode: Node, referenceNode: Node | null) => {
  parentNode.insertBefore(newNode, referenceNode);
}

const removeChild = (node: Node, child: Node) => {
  node.removeChild(child);
}

const appendChild = (node: Node, child: Node) => {
  node.appendChild(child);
}

const parentNode = (node: Node): Node | null => node.parentNode;

const nextSibling = (node: Node): Node | null => node.nextSibling;

const tagName = (elm: Element): string => elm.tagName;

const setTextContent = (node: Node, text: string | null) => {
  node.textContent = text;
}

const getTextContent = (node: Node): string | null => {
  return node.textContent;
}

const isElement = (node: Node): node is Element => node.nodeType === 1;

const isText = (node: Node): node is Text => node.nodeType === 3;

const isComment = (node: Node): node is Comment => {
  return node.nodeType === 8;
}

export const htmlDomApi: DOMAPI = {
  createElement,
  createElementNS,
  createTextNode,
  createComment,
  insertBefore,
  removeChild,
  appendChild,
  parentNode,
  nextSibling,
  tagName,
  setTextContent,
  getTextContent,
  isElement,
  isText,
  isComment,
};
