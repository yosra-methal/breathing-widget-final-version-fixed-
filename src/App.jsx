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

    const viewportRef = useRef(null);
    const scaleRootRef = useRef(null);
    const contentRef = useRef(null); // Keep ref to measure natural height if needed

    const currentMode = MODES[currentModeId];

    // Reset duration when mode changes
    useEffect(() => {
        if (currentMode.defaultDuration) {
            setSelectedDuration(currentMode.defaultDuration);
        } else if (currentMode.id === 'sleep') {
            setCycleCount(currentMode.defaultCycles);
        }
    }, [currentModeId]);

    // SCALE LOGIC
    useLayoutEffect(() => {
        const handleResize = () => {
            if (!viewportRef.current || !scaleRootRef.current || !contentRef.current) return;

            const viewportRect = viewportRef.current.getBoundingClientRect();
            const availW = viewportRect.width;
            const availH = viewportRect.height;

            const BASE_WIDTH = 400;
            // Measure actual height of the widget content to assume aspect ratio validity
            const BASE_HEIGHT = contentRef.current.offsetHeight;

            // Calculate ratios
            const scaleW = availW / BASE_WIDTH;
            const scaleH = availH / BASE_HEIGHT;

            // Uniform scale to fit
            let scale = Math.min(scaleW, scaleH);

            // Constraint: Clamp
            const MIN_SCALE = 0.5;
            const MAX_SCALE = 2.5;
            scale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, scale));

            // Apply to Scale Root
            scaleRootRef.current.style.transform = `scale(${scale})`;

            // Optional: Adjust Scale Root Width/Height in DOM to prevent whitespace?
            // User requested pure transform. Keep it simple first.
            // If scale < 1, visual is small, DOM is big. Scrollbars might appear if viewport is small.
            // This is desired ("viewport must SCROLL when... awkward").
        };

        const observer = new ResizeObserver(handleResize);
        if (viewportRef.current) observer.observe(viewportRef.current);
        // Also observe content changes to re-calc height ratio
        if (contentRef.current) observer.observe(contentRef.current);

        handleResize();

        return () => observer.disconnect();
    }, [view]);

    const handleStart = () => {
        setView('EXERCISE');
    };

    const handleStop = () => {
        setView('SELECTION');
    };

    return (
        <div className="widget-viewport" ref={viewportRef}>
            <div className="widget-scale-root" ref={scaleRootRef}>
                <div className="widget-root" ref={contentRef}>
                    {view === 'SELECTION' ? (
                        <SelectionView
                            currentModeId={currentModeId}
                            setMode={setCurrentModeId}
                            duration={selectedDuration}
                            setDuration={setSelectedDuration}
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
        </div>
    )
}

export default App;
