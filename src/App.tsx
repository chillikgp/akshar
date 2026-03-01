import { useEffect, useCallback, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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

export default function App() {
    const { levelNumber } = useParams<{ levelNumber: string }>();
    const navigate = useNavigate();

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

    // 1. Initialize game data (CSV load)
    useEffect(() => {
        if (!initializedRef.current) {
            initializedRef.current = true;
            const urlLevel = levelNumber ? parseInt(levelNumber, 10) : undefined;
            initGame(urlLevel);
        }
    }, [initGame, levelNumber]);

    // 2. Sync URL when status or level changes internally (e.g. init finish)
    useEffect(() => {
        if (initialized && levels.length > 0) {
            const expectedPath = `/level/${currentLevel}`;
            const currentPath = levelNumber ? `/level/${levelNumber}` : '/';

            if (currentPath !== expectedPath) {
                navigate(expectedPath, { replace: true });
            }
        }
    }, [initialized, currentLevel, levelNumber, levels.length, navigate]);

    // 3. SINGLE SOURCE OF TRUTH: Handle URL changes and trigger loadLevel
    useEffect(() => {
        // Only load if initialized AND levels are actually loaded in the store
        if (initialized && levels.length > 0 && levelNumber) {
            const urlLevel = parseInt(levelNumber, 10);

            // Strictly the ONLY place loadLevel is called based on Route Param
            if (!isNaN(urlLevel) && urlLevel !== currentLevel) {
                if (urlLevel >= 1 && urlLevel <= levels.length) {
                    loadLevel(urlLevel);
                } else {
                    // Invalid level → redirect to level 1 (Effect will re-run)
                    navigate('/level/1', { replace: true });
                }
            }
        }
    }, [initialized, levelNumber, currentLevel, levels.length, loadLevel, navigate]);

    // Show how-to-play on first visit
    useEffect(() => {
        if (initialized) {
            const hasVisited = localStorage.getItem(FIRST_VISIT_KEY);
            if (!hasVisited) {
                setShowHowToPlay(true);
                localStorage.setItem(FIRST_VISIT_KEY, 'true');
            }
        }
    }, [initialized]);

    // Confetti trigger
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

    // Show modal when game ends
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

        try {
            const nextNum = nextLevel();
            if (nextNum !== null) {
                // UI Protection: Close modal and set local navigating flag
                isNavigatingRef.current = true;
                setShowModal(false);
                closeHint();

                // Pure Navigation Flow:
                // 1. We navigate the browser
                // 2. The levelNumber param change triggers useEffect #3
                // 3. useEffect #3 calls loadLevel()
                setTimeout(() => {
                    navigate(`/level/${nextNum}`, { replace: true });
                    isNavigatingRef.current = false;
                }, 50);
            }
        } catch (e) {
            console.error("Next level navigation failed:", e);
            isNavigatingRef.current = false;
        }
    }, [nextLevel, navigate, closeHint]);

    const handleRestart = useCallback(() => {
        setShowModal(false);
        closeHint();
        restartLevel();
    }, [restartLevel, closeHint]);

    const handleClearToast = useCallback(() => {
        clearToast();
    }, [clearToast]);

    const handleShakeEnd = useCallback(() => {
        clearShake();
    }, [clearShake]);

    const handleRevealEnd = useCallback(() => {
        clearReveal();
    }, [clearReveal]);

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

    // 1. Initial Data Fetching Guard
    if (!initialized || levels.length === 0) {
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

    // 2. Invalid Level State Guard (Auto-correction)
    if (!currentLevelData) {
        navigate("/level/1", { replace: true });
        return null;
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
                    targetWord={currentLevelData.word}
                    guessCount={guesses.length}
                    maxAttempts={maxAttempts}
                    onNextLevel={handleNextLevel}
                    onRestart={handleRestart}
                    onClose={() => setShowModal(false)}
                />
            )}

            <HintModal
                isOpen={isHintOpen}
                hint={currentLevelData.hint}
                onClose={closeHint}
            />

            <HowToPlayModal
                isOpen={showHowToPlay}
                onClose={() => setShowHowToPlay(false)}
            />
        </div>
    );
}
