import { create } from 'zustand';
import type { ICar } from '../types/car';

type AnnouncementsState = {
  announcements: ICar[];
  setAnnouncements: (announcements: ICar[]) => void;
  addAnnouncement: (announcement: ICar) => void;
}

type UIState = {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  closeSidebar: () => void;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
};

export const useAnnouncementsStore = create<AnnouncementsState>((set) => ({
  announcements: [],
  setAnnouncements: (announcements) => set({ announcements }),
  addAnnouncement: (announcement) => set((state) => ({ announcements: [announcement, ...state.announcements] })),
}));

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: false,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  closeSidebar: () => set({ sidebarOpen: false }),
  theme: (localStorage.getItem('theme') as 'light' | 'dark') || 'light',
  setTheme: (theme) => {
    localStorage.setItem('theme', theme);
    set({ theme });
  },
}));