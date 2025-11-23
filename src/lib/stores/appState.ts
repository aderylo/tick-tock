import { writable } from 'svelte/store';

export type ViewType = 'big-picture' | 'yearly' | 'monthly' | 'weekly' | 'calendar';
export type AppMode = 'intro' | 'age-input' | 'dashboard';

export interface AppState {
    mode: AppMode;
    currentView: ViewType;
    userData: {
        name: string;
        age: number | null;
        lifeExpectancy: number;
        sleepHours: number;
        workHours: number;
        workDays: number;
        screenTime: number;
        commuteTime: number;
        deadline?: {
            name?: string;
            date: string | null;
            time: string | null;
            startDate?: string;
        };
        savedDeadlines?: {
            name: string;
            date: string;
            time: string;
            startDate: string;
        }[];
        exclusions: {
            sleep: boolean;
            work: boolean;
            commute: boolean;
        };
    };
}

const defaultUserData = {
    name: 'TRAVELLER',
    age: null,
    lifeExpectancy: 80,
    sleepHours: 8,
    workHours: 8,
    workDays: 5,
    screenTime: 3,
    commuteTime: 1,
    deadline: {
        name: '',
        date: null,
        time: null
    },
    savedDeadlines: [],
    exclusions: {
        sleep: false,
        work: false,
        commute: false
    }
};

const initialState: AppState = {
    mode: 'intro',
    currentView: 'big-picture',
    userData: defaultUserData
};

function createPersistedStore() {
    // Check if we're in a browser environment
    const isBrowser = typeof localStorage !== 'undefined';
    
    // Load from local storage if available
    let startState = initialState;
    if (isBrowser) {
        const stored = localStorage.getItem('tick-tock-state');
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                // Merge with initial state to ensure all fields exist (migration safe-ish)
                startState = {
                    ...initialState,
                    ...parsed,
                    userData: {
                        ...defaultUserData,
                        ...parsed.userData
                    }
                };
            } catch (e) {
                console.error("Failed to parse stored state", e);
            }
        }
    }

    const { subscribe, set, update } = writable<AppState>(startState);

    return {
        subscribe,
        set: (val: AppState) => {
            if (isBrowser) localStorage.setItem('tick-tock-state', JSON.stringify(val));
            set(val);
        },
        update: (fn: (val: AppState) => AppState) => {
            update(state => {
                const newState = fn(state);
                if (isBrowser) localStorage.setItem('tick-tock-state', JSON.stringify(newState));
                return newState;
            });
        }
    };
}

export const appState = createPersistedStore();

export const resetAppState = () => {
    if (typeof localStorage !== 'undefined') {
        localStorage.removeItem('tick-tock-state');
    }
    appState.set(initialState);
};

export const setMode = (mode: AppMode) => {
    appState.update(state => ({ ...state, mode }));
};

export const setView = (view: ViewType) => {
    appState.update(state => ({ ...state, currentView: view }));
};

export const updateUserData = (data: Partial<AppState['userData']>) => {
    appState.update(state => ({
        ...state,
        userData: { ...state.userData, ...data }
    }));
};
