export type TileState = 'correct' | 'present' | 'absent';

export type KeyState = 'unused' | 'correct' | 'present' | 'absent';

export type GameStatus = 'playing' | 'won' | 'lost';

export interface Level {
    level: number;
    word: string;
    consonants: string[];
    matraPattern: string[];
    hint: string;
    hintUsed?: boolean;
}
