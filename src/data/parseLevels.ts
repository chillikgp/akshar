import type { Level } from '../types/game';

/**
 * Fetches and parses levels.csv from the public directory.
 * Returns structured Level objects with dynamically derived count.
 */
export async function parseLevels(): Promise<Level[]> {
    const response = await fetch('/levels.csv');
    const text = await response.text();

    const lines = text.trim().split('\n');
    // Skip header row
    const dataLines = lines.slice(1);

    const levels: Level[] = [];

    for (const line of dataLines) {
        const trimmed = line.trim();
        if (!trimmed) continue;

        // CSV format: level,word,consonants,matras
        const parts = trimmed.split(',');
        if (parts.length < 4) continue;

        const levelNum = parseInt(parts[0], 10);
        const word = parts[1];
        const consonants = parts[2].split('|');
        const matras = parts[3].split('|');
        const hint = parts[4] ? parts[4].trim() : '';

        levels.push({
            level: levelNum,
            word,
            consonants,
            matraPattern: matras,
            hint,
        });
    }

    return levels;
}
