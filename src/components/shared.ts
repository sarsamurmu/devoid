export interface Notifier {
  addListener(key: any, callback: () => void): void;
  removeListener(key: any): void;
  notifyListeners(): void;
}
