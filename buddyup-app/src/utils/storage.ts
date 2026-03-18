import { MMKV } from "react-native-mmkv";

type StorageLike = {
  getString(key: string): string | undefined;
  getBoolean(key: string): boolean | undefined;
  set(key: string, value: string | number | boolean): void;
  delete(key: string): void;
};

class MemoryStorage implements StorageLike {
  private map = new Map<string, string>();

  getString(key: string): string | undefined {
    return this.map.get(key);
  }

  getBoolean(key: string): boolean | undefined {
    const value = this.map.get(key);
    if (value === undefined) return undefined;
    return value === "true";
  }

  set(key: string, value: string | number | boolean): void {
    this.map.set(key, String(value));
  }

  delete(key: string): void {
    this.map.delete(key);
  }
}

let warned = false;

export function createStorage(): StorageLike {
  try {
    return new MMKV();
  } catch (error) {
    if (!warned) {
      warned = true;
      console.warn(
        "MMKV unavailable (likely non-JSI debug runtime). Falling back to in-memory storage.",
        error
      );
    }
    return new MemoryStorage();
  }
}
