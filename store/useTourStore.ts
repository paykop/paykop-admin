// store/useTourStore.ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface TourState {
  completedTourIds: string[];
  activeTourId: string | null;
  currentStepIndex: number;
  markTourCompleted: (tourId: string) => void;
  setActiveTour: (tourId: string | null, stepIndex?: number) => void;
  resetTour: (tourId: string) => void;
  resetAllTours: () => void;
  isTourCompleted: (tourId: string) => boolean;
}

export const useTourStore = create<TourState>()(
  persist(
    (set, get) => ({
      completedTourIds: [],
      activeTourId: null,
      currentStepIndex: 0,

      markTourCompleted: (tourId: string) => {
        const { completedTourIds } = get();
        if (!completedTourIds.includes(tourId)) {
          set({
            completedTourIds: [...completedTourIds, tourId],
            activeTourId: null,
            currentStepIndex: 0,
          });
        } else {
          set({ activeTourId: null, currentStepIndex: 0 });
        }
      },

      setActiveTour: (tourId: string | null, stepIndex = 0) => {
        set({ activeTourId: tourId, currentStepIndex: stepIndex });
      },

      resetTour: (tourId: string) => {
        set((state) => ({
          completedTourIds: state.completedTourIds.filter((id) => id !== tourId),
        }));
      },

      resetAllTours: () => {
        set({ completedTourIds: [], activeTourId: null, currentStepIndex: 0 });
      },

      isTourCompleted: (tourId: string) => {
        return get().completedTourIds.includes(tourId);
      },
    }),
    {
      name: "paykop_admin_tours",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ completedTourIds: state.completedTourIds }),
    }
  )
);
