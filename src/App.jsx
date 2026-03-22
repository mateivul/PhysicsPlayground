import { useState, useRef, useEffect } from "react";

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

    const [showGrid, setShowGrid] = useState(false);
    const showGridRef = useRef(false);

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
                <div style={{ width: 44, background: "var(--bg--panel", borderRight: "1px solid var(--border)" }}>
                    {/* {toolbar} */}
                </div>
                <div style={{ flex: 1, background: "#111" }}>{/* {canvas} */}</div>
                <div
                    style={{
                        width: 175,
                        display: "flex",
                        flexDirection: "column",
                        background: "var(--bg--panel)",
                        borderLeft: "1px solid var(--border)",
                    }}
                >
                    {/* {controls} */}
                    {/* {info panel} */}
                </div>
            </div>
        </div>
    );
}
