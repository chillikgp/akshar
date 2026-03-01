import { useEffect, useCallback, useRef, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { useGameStore } from './store/useGameStore';
import { Header } from './components/Header';
import { GameGrid } from './components/GameGrid';
import { Keyboard } from './components/Keyboard';
import { Toast } from './components/Toast';
import { GameModal } from './components/GameModal';
import { HintModal } from './components/HintModal';
import { HowToPlayModal } from './components/HowToPlayModal';

const FIRST_VISIT_KEY = 'akshar_firstVisit';
const STORAGE_KEYS = { currentLevel: 'akshar_currentLevel' };

export default function App() {
    const { levelNumber } = useParams<{ levelNumber: string }>();
    const navigate = useNavigate();
    const location = useLocation();

    const [showHowToPlay, setShowHowToPlay] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const prevStatusRef = useRef<string>('playing');
    const initializedRef = useRef(false);
    const isNavigatingRef = useRef(false);

    const {
        initialized,
        currentLevel,
        levels,
        targetConsonants,
        matraPattern,
        maxAttempts,
        guesses,
        evaluations,
        currentGuess,
        status,
        keyboardState,
        toastMessage,
        shakeRow,
        revealingRow,
        isHintOpen,
        initGame,
        loadLevel,
        addLetter,
        removeLetter,
        submitGuess,
        nextLevel,
        restartLevel,
        openHint,
        closeHint,
        clearToast,
        clearShake,
        clearReveal,
    } = useGameStore();

    // 1. Core Initialization: Fetch levels and status
    useEffect(() => {
        if (!initializedRef.current) {
            initializedRef.current = true;
            initGame();
        }
    }, [initGame]);

    // 2. Routing Logic: Determine target level when at root "/" or when levels load
    useEffect(() => {
        if (initialized && levels.length > 0 && location.pathname === '/') {
            // Priority: LocalStorage > Fallback level 1
            const savedRaw = localStorage.getItem(STORAGE_KEYS.currentLevel);
            let targetLevel = 1;
            if (savedRaw) {
                const parsed = parseInt(JSON.parse(savedRaw), 10);
                if (!isNaN(parsed) && parsed >= 1 && parsed <= levels.length) {
                    targetLevel = parsed;
                }
            }
            navigate(`/level/${targetLevel}`, { replace: true });
        }
    }, [initialized, levels, location.pathname, navigate]);

    // 3. SINGLE SOURCE OF TRUTH: URL Observer
    useEffect(() => {
        if (initialized && levels.length > 0 && levelNumber) {
            const urlLevel = parseInt(levelNumber, 10);

            // Sync Store with URL if different OR if level data is not yet loaded
            const dataMissing = targetConsonants.length === 0;
            if (!isNaN(urlLevel) && (urlLevel !== currentLevel || dataMissing)) {
                if (urlLevel >= 1 && urlLevel <= levels.length) {
                    loadLevel(urlLevel);
                } else {
                    // Invalid URL → Auto-correct to level 1
                    navigate('/level/1', { replace: true });
                }
            } // Sync Store with URL if different
            if (urlLevel !== currentLevel) {
                loadLevel(urlLevel);
            }
        }
    }, [initialized, levels, levelNumber, currentLevel, loadLevel, navigate, targetConsonants.length]);

    // First visit help
    useEffect(() => {
        if (initialized) {
            const hasVisited = localStorage.getItem(FIRST_VISIT_KEY);
            if (!hasVisited) {
                setShowHowToPlay(true);
                localStorage.setItem(FIRST_VISIT_KEY, 'true');
            }
        }
    }, [initialized]);

    // Confetti
    useEffect(() => {
        if (prevStatusRef.current === 'playing' && status === 'won') {
            const timer = setTimeout(() => {
                confetti({
                    particleCount: 150,
                    spread: 80,
                    origin: { y: 0.6 },
                    colors: ['#197fe6', '#6aaa64', '#c9b458', '#f59e0b', '#ef4444'],
                });
            }, 800);
            return () => clearTimeout(timer);
        }
        prevStatusRef.current = status;
    }, [status]);

    // Game End Modal
    useEffect(() => {
        if (status === 'won' || status === 'lost') {
            const delay = status === 'won' ? 1500 : 500;
            const timer = setTimeout(() => {
                setShowModal(true);
            }, delay);
            return () => clearTimeout(timer);
        } else {
            setShowModal(false);
        }
    }, [status]);

    const handleKeyPress = useCallback((key: string) => {
        addLetter(key);
    }, [addLetter]);

    const handleEnter = useCallback(() => {
        submitGuess();
    }, [submitGuess]);

    const handleBackspace = useCallback(() => {
        removeLetter();
    }, [removeLetter]);

    const handleNextLevel = useCallback(() => {
        if (isNavigatingRef.current) return;

        const nextNum = nextLevel();
        if (nextNum !== null) {
            isNavigatingRef.current = true;
            setShowModal(false);
            closeHint();

            // Navigate only. Effect #3 will handle the load.
            setTimeout(() => {
                navigate(`/level/${nextNum}`, { replace: true });
                isNavigatingRef.current = false;
            }, 50);
        }
    }, [nextLevel, navigate, closeHint]);

    const handleRestart = useCallback(() => {
        setShowModal(false);
        closeHint();
        restartLevel();
    }, [restartLevel, closeHint]);

    const handleClearToast = useCallback(() => clearToast(), [clearToast]);
    const handleShakeEnd = useCallback(() => clearShake(), [clearShake]);
    const handleRevealEnd = useCallback(() => clearReveal(), [clearReveal]);

    const handleHelpClick = useCallback(() => {
        closeHint();
        setShowHowToPlay(true);
    }, [closeHint]);

    const handleHintClick = useCallback(() => {
        if (status === 'playing') {
            setShowHowToPlay(false);
            openHint();
        }
    }, [status, openHint]);

    // --- RENDER GUARDS ---

    // 1. Loading Guard
    if (!initialized || levels.length === 0 || !levelNumber) {
        return (
            <div className="flex h-screen items-center justify-center bg-background-light">
                <div className="text-center">
                    <h1 className="text-4xl font-extrabold text-primary mb-2">अक्षर</h1>
                    <p className="text-slate-500 text-sm animate-pulse">लोड हो रहा है...</p>
                </div>
            </div>
        );
    }

    const currentLevelData = levels.find((l) => l.level === currentLevel);

    // 2. Data Mismatch Guard
    if (!currentLevelData && initialized) {
        return null; // Let the auto-correct effect handle it
    }

    return (
        <div className="relative flex h-[100dvh] w-full flex-col max-w-md mx-auto shadow-2xl bg-white">
            <Header
                currentLevel={currentLevel}
                totalLevels={levels.length}
                onHelpClick={handleHelpClick}
                onHintClick={handleHintClick}
            />

            <main className="flex-1 flex flex-col items-center justify-start py-2 px-4 relative overflow-hidden">
                <Toast message={toastMessage} onDismiss={handleClearToast} />

                <GameGrid
                    guesses={guesses}
                    evaluations={evaluations}
                    currentGuess={currentGuess}
                    matraPattern={matraPattern}
                    targetLength={targetConsonants.length}
                    maxAttempts={maxAttempts}
                    shakeRow={shakeRow}
                    revealingRow={revealingRow}
                    onShakeEnd={handleShakeEnd}
                    onRevealEnd={handleRevealEnd}
                />
            </main>

            <Keyboard
                keyboardState={keyboardState}
                onKeyPress={handleKeyPress}
                onEnter={handleEnter}
                onBackspace={handleBackspace}
            />

            {showModal && (
                <GameModal
                    status={status}
                    currentLevel={currentLevel}
                    totalLevels={levels.length}
                    evaluations={evaluations}
                    targetWord={currentLevelData?.word || ''}
                    guessCount={guesses.length}
                    maxAttempts={maxAttempts}
                    onNextLevel={handleNextLevel}
                    onRestart={handleRestart}
                    onClose={() => setShowModal(false)}
                />
            )}

            <HintModal
                isOpen={isHintOpen}
                hint={currentLevelData?.hint || ''}
                onClose={closeHint}
            />

            <HowToPlayModal
                isOpen={showHowToPlay}
                onClose={() => setShowHowToPlay(false)}
            />
        </div>
    );
}
