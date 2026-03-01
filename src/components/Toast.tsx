import { useEffect, useRef, useState } from 'react';

interface ToastProps {
    message: string | null;
    onDismiss: () => void;
}

export function Toast({ message, onDismiss }: ToastProps) {
    const [isExiting, setIsExiting] = useState(false);
    const timerRef = useRef<number | null>(null);

    useEffect(() => {
        if (message) {
            setIsExiting(false);

            // Auto-dismiss after 1.5 seconds
            timerRef.current = window.setTimeout(() => {
                setIsExiting(true);
                // Wait for exit animation before clearing
                window.setTimeout(onDismiss, 300);
            }, 1500);
        }

        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, [message, onDismiss]);

    if (!message) return null;

    return (
        <div className="absolute top-1/3 left-1/2 z-30 w-full px-8 pointer-events-none" style={{ transform: 'translateX(-50%)' }}>
            <div
                className={`flex items-center justify-center gap-4 rounded-lg bg-slate-900/90 text-white py-3 px-5 shadow-xl backdrop-blur-sm ${isExiting ? 'animate-toast-out' : 'animate-toast-in'
                    }`}
                style={{ transform: 'none' }}
            >
                <p className="text-sm font-semibold">{message}</p>
            </div>
        </div>
    );
}
