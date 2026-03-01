import { useEffect, useRef } from 'react';
import type { TileState } from '../types/game';

interface GameGridProps {
    guesses: string[][];
    evaluations: TileState[][];
    currentGuess: string[];
    matraPattern: string[];
    targetLength: number;
    maxAttempts: number;
    shakeRow: boolean;
    revealingRow: number | null;
    onShakeEnd: () => void;
    onRevealEnd: () => void;
}

function getMatra(matraPattern: string[], index: number): string {
    if (index < matraPattern.length) {
        return matraPattern[index];
    }
    return '';
}

function getTileColorClasses(state: TileState): string {
    switch (state) {
        case 'correct':
            return 'border-correct bg-correct text-white';
        case 'present':
            return 'border-present bg-present text-white';
        case 'absent':
            return 'border-absent bg-absent text-white';
    }
}

export function GameGrid({
    guesses,
    evaluations,
    currentGuess,
    matraPattern,
    targetLength,
    maxAttempts,
    shakeRow,
    revealingRow,
    onShakeEnd,
    onRevealEnd,
}: GameGridProps) {
    const shakeTimerRef = useRef<number | null>(null);

    useEffect(() => {
        if (shakeRow) {
            shakeTimerRef.current = window.setTimeout(() => {
                onShakeEnd();
            }, 500);
        }
        return () => {
            if (shakeTimerRef.current) clearTimeout(shakeTimerRef.current);
        };
    }, [shakeRow, onShakeEnd]);

    // Build rows
    const rows: React.ReactNode[] = [];

    for (let rowIdx = 0; rowIdx < maxAttempts; rowIdx++) {
        const isCurrentRow = rowIdx === guesses.length;
        const isGuessedRow = rowIdx < guesses.length;
        const isShaking = shakeRow && isCurrentRow;
        const isRevealing = revealingRow === rowIdx;

        const tiles: React.ReactNode[] = [];

        for (let colIdx = 0; colIdx < targetLength; colIdx++) {
            const matra = getMatra(matraPattern, colIdx);
            let letter = '';
            let tileClasses = 'border-2 border-slate-300';
            let animClass = '';

            if (isGuessedRow) {
                // Completed guess row
                letter = guesses[rowIdx]?.[colIdx] || '';
                const evaluation = evaluations[rowIdx]?.[colIdx];
                if (evaluation) {
                    tileClasses = `border-2 ${getTileColorClasses(evaluation)}`;
                }
                if (isRevealing) {
                    animClass = 'animate-flip';
                }
            } else if (isCurrentRow) {
                // Current input row
                letter = currentGuess[colIdx] || '';
                if (letter) {
                    tileClasses = 'border-2 border-slate-500';
                    animClass = 'animate-pop';
                }
            }

            const displayText = letter ? (letter + matra) : (matra || '');

            tiles.push(
                <div
                    key={colIdx}
                    className={`flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 text-2xl font-bold rounded-lg transition-colors ${tileClasses} ${animClass}`}
                    style={isRevealing ? { animationDelay: `${colIdx * 150}ms` } : undefined}
                    onAnimationEnd={
                        isRevealing && colIdx === targetLength - 1
                            ? onRevealEnd
                            : undefined
                    }
                >
                    {displayText}
                </div>
            );
        }

        rows.push(
            <div
                key={rowIdx}
                className={`flex justify-center gap-2 ${isShaking ? 'animate-shake' : ''}`}
            >
                {tiles}
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-2 mb-4">
            {rows}
        </div>
    );
}
