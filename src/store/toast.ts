import { create } from 'zustand';

export interface ToastAction {
  label: string;
  onClick: () => void;
}

export interface Toast {
  id: number;
  message: string;
  action?: ToastAction;
  duration: number;
}

interface ToastState {
  current: Toast | null;
  show(message: string, options?: { action?: ToastAction; duration?: number }): void;
  dismiss(id?: number): void;
}

let nextId = 1;

/** One toast at a time: a new toast replaces the old one. */
export const useToastStore = create<ToastState>((set, get) => ({
  current: null,
  show(message, options = {}) {
    set({
      current: {
        id: nextId++,
        message,
        action: options.action,
        duration: options.duration ?? (options.action ? 5000 : 3000),
      },
    });
  },
  dismiss(id) {
    if (id === undefined || get().current?.id === id) set({ current: null });
  },
}));

export const toast = (message: string, options?: { action?: ToastAction; duration?: number }) =>
  useToastStore.getState().show(message, options);
