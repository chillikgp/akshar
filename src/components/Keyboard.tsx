import type { KeyState } from '../types/game';

interface KeyboardProps {
    keyboardState: Record<string, KeyState>;
    onKeyPress: (key: string) => void;
    onEnter: () => void;
    onBackspace: () => void;
}

// Hindi consonant keyboard layout (4 rows for mobile compatibility)
const KEYBOARD_ROWS: string[][] = [
    ['क', 'ख', 'ग', 'घ', 'ङ', 'च', 'छ', 'ज', 'झ', 'ञ'],
    ['ट', 'ठ', 'ड', 'ढ', 'ण', 'त', 'थ', 'द', 'ध', 'न'],
    ['प', 'फ', 'ब', 'भ', 'म', 'य', 'र', 'ल', 'व'],
    ['श', 'ष', 'स', 'ह'],
];

function getKeyColorClasses(state: KeyState): string {
    switch (state) {
        case 'correct':
            return 'bg-correct text-white border-correct';
        case 'present':
            return 'bg-present text-white border-present';
        case 'absent':
            return 'bg-absent text-white border-absent';
        case 'unused':
        default:
            return 'bg-slate-200 text-slate-800';
    }
}

export function Keyboard({
    keyboardState,
    onKeyPress,
    onEnter,
    onBackspace,
}: KeyboardProps) {
    return (
        <footer className="p-2 bg-white border-t border-slate-200 pb-6">
            <div className="flex flex-col gap-1.5 max-w-full items-center">
                {/* Row 1 */}
                <div className="flex justify-center gap-1 w-full max-w-full">
                    {KEYBOARD_ROWS[0].map((key) => (
                        <button
                            key={key}
                            onClick={() => onKeyPress(key)}
                            className={`flex flex-1 min-w-0 h-12 items-center justify-center rounded-lg font-bold text-[18px] active:scale-95 transition-all cursor-pointer ${getKeyColorClasses(
                                keyboardState[key] || 'unused'
                            )}`}
                        >
                            {key}
                        </button>
                    ))}
                </div>

                {/* Row 2 */}
                <div className="flex justify-center gap-1 w-full max-w-full">
                    {KEYBOARD_ROWS[1].map((key) => (
                        <button
                            key={key}
                            onClick={() => onKeyPress(key)}
                            className={`flex flex-1 min-w-0 h-12 items-center justify-center rounded-lg font-bold text-[18px] active:scale-95 transition-all cursor-pointer ${getKeyColorClasses(
                                keyboardState[key] || 'unused'
                            )}`}
                        >
                            {key}
                        </button>
                    ))}
                </div>

                {/* Row 3 */}
                <div className="flex justify-center gap-1 w-full max-w-[90%]">
                    {KEYBOARD_ROWS[2].map((key) => (
                        <button
                            key={key}
                            onClick={() => onKeyPress(key)}
                            className={`flex flex-1 min-w-0 h-12 items-center justify-center rounded-lg font-bold text-[18px] active:scale-95 transition-all cursor-pointer ${getKeyColorClasses(
                                keyboardState[key] || 'unused'
                            )}`}
                        >
                            {key}
                        </button>
                    ))}
                </div>

                {/* Row 4 with Enter + Backspace */}
                <div className="flex justify-center gap-1 w-full max-w-full">
                    <button
                        onClick={onEnter}
                        className="flex-[1.5] h-12 items-center justify-center rounded-lg bg-slate-300 font-bold text-slate-800 active:bg-primary active:text-white active:scale-95 transition-all text-sm cursor-pointer"
                    >
                        दर्ज करें
                    </button>

                    {KEYBOARD_ROWS[3].map((key) => (
                        <button
                            key={key}
                            onClick={() => onKeyPress(key)}
                            className={`flex flex-1 min-w-0 h-12 items-center justify-center rounded-lg font-bold text-[18px] active:scale-95 transition-all cursor-pointer ${getKeyColorClasses(
                                keyboardState[key] || 'unused'
                            )}`}
                        >
                            {key}
                        </button>
                    ))}

                    <button
                        onClick={onBackspace}
                        className="flex-1 h-12 flex items-center justify-center rounded-lg bg-slate-300 font-bold text-slate-800 active:bg-primary active:text-white active:scale-95 transition-all cursor-pointer"
                    >
                        <span className="material-symbols-outlined text-xl">backspace</span>
                    </button>
                </div>
            </div>
        </footer>
    );
}
