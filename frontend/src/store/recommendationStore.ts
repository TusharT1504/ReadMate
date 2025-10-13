import { create } from 'zustand';

interface RecommendationContext {
  mood: string;
  timeOfDay: string;
  weather: string;
  location?: { lat: number; lon: number };
}

interface RecommendationState {
  context: RecommendationContext;
  setMood: (mood: string) => void;
  setTimeOfDay: (time: string) => void;
  setWeather: (weather: string) => void;
  setLocation: (location: { lat: number; lon: number }) => void;
  resetContext: () => void;
}

const getDefaultTimeOfDay = () => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 21) return 'evening';
  return 'night';
};

export const useRecommendationStore = create<RecommendationState>((set) => ({
  context: {
    mood: '',
    timeOfDay: getDefaultTimeOfDay(),
    weather: '',
  },
  setMood: (mood) => set((state) => ({ context: { ...state.context, mood } })),
  setTimeOfDay: (timeOfDay) => set((state) => ({ context: { ...state.context, timeOfDay } })),
  setWeather: (weather) => set((state) => ({ context: { ...state.context, weather } })),
  setLocation: (location) => set((state) => ({ context: { ...state.context, location } })),
  resetContext: () => set({ 
    context: { 
      mood: '', 
      timeOfDay: getDefaultTimeOfDay(), 
      weather: '' 
    } 
  }),
}));
