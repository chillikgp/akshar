interface HowToPlayModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function HowToPlayModal({ isOpen, onClose }: HowToPlayModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
            <div className="relative w-full max-w-md bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-slide-up">
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 cursor-pointer z-10"
                >
                    <span className="material-symbols-outlined text-2xl">close</span>
                </button>

                {/* Content */}
                <div className="overflow-y-auto p-6 pt-10">
                    <h2 className="text-3xl font-bold text-center mb-6 text-slate-900">
                        कैसे खेलें
                    </h2>

                    <div className="space-y-4 text-center">
                        <p className="text-slate-600 text-lg leading-relaxed">
                            6 प्रयासों में सही शब्द के व्यंजनों का अनुमान लगाएं।
                        </p>
                        <p className="text-slate-500 text-sm">
                            प्रत्येक अनुमान के बाद, टाइल्स का रंग बदल जाएगा यह दिखाने के लिए कि
                            आपका अनुमान शब्द के कितना करीब था।
                        </p>
                    </div>

                    <div className="h-px bg-slate-100 my-8" />

                    {/* Examples */}
                    <div className="space-y-8">
                        <h3 className="text-lg font-bold text-slate-900">उदाहरण</h3>

                        {/* Green example */}
                        <div className="space-y-3">
                            <div className="flex gap-2">
                                <div className="w-12 h-12 bg-correct text-white border-2 border-correct flex items-center justify-center text-xl font-bold rounded">
                                    न
                                </div>
                                <div className="w-12 h-12 bg-white border-2 border-slate-300 flex items-center justify-center text-xl font-bold rounded">
                                    म
                                </div>
                                <div className="w-12 h-12 bg-white border-2 border-slate-300 flex items-center justify-center text-xl font-bold rounded">
                                    क
                                </div>
                            </div>
                            <p className="text-slate-600 text-sm">
                                अक्षर <span className="font-bold">न</span> शब्द में है और सही
                                स्थान पर है।
                            </p>
                        </div>

                        {/* Yellow example */}
                        <div className="space-y-3">
                            <div className="flex gap-2">
                                <div className="w-12 h-12 bg-white border-2 border-slate-300 flex items-center justify-center text-xl font-bold rounded">
                                    क
                                </div>
                                <div className="w-12 h-12 bg-present text-white border-2 border-present flex items-center justify-center text-xl font-bold rounded">
                                    ल
                                </div>
                                <div className="w-12 h-12 bg-white border-2 border-slate-300 flex items-center justify-center text-xl font-bold rounded">
                                    म
                                </div>
                            </div>
                            <p className="text-slate-600 text-sm">
                                अक्षर <span className="font-bold">ल</span> शब्द में है लेकिन
                                गलत स्थान पर है।
                            </p>
                        </div>

                        {/* Grey example */}
                        <div className="space-y-3">
                            <div className="flex gap-2">
                                <div className="w-12 h-12 bg-white border-2 border-slate-300 flex items-center justify-center text-xl font-bold rounded">
                                    श
                                </div>
                                <div className="w-12 h-12 bg-white border-2 border-slate-300 flex items-center justify-center text-xl font-bold rounded">
                                    ह
                                </div>
                                <div className="w-12 h-12 bg-absent text-white border-2 border-absent flex items-center justify-center text-xl font-bold rounded">
                                    र
                                </div>
                            </div>
                            <p className="text-slate-600 text-sm">
                                अक्षर <span className="font-bold">र</span> शब्द में कहीं भी
                                नहीं है।
                            </p>
                        </div>
                    </div>

                    <div className="mt-10 mb-2">
                        <button
                            onClick={onClose}
                            className="w-full py-4 bg-primary text-white font-bold rounded-lg text-lg hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20 cursor-pointer"
                        >
                            खेल शुरू करें
                        </button>
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
