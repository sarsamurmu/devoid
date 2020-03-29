export interface Notifier {
  setListener(key: any, callback: () => void): void;
  removeListener(key: any): void;
  notifyListeners(): void;
}
