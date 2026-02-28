import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  MOCK_STUDENT,
  MOCK_ATTRACTOR,
  MOCK_TODAY_DRIFT,
  MOCK_DRIFT_HISTORY,
  MOCK_FINGERPRINT
} from '../data/mockData';
import {
  generateDrift,
  acceptDriftApi,
  skipDriftApi,
  logDriftOutcome,
  getBubble,
  getUnexplored
} from '../lib/api';

const useDriftStore = create(
  persist(
    (set, get) => ({
      // State
      student: MOCK_STUDENT,
      attractor: MOCK_ATTRACTOR,
      todaysDrift: MOCK_TODAY_DRIFT,
      driftHistory: MOCK_DRIFT_HISTORY,
      fingerprint: MOCK_FINGERPRINT,
      isReasoningOpen: false,
      toastMessage: null,
      onboarded: false,
      loading: false,

      // Actions
      setStudent: (profile) => set({ student: profile }),
      setOnboarded: (val) => set({ onboarded: val }),

      fetchDrift: async () => {
        const { student } = get();
        if (!student?.id) return;
        set({ loading: true });
        try {
          const res = await generateDrift(student.id);
          set({ todaysDrift: res.data, loading: false });
        } catch (err) {
          console.warn('API unavailable, using mock drift:', err.message);
          set({ todaysDrift: MOCK_TODAY_DRIFT, loading: false });
        }
      },

      fetchBubble: async () => {
        const { student } = get();
        if (!student?.id) return;
        try {
          const res = await getBubble(student.id);
          set({
            attractor: {
              ...get().attractor,
              ...res.data,
              bubble_percentage: res.data.bubble_percentage,
              departments_visited: res.data.departments_visited,
            }
          });
        } catch (err) {
          console.warn('Bubble API unavailable:', err.message);
        }
      },

      fetchUnexplored: async () => {
        const { student } = get();
        if (!student?.id) return;
        try {
          const res = await getUnexplored(student.id);
          return res.data.unexplored_areas || [];
        } catch {
          return [];
        }
      },

      acceptDrift: async (driftId) => {
        const state = get();
        const drift = state.todaysDrift;
        if (!drift || drift.id !== driftId) return;

        const updatedDrift = { ...drift, status: 'accepted' };
        const updatedStudent = {
          ...state.student,
          drift_score: state.student.drift_score + 10,
          drift_streak: state.student.drift_streak + 1
        };

        set({
          todaysDrift: updatedDrift,
          student: updatedStudent,
          driftHistory: [updatedDrift, ...state.driftHistory],
          toastMessage: `🌱 Drift accepted! See you at ${drift.location.split('—')[1]?.trim() || drift.location}.`
        });

        setTimeout(() => set({ toastMessage: null }), 3000);

        // Fire API (don't block UI)
        try {
          await acceptDriftApi(driftId, state.student.id);
        } catch (err) {
          console.warn('Accept API failed:', err.message);
        }
      },

      skipDrift: async (driftId) => {
        const state = get();
        const drift = state.todaysDrift;
        if (!drift || drift.id !== driftId) return;

        set({
          todaysDrift: { ...drift, status: 'skipped' },
          student: { ...state.student, drift_streak: 0 },
          driftHistory: [{ ...drift, status: 'skipped' }, ...state.driftHistory],
        });

        try {
          await skipDriftApi(driftId, state.student.id);
        } catch (err) {
          console.warn('Skip API failed:', err.message);
        }
      },

      logOutcome: async (driftId, wasInteresting, description) => {
        const state = get();
        const updatedHistory = state.driftHistory.map((d) => {
          if (d.id === driftId) {
            return {
              ...d,
              status: 'completed',
              outcome: {
                drift_id: driftId,
                was_interesting: wasInteresting,
                description,
                logged_at: new Date().toISOString(),
                fingerprint_tags: wasInteresting
                  ? ['creative', 'connection']
                  : ['exploratory']
              }
            };
          }
          return d;
        });

        const meaningful = updatedHistory.filter(
          (d) => d.outcome && d.outcome.was_interesting
        ).length;

        const scoreBonus = wasInteresting ? 25 : 0;

        set({
          driftHistory: updatedHistory,
          student: {
            ...state.student,
            drift_score: state.student.drift_score + scoreBonus
          },
          fingerprint: {
            ...state.fingerprint,
            meaningful_drifts: meaningful,
            meaningful_rate: meaningful / Math.max(updatedHistory.length, 1),
            total_drifts: updatedHistory.length
          },
          toastMessage: wasInteresting
            ? '✨ Meaningful drift logged! Fingerprint updated.'
            : '📝 Drift outcome recorded. Algorithm adjusting.'
        });

        setTimeout(() => set({ toastMessage: null }), 3000);

        try {
          await logDriftOutcome(driftId, wasInteresting, description, state.student.id);
        } catch (err) {
          console.warn('Outcome API failed:', err.message);
        }
      },

      openReasoning: () => set({ isReasoningOpen: true }),
      closeReasoning: () => set({ isReasoningOpen: false }),
      clearToast: () => set({ toastMessage: null }),
      showToast: (msg) => {
        set({ toastMessage: msg });
        setTimeout(() => set({ toastMessage: null }), 3000);
      },
    }),
    {
      name: 'karmai-store',
      partialize: (state) => ({
        student: state.student,
        attractor: state.attractor,
        driftHistory: state.driftHistory,
        fingerprint: state.fingerprint,
        onboarded: state.onboarded,
      }),
    }
  )
);

export default useDriftStore;
