interface HintModalProps {
    isOpen: boolean;
    hint: string;
    onClose: () => void;
}

export function HintModal({ isOpen, hint, onClose }: HintModalProps) {
    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-[2px] p-4 animate-fade-in"
            onClick={onClose}
        >
            <div
                className="relative w-full max-w-xs bg-white rounded-xl shadow-xl overflow-hidden animate-slide-up"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                >
                    <span className="material-symbols-outlined text-xl">close</span>
                </button>

                <div className="p-6 flex flex-col items-center text-center">
                    {/* Icon */}
                    <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center mb-4">
                        <span className="material-symbols-outlined text-amber-500 text-2xl font-bold">
                            lightbulb
                        </span>
                    </div>

                    {/* Title */}
                    <h2 className="text-xl font-bold text-slate-900 mb-2">संकेत</h2>

                    {/* Hint Text */}
                    <p className="text-slate-600 leading-relaxed">
                        {hint || "इस स्तर के लिए कोई संकेत उपलब्ध नहीं है।"}
                    </p>
                </div>
            </div>
        </div>
    );
}
