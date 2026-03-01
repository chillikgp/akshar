import type { TileState } from '../types/game';

/**
 * Evaluates a guess against the target consonants.
 * Implements standard Wordle two-pass algorithm with strict duplicate handling.
 *
 * Pass 1: Mark exact position matches as "correct"
 * Pass 2: For remaining letters, mark "present" only if unused target instances remain
 *
 * @param guess  - Array of guessed consonants
 * @param target - Array of target consonants
 * @returns Array of TileState evaluation results
 */
export function evaluateGuess(
    guess: string[],
    target: string[]
): TileState[] {
    const result: TileState[] = new Array(guess.length).fill('absent');

    // Track which target positions have been matched
    const targetUsed: boolean[] = new Array(target.length).fill(false);
    // Track which guess positions have been resolved
    const guessResolved: boolean[] = new Array(guess.length).fill(false);

    // Pass 1: Exact matches
    for (let i = 0; i < guess.length; i++) {
        if (i < target.length && guess[i] === target[i]) {
            result[i] = 'correct';
            targetUsed[i] = true;
            guessResolved[i] = true;
        }
    }

    // Pass 2: Present (right letter, wrong position)
    for (let i = 0; i < guess.length; i++) {
        if (guessResolved[i]) continue;

        for (let j = 0; j < target.length; j++) {
            if (targetUsed[j]) continue;
            if (guess[i] === target[j]) {
                result[i] = 'present';
                targetUsed[j] = true;
                break;
            }
        }
    }

    return result;
}
