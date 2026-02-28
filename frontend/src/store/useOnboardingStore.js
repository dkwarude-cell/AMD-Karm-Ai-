import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useOnboardingStore = create(
  persist(
    (set, get) => ({
      step: 0,
      direction: 1,
      department: '',
      year: null,
      name: '',
      skills: [],
      interests: [],
      timeBudget: null,
      freeOnly: false,
      completed: false,

      setStep: (step) => set({ step }),
      nextStep: () => set((s) => ({ step: Math.min(s.step + 1, 2), direction: 1 })),
      prevStep: () => set((s) => ({ step: Math.max(s.step - 1, 0), direction: -1 })),

      setName: (name) => set({ name }),
      setDepartment: (department) => set({ department }),
      setYear: (year) => set({ year }),

      addSkill: (skill) => {
        const { skills } = get();
        if (skills.length < 5 && !skills.includes(skill)) {
          set({ skills: [...skills, skill] });
        }
      },
      removeSkill: (skill) => {
        set({ skills: get().skills.filter((s) => s !== skill) });
      },

      addInterest: (interest) => {
        const { interests } = get();
        if (interests.length < 8 && !interests.includes(interest)) {
          set({ interests: [...interests, interest] });
        }
      },
      removeInterest: (interest) => {
        set({ interests: get().interests.filter((i) => i !== interest) });
      },

      setTimeBudget: (timeBudget) => set({ timeBudget }),
      setFreeOnly: (freeOnly) => set({ freeOnly }),
      setCompleted: (completed) => set({ completed }),

      isStepComplete: (stepNum) => {
        const state = get();
        switch (stepNum) {
          case 0: return true;
          case 1: return true;
          case 2: return state.department !== '' && state.skills.length >= 1;
          default: return false;
        }
      },

      isReadyToSubmit: () => {
        const state = get();
        return state.department !== '' && state.skills.length >= 1;
      },

      reset: () => set({
        step: 0, direction: 1, department: '', year: null, name: '',
        skills: [], interests: [], timeBudget: null, freeOnly: false, completed: false
      })
    }),
    {
      name: 'karmai-onboarding',
      partialize: (state) => ({ completed: state.completed }),
    }
  )
);

export default useOnboardingStore;
