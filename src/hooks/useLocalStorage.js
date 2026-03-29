import { useState, useEffect } from 'react';

export function useLocalStorage(key, defaultValue, { raw = false } = {}) {
  const [value, setValue] = useState(() => {
    try {
      const saved = localStorage.getItem(key);
      if (saved === null) return defaultValue;
      return raw ? saved : JSON.parse(saved);
    } catch {
      return defaultValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, raw ? value : JSON.stringify(value));
    } catch {
      // Storage full or unavailable
    }
  }, [key, value, raw]);

  return [value, setValue];
}
