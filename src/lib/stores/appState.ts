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
    };
}

const initialState: AppState = {
    mode: 'intro',
    currentView: 'big-picture',
    userData: {
        name: 'TRAVELLER',
        age: null,
        lifeExpectancy: 80,
        sleepHours: 8,
        workHours: 8,
        workDays: 5,
        screenTime: 3,
        commuteTime: 1
    }
};

export const appState = writable<AppState>(initialState);

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
