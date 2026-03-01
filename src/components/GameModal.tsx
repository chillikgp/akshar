import type { TileState, GameStatus } from '../types/game';
import { formatShare, copyToClipboard } from '../lib/shareFormatter';
import { useState } from 'react';

interface GameModalProps {
    status: GameStatus;
    currentLevel: number;
    totalLevels: number;
    evaluations: TileState[][];
    targetWord: string;
    guessCount: number;
    maxAttempts: number;
    onNextLevel: () => void;
    onRestart: () => void;
    onClose: () => void;
}

const EVAL_COLORS: Record<TileState, string> = {
    correct: 'bg-correct',
    present: 'bg-present',
    absent: 'bg-slate-300',
};

export function GameModal({
    status,
    currentLevel,
    totalLevels,
    evaluations,
    targetWord,
    guessCount,
    maxAttempts,
    onNextLevel,
    onRestart,
    onClose,
}: GameModalProps) {
    const [copied, setCopied] = useState(false);

    if (status === 'playing') return null;

    const isWin = status === 'won';
    const isLastLevel = currentLevel >= totalLevels;

    const handleShare = async () => {
        const text = formatShare(currentLevel, evaluations, isWin, maxAttempts);
        const success = await copyToClipboard(text);
        if (success) {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
            <div className="relative w-full max-w-md bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col animate-slide-up">
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 cursor-pointer z-10"
                >
                    <span className="material-symbols-outlined text-2xl">close</span>
                </button>

                <div className="p-8 flex flex-col items-center">
                    {/* Icon */}
                    <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 ${isWin ? 'bg-primary/10' : 'bg-red-50'
                        }`}>
                        <span className={`material-symbols-outlined text-5xl font-bold ${isWin ? 'text-primary' : 'text-red-500'
                            }`}>
                            {isWin ? 'celebration' : 'sentiment_sad'}
                        </span>
                    </div>

                    {/* Title */}
                    <h1 className="text-3xl font-extrabold leading-tight text-center pb-2 text-slate-900">
                        {isWin ? 'बधाई हो!' : 'अगली बार!'}
                    </h1>

                    <p className="text-slate-500 text-lg font-medium leading-normal pb-6 text-center">
                        {isWin ? 'आपने शब्द ढूंढ लिया' : `सही शब्द था: ${targetWord}`}
                    </p>

                    {/* Score card */}
                    {isWin && (
                        <div className="bg-slate-50 rounded-lg px-8 py-4 mb-6 text-center border border-slate-200">
                            <p className="text-slate-500 text-sm uppercase tracking-wider font-bold mb-1">
                                आपका स्कोर
                            </p>
                            <h2 className="text-primary text-4xl font-black leading-tight">
                                {guessCount}/{maxAttempts}
                            </h2>
                        </div>
                    )}

                    {/* Emoji grid preview */}
                    {evaluations.length > 0 && (
                        <div className="flex flex-col gap-1.5 mb-8 items-center bg-slate-50 p-4 rounded-xl">
                            {evaluations.map((row, rowIdx) => (
                                <div key={rowIdx} className="flex gap-1">
                                    {row.map((state, colIdx) => (
                                        <span
                                            key={colIdx}
                                            className={`w-5 h-5 rounded-sm ${EVAL_COLORS[state]}`}
                                        />
                                    ))}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Action buttons */}
                    <div className="w-full space-y-3">
                        <button
                            onClick={handleShare}
                            className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
                        >
                            <span className="material-symbols-outlined">
                                {copied ? 'check' : 'share'}
                            </span>
                            {copied ? 'कॉपी हो गया!' : 'साझा करें'}
                        </button>

                        {isWin && !isLastLevel && (
                            <button
                                onClick={onNextLevel}
                                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-colors border border-slate-200 cursor-pointer"
                            >
                                अगला स्तर
                                <span className="material-symbols-outlined">arrow_forward</span>
                            </button>
                        )}

                        {isWin && isLastLevel && (
                            <p className="text-center text-slate-500 font-semibold py-4">
                                🎉 सभी स्तर पूरे हो गए!
                            </p>
                        )}

                        {!isWin && (
                            <button
                                onClick={onRestart}
                                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-colors border border-slate-200 cursor-pointer"
                            >
                                <span className="material-symbols-outlined">replay</span>
                                फिर से खेलें
                            </button>
                        )}
                    </div>
                </div>

                {/* Bottom handle */}
                <div className="flex h-5 w-full items-center justify-center pb-2">
                    <div className="h-1.5 w-12 rounded-full bg-slate-200" />
                </div>
            </div>
        </div>
    );
}
