import { useState, useRef, useEffect } from "react";
import Toolbar from "./components/Toolbar.jsx";
import Controls from "./components/Controls.jsx";
import InfoPanel from "./components/InfoPanel.jsx";
import Canvas from "./components/Canvas.jsx";

const defaults = {
    gravity: 0.3,
    friction: 0.999,
    restitution: 0.8,
    ballRestitution: 0.9,
};
// physics constants for start

export default function App() {
    const [tool, setTool] = useState("launch");
    const toolRef = useRef("launch");

    const [params, setParams] = useState(defaults);
    const paramsRef = useRef(defaults);

    const [showTrails, setShowTrails] = useState(true);
    const showTrailsRef = useRef(true);

    const [ballSize, setBallSize] = useState(15);
    const ballSizeRef = useRef(15);

    const [showGrid, setShowGrid] = useState(true);
    const showGridRef = useRef(true);

    const [running, setRunning] = useState(true);
    const runningRef = useRef(true);

    const clearBallsRef = useRef(null);
    const clearObstaclesRef = useRef(null);
    const clearAllRef = useRef(null);

    function changeTool(v) {
        setTool(v);
        toolRef.current = v;
    }
    function changeParam(key, val) {
        const next = { ...paramsRef.current, [key]: val };
        paramsRef.current = next;
        setParams(next);
    }
    function changeBallSize(v) {
        const clamped = Math.max(8, Math.min(40, v));
        setBallSize(clamped);
        ballSizeRef.current = clamped;
    }
    function togglePause() {
        runningRef.current = !runningRef.current;
        setRunning(runningRef.current);
    }

    useEffect(() => {
        function onKey(e) {
            if (e.target.tagName === "INPUT") return;
            if (e.code === "Digit1") changeTool("launch");
            if (e.code === "Digit2") changeTool("draw");
            if (e.code === "Digit3") changeTool("erase");
            if (e.code === "Digit4") changeTool("select");
        }
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, []);

    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                height: "100vh",
                background: "var(--bg)",
                color: "var(--text)",
            }}
        >
            <div style={{ padding: "8px", borderBottom: "1px solid var(--border)", color: "#555", fontSize: 11 }}>
                physics playground - [space]=pause [1-4]=tools/actions
            </div>
            <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
                <Toolbar tool={tool} setTool={changeTool} running={running} onTogglePause={togglePause} />

                <div style={{ flex: 1, background: "#111", overflow: "hidden" }}>
                    <Canvas
                        tool={tool}
                        toolRef={toolRef}
                        paramsRef={paramsRef}
                        ballSizeRef={ballSizeRef}
                        showTrailsRef={showTrailsRef}
                        showGridRef={showGridRef}
                        runningRef={runningRef}
                        onTogglePause={togglePause}
                        onSizeScroll={(v) => changeBallSize(ballSizeRef.current + v)}
                        onClearBallsRef={clearBallsRef}
                        onClearObstaclesRef={clearObstaclesRef}
                        onClearAllRef={clearAllRef}
                    />
                </div>
                <div
                    style={{
                        width: 175,
                        display: "flex",
                        flexDirection: "column",
                        background: "var(--bg-panel)",
                        borderLeft: "1px solid var(--border)",
                        overflow: "hidden",
                    }}
                >
                    <Controls
                        params={params}
                        onParam={changeParam}
                        ballSize={ballSize}
                        onSize={changeBallSize}
                        showTrails={showTrails}
                        showGrid={showGrid}
                        running={running}
                        onToggleTrails={() => {
                            showTrailsRef.current = !showTrails;
                            setShowTrails(!showTrails);
                        }}
                        onToggleGrid={() => {
                            showGridRef.current = !showGrid;
                            setShowGrid(!showGrid);
                        }}
                        onTogglePause={togglePause}
                        onClearBalls={() => clearBallsRef.current?.()}
                        onClearObstacles={() => clearObstaclesRef.current?.()}
                        onClearAll={() => clearAllRef.current?.()}
                    />
                    <InfoPanel />
                </div>
            </div>
        </div>
    );
}
