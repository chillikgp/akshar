import { create } from 'zustand';
import type { Level, TileState, KeyState, GameStatus } from '../types/game';
import { parseLevels } from '../data/parseLevels';
import { evaluateGuess } from '../lib/evaluateGuess';

const STORAGE_KEYS = {
    currentLevel: 'akshar_currentLevel',
    completedLevels: 'akshar_completedLevels',
} as const;

/** Priority ordering for keyboard key state (higher = wins) */
const KEY_PRIORITY: Record<KeyState, number> = {
    unused: 0,
    absent: 1,
    present: 2,
    correct: 3,
};

interface GameState {
    // Game data
    levels: Level[];
    initialized: boolean;

    // Current level state
    currentLevel: number;
    targetConsonants: string[];
    targetKey: string;
    matraPattern: string[];
    maxAttempts: number;

    // Guess state
    guesses: string[][];
    evaluations: TileState[][];
    currentGuess: string[];

    // Game status
    status: GameStatus;
    keyboardState: Record<string, KeyState>;

    // Progress
    completedLevels: number[];

    // UI state
    toastMessage: string | null;
    shakeRow: boolean;
    revealingRow: number | null;
    isHintOpen: boolean;

    // Actions
    initGame: (urlLevel?: number) => Promise<void>;
    loadLevel: (levelNum: number) => void;
    addLetter: (letter: string) => void;
    removeLetter: () => void;
    submitGuess: () => void;
    nextLevel: () => number | null;
    restartLevel: () => void;
    openHint: () => void;
    closeHint: () => void;
    showToast: (message: string) => void;
    clearToast: () => void;
    clearShake: () => void;
    clearReveal: () => void;
}

function loadFromStorage<T>(key: string, fallback: T): T {
    try {
        const raw = localStorage.getItem(key);
        if (raw === null) return fallback;
        return JSON.parse(raw) as T;
    } catch {
        return fallback;
    }
}

function saveToStorage(key: string, value: unknown): void {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch {
        // Silently fail if localStorage is unavailable
    }
}

