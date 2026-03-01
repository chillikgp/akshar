interface HeaderProps {
    currentLevel: number;
    totalLevels: number;
    onHelpClick: () => void;
    onHintClick: () => void;
}

export function Header({ currentLevel, totalLevels, onHelpClick, onHintClick }: HeaderProps) {
    return (
        <header className="flex items-center justify-between p-4 border-b border-slate-200 bg-white sticky top-0 z-20">
            <div className="flex items-center gap-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary/10 text-primary">
                    स्तर {currentLevel}/{totalLevels}
                </span>
            </div>

            <h1 className="text-2xl font-extrabold leading-tight tracking-tight text-slate-900">
                अक्षर
            </h1>

            <div className="flex gap-1 items-center">
                <button
                    onClick={onHintClick}
                    className="flex size-10 shrink-0 items-center justify-center text-slate-500 hover:text-primary transition-colors cursor-pointer rounded-full hover:bg-slate-100"
                    aria-label="View hint"
                >
                    <span className="material-symbols-outlined">lightbulb</span>
                </button>
                <button
                    onClick={onHelpClick}
                    className="flex size-10 shrink-0 items-center justify-center text-slate-500 hover:text-primary transition-colors cursor-pointer rounded-full hover:bg-slate-100"
                    aria-label="How to play"
                >
                    <span className="material-symbols-outlined">help</span>
                </button>
            </div>
        </header>
    );
}
