import type { TileState } from '../types/game';

const EMOJI_MAP: Record<TileState, string> = {
    correct: '🟩',
    present: '🟨',
    absent: '⬜',
};

/**
 * Generates a shareable text representation of the game result.
 *
 * Output format:
 * अक्षर स्तर {level} {attempts}/6
 *
 * ⬜⬜🟨⬜
 * 🟨⬜⬜🟨
 * 🟩🟩🟩🟩
 */
export function formatShare(
    level: number,
    evaluations: TileState[][],
    won: boolean,
    maxAttempts: number
): string {
    const attempts = won ? evaluations.length : 'X';
    const header = `अक्षर स्तर ${level} ${attempts}/${maxAttempts}`;

    const grid = evaluations
        .map((row) => row.map((state) => EMOJI_MAP[state]).join(''))
        .join('\n');

    return `${header}\n\n${grid}`;
}

/**
 * Copies text to clipboard and returns success status.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch {
        return false;
    }
}