export const useGameStore = create<GameState>((set, get) => ({
    // Initial defaults
    levels: [],
    initialized: false,
    currentLevel: 1,
    targetConsonants: [],
    targetKey: '',
    matraPattern: [],
    maxAttempts: 6,
    guesses: [],
    evaluations: [],
    currentGuess: [],
    status: 'playing',
    keyboardState: {},
    completedLevels: [],
    toastMessage: null,
    shakeRow: false,
    revealingRow: null,
    isHintOpen: false,

    initGame: async (urlLevel?: number) => {
        const levels = await parseLevels();
        const savedCompleted = loadFromStorage<number[]>(STORAGE_KEYS.completedLevels, []);
        const cleanedCompleted = savedCompleted.filter((l) => l <= levels.length);

        // Determine which level to load
        let targetLevel: number;

        if (urlLevel !== undefined) {
            // URL takes priority — validate it
            targetLevel = (urlLevel >= 1 && urlLevel <= levels.length) ? urlLevel : 1;
        } else {
            // Fall back to saved progress
            const savedLevel = loadFromStorage<number>(STORAGE_KEYS.currentLevel, 1);
            targetLevel = (savedLevel >= 1 && savedLevel <= levels.length) ? savedLevel : 1;
        }

        const level = levels.find((l) => l.level === targetLevel);
        if (!level) return;

        saveToStorage(STORAGE_KEYS.currentLevel, targetLevel);

        set({
            levels,
            initialized: true,
            currentLevel: targetLevel,
            targetConsonants: level.consonants,
            targetKey: level.consonants.join('|'),
            matraPattern: level.matraPattern,
            maxAttempts: level.consonants.length + 2,
            guesses: [],
            evaluations: [],
            currentGuess: [],
            status: 'playing',
            keyboardState: {},
            completedLevels: cleanedCompleted,
            isHintOpen: false,
        });
    },

    loadLevel: (levelNum: number) => {
        const { levels } = get();
        const validLevel = (levelNum >= 1 && levelNum <= levels.length) ? levelNum : 1;
        const level = levels.find((l) => l.level === validLevel);
        if (!level) return;

        saveToStorage(STORAGE_KEYS.currentLevel, validLevel);

        set({
            currentLevel: validLevel,
            targetConsonants: level.consonants,
            targetKey: level.consonants.join('|'),
            matraPattern: level.matraPattern,
            maxAttempts: level.consonants.length + 2,
            guesses: [],
            evaluations: [],
            currentGuess: [],
            status: 'playing',
            keyboardState: {},
            revealingRow: null,
            isHintOpen: false,
        });
    },

    addLetter: (letter: string) => {
        const { currentGuess, targetConsonants, status } = get();
        if (status !== 'playing') return;
        if (currentGuess.length >= targetConsonants.length) return;

        set({ currentGuess: [...currentGuess, letter] });
    },

    removeLetter: () => {
        const { currentGuess, status } = get();
        if (status !== 'playing') return;
        if (currentGuess.length === 0) return;

        set({ currentGuess: currentGuess.slice(0, -1) });
    },

    submitGuess: () => {
        const {
            currentGuess,
            targetConsonants,
            targetKey,
            guesses,
            evaluations,
            keyboardState,
            status,
            maxAttempts,
        } = get();

        if (status !== 'playing') return;

        // Only validation: check if guess is complete
        if (currentGuess.length < targetConsonants.length) {
            get().showToast('पर्याप्त अक्षर नहीं');
            set({ shakeRow: true });
            return;
        }

        // Evaluate the guess
        const guessKey = currentGuess.join('|');
        const evaluation = evaluateGuess(currentGuess, targetConsonants);
        const newGuesses = [...guesses, [...currentGuess]];
        const newEvaluations = [...evaluations, evaluation];

        // Update keyboard state with priority
        const newKeyboardState = { ...keyboardState };
        for (let i = 0; i < currentGuess.length; i++) {
            const letter = currentGuess[i];
            const newState = evaluation[i];
            const existingState = newKeyboardState[letter] || 'unused';

            // Only upgrade, never downgrade
            if (KEY_PRIORITY[newState] > KEY_PRIORITY[existingState]) {
                newKeyboardState[letter] = newState;
            }
        }

        // Determine game status
        const isWin = guessKey === targetKey;
        const isLoss = !isWin && newGuesses.length >= maxAttempts;
        const newStatus: GameStatus = isWin ? 'won' : isLoss ? 'lost' : 'playing';

        // If won, update progress
        const { currentLevel, completedLevels } = get();
        let newCompleted = completedLevels;
        if (isWin && !completedLevels.includes(currentLevel)) {
            newCompleted = [...completedLevels, currentLevel];
            saveToStorage(STORAGE_KEYS.completedLevels, newCompleted);
        }

        set({
            guesses: newGuesses,
            evaluations: newEvaluations,
            currentGuess: [],
            keyboardState: newKeyboardState,
            status: newStatus,
            completedLevels: newCompleted,
            revealingRow: newGuesses.length - 1,
        });
    },

    nextLevel: (): number | null => {
        const { currentLevel, levels } = get();
        const nextLevelNum = currentLevel + 1;

        if (nextLevelNum > levels.length) {
            return null; // All levels complete
        }

        const level = levels.find((l) => l.level === nextLevelNum);
        if (!level) return null;

        saveToStorage(STORAGE_KEYS.currentLevel, nextLevelNum);

        set({
            currentLevel: nextLevelNum,
            targetConsonants: level.consonants,
            targetKey: level.consonants.join('|'),
            matraPattern: level.matraPattern,
            maxAttempts: level.consonants.length + 2,
            guesses: [],
            evaluations: [],
            currentGuess: [],
            status: 'playing',
            keyboardState: {},
            revealingRow: null,
            isHintOpen: false,
        });

        return nextLevelNum;
    },

    restartLevel: () => {
        const { currentLevel, levels } = get();
        const level = levels.find((l) => l.level === currentLevel);
        if (!level) return;

        set({
            targetConsonants: level.consonants,
            targetKey: level.consonants.join('|'),
            matraPattern: level.matraPattern,
            maxAttempts: level.consonants.length + 2,
            guesses: [],
            evaluations: [],
            currentGuess: [],
            status: 'playing',
            keyboardState: {},
            revealingRow: null,
            isHintOpen: false,
        });
    },

    openHint: () => {
        const { status } = get();
        if (status !== 'playing') return;
        set({ isHintOpen: true });
    },

    closeHint: () => {
        set({ isHintOpen: false });
    },

    showToast: (message: string) => {
        set({ toastMessage: message });
    },

    clearToast: () => {
        set({ toastMessage: null });
    },

    clearShake: () => {
        set({ shakeRow: false });
    },

    clearReveal: () => {
        set({ revealingRow: null });
    },
}));
