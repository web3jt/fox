import path from 'path';
import cacache from 'cacache';

const ROOT_DIR = path.resolve(__dirname, '..');
const CACHE_DIR = path.join(ROOT_DIR, '.cache');

class Cache {
  async put(key: string, data: any) {
    await cacache.put(CACHE_DIR, key, JSON.stringify(data));
  }

  async get(key: string): Promise<any> {
    try {
      const result = await cacache.get(CACHE_DIR, key);
      return JSON.parse(result?.data.toString());
    } catch (error) {
      return undefined;
    }
  }
}

export const cache = new Cache();
