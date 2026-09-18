import { create } from 'zustand';

export const useAppStore = create((set, get) => ({
  toasts: [],
  isAuthModalOpen: false,
  authModalMode: 'login', // 'login' | 'register'
  isCreatePlaylistOpen: false,
  isSidebarMobileOpen: false,
  pwaInstallPrompt: null,

  showToast: (message, type = 'info', duration = 3000) => {
    const id = Date.now();
    set(state => ({
      toasts: [...state.toasts, { id, message, type }]
    }));

    setTimeout(() => {
      set(state => ({
        toasts: state.toasts.filter(t => t.id !== id)
      }));
    }, duration);
  },

  removeToast: (id) => {
    set(state => ({
      toasts: state.toasts.filter(t => t.id !== id)
    }));
  },

  openAuthModal: (mode = 'login') => set({ isAuthModalOpen: true, authModalMode: mode }),
  closeAuthModal: () => set({ isAuthModalOpen: false }),

  openCreatePlaylistModal: () => set({ isCreatePlaylistOpen: true }),
  closeCreatePlaylistModal: () => set({ isCreatePlaylistOpen: false }),

  toggleMobileSidebar: () => set(state => ({ isSidebarMobileOpen: !state.isSidebarMobileOpen })),
  closeMobileSidebar: () => set({ isSidebarMobileOpen: false }),

  setPwaInstallPrompt: (prompt) => set({ pwaInstallPrompt: prompt })
}));
