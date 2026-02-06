import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://icowleberspepmipazdl.supabase.co';
const SUPABASE_KEY = 'sb_publishable_cDu5mHwQoQ0p2Ke4l4zKPg_HxIIAZbx';

// Fallback memory storage for environments where localStorage is restricted
const memoryStore: Record<string, string> = {};

const safeStorage = {
  getItem: (key: string): string | null => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage.getItem(key);
      }
    } catch (e) {
      // SecurityError: The operation is insecure.
      // Falls through to memory store
    }
    return memoryStore[key] || null;
  },
  setItem: (key: string, value: string): void => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, value);
        return;
      }
    } catch (e) {
      // SecurityError
    }
    memoryStore[key] = value;
  },
  removeItem: (key: string): void => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(key);
        return;
      }
    } catch (e) {
      // SecurityError
    }
    delete memoryStore[key];
  },
};

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    storage: safeStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});