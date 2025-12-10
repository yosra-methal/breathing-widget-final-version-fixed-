import { useState, useEffect, useRef, useLayoutEffect } from 'react'
import { MODES } from './constants'
import SelectionView from './components/SelectionView'
import ExerciseView from './components/ExerciseView'
import './App_Ultimate.css'; // Final Ultimate Fix

function App() {
    const [currentModeId, setCurrentModeId] = useState('grounding');
    const [view, setView] = useState('SELECTION'); // 'SELECTION' | 'EXERCISE'
    // Duration in seconds. For 'sleep', it might be ignored if we track cycles, 
    // but User said "Default duration = 4 complete cycles". 
    // We can track time OR cycles. Let's store selectedDuration for time-based modes.
    const [selectedDuration, setSelectedDuration] = useState(MODES.grounding.defaultDuration);
    const [cycleCount, setCycleCount] = useState(4); // Only for 'sleep'

    const containerRef = useRef(null);
    const contentRef = useRef(null);

    const currentMode = MODES[currentModeId];

    // Reset duration when mode changes if it hasn't been manually set? 
    // User spec: "Default duration (if not modified by the user)".
    // So when mode changes, we should probably reset to that mode's default.
    useEffect(() => {
        if (currentMode.defaultDuration) {
            setSelectedDuration(currentMode.defaultDuration);
        } else if (currentMode.id === 'sleep') {
            // Sleep uses cycles by default
            setCycleCount(currentMode.defaultCycles);
        }
    }, [currentModeId]);

    // PRECISE SCALING LOGIC (CSS TRANSFORM)
    useLayoutEffect(() => {
        const handleResize = () => {
            if (!containerRef.current || !contentRef.current) return;

            const availableWidth = containerRef.current.clientWidth;
            const availableHeight = containerRef.current.clientHeight;

            const TARGET_WIDTH = 400; // Constant W
            // Optional: Handle height scaling too if needed, but width is primary concern
            // const TARGET_HEIGHT = 600; // approximate?

            // Logic: Min(1, Available / Target)
            // We scale based on WIDTH primarily to prevent cropping.
            const scale = Math.min(1, availableWidth / TARGET_WIDTH);

            // Apply Transform
            contentRef.current.style.transform = `scale(${scale})`;
            // No layout shift, pure visual scale
        };

        // ResizeObserver for more robust detection than window.resize
        const observer = new ResizeObserver(handleResize);
        if (containerRef.current) {
            observer.observe(containerRef.current);
        }

        handleResize(); // Initial

        return () => observer.disconnect();
    }, []);

    const handleStart = () => {
        setView('EXERCISE');
    };

    const handleStop = () => {
        setView('SELECTION');
    };

    return (
        <div className="scaler-container" ref={containerRef} style={{ background: 'var(--color-bg)' }}>
            <div className="app-container" ref={contentRef}>
                {view === 'SELECTION' ? (
                    <SelectionView
                        currentModeId={currentModeId}
                        setMode={setCurrentModeId}
                        duration={selectedDuration}
                        setDuration={setSelectedDuration}
                        // Cycle props for sleep mode could be added here if we want a selector for it?
                        // User only mentioned specific duration selector 1,2,3,5,10m.
                        onStart={handleStart}
                    />
                ) : (
                    <ExerciseView
                        mode={currentMode}
                        duration={selectedDuration}
                        cycleLimit={currentMode.id === 'sleep' ? cycleCount : null}
                        onStop={handleStop}
                    />
                )}
            </div>
        </div>
    )
}

export default App

