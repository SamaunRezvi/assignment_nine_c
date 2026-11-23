'use client';

import { useEffect } from 'react';
import { toast } from 'sonner';

const FLASH_KEY = 'fixmate:flash-toast';

// A toast fired right before a full page load is destroyed with the old page,
// so store it and show it once the next page has mounted.
export function queueFlashToast(message: string) {
  try {
    sessionStorage.setItem(FLASH_KEY, message);
  } catch {
    toast.success(message);
  }
}

export function FlashToast() {
  useEffect(() => {
    let message: string | null = null;
    try {
      message = sessionStorage.getItem(FLASH_KEY);
      sessionStorage.removeItem(FLASH_KEY);
    } catch {
      return;
    }
    if (message) toast.success(message);
  }, []);

  return null;
}
