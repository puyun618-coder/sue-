import { create } from 'zustand';
import { AppMode, GestureType, PhotoData } from './types';

interface AppState {
  mode: AppMode;
  gesture: GestureType;
  photos: PhotoData[];
  isVisionEnabled: boolean;
  isLoading: boolean;
  
  setMode: (mode: AppMode) => void;
  setGesture: (gesture: GestureType) => void;
  addPhoto: (url: string) => void;
  toggleVision: () => void;
  setLoading: (loading: boolean) => void;
}

export const useStore = create<AppState>((set) => ({
  mode: AppMode.FORMED,
  gesture: GestureType.NONE,
  photos: [],
  isVisionEnabled: false,
  isLoading: false,

  setMode: (mode) => set({ mode }),
  setGesture: (gesture) => set({ gesture }),
  toggleVision: () => set((state) => ({ isVisionEnabled: !state.isVisionEnabled })),
  setLoading: (loading) => set({ isLoading: loading }),
  
  addPhoto: (url) => set((state) => {
    // Generate random position on the "tree surface" approximately
    const theta = Math.random() * Math.PI * 2;
    const y = Math.random() * 8 - 2; // Height distribution
    const r = (1 - (y + 4) / 14) * 5; // Cone radius at height
    
    const x = Math.cos(theta) * r;
    const z = Math.sin(theta) * r;

    const newPhoto: PhotoData = {
      id: Math.random().toString(36).substr(2, 9),
      url,
      position: [x * 1.1, y, z * 1.1], // Slightly outside
      rotation: [0, -theta + Math.PI / 2, 0], // Face outward
      scale: 1,
    };
    return { photos: [...state.photos, newPhoto] };
  }),
}));
