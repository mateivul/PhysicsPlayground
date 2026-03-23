//right side controls for physics parameters and other actions
function Slider({ label, value, min, max, step, unit = "", onChange }) {
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            <span style={{ color: "#888" }}>
                {label}
                <span style={{ fontFamily: "'JetBrains Mono', monospace", color: "#ccc" }}>
                    ({value}
                    {unit})
                </span>
            </span>
            <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={value}
                onChange={(e) => onChange(parseFloat(e.target.value))}
            />
        </div>
    );
}

export default function Controls({
    params,
    onParam,
    ballSize,
    onSize,
    showTrails,
    onToggleTrails,
    showGrid,
    onToggleGrid,
    running,
    onTogglePause,
    onClearBalls,
    onClearObstacles,
    onClearAll,
}) {
    const btn = (label, onClick, dim) => (
        <button
            onClick={onClick}
            style={{
                background: "none",
                border: "none",
                color: dim ? "#444" : "#888",
                padding: "2px 0",
                textAlign: "left",
                width: "100%",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#ccc")}
            onMouseLeave={(e) => (e.currentTarget.style.color = dim ? "#444" : "#888")}
        >
            {label}
        </button>
    );

    return (
        <div
            style={{
                padding: "10px 12px",
                display: "flex",
                flexDirection: "column",
                overflowY: "auto",
                flex: 1,
                gap: 0,
            }}
        >
            <Slider
                label="gravity"
                value={params.gravity}
                min={0}
                max={2}
                step={0.01}
                onChange={(v) => onParam("gravity", v)}
            />
            <div style={{ height: 6 }} />
            <Slider
                label="friction"
                value={params.friction}
                min={0.95}
                max={1}
                step={0.001}
                onChange={(v) => onParam("friction", v)}
            />
            <div style={{ height: 14 }} />
            <Slider
                label="wall bounce"
                value={params.restitution}
                min={0}
                max={1}
                step={0.05}
                onChange={(v) => onParam("restitution", v)}
            />
            <div style={{ height: 6 }} />
            <Slider
                label="ball bounce"
                value={params.ballRestitution}
                min={0}
                max={1}
                step={0.05}
                onChange={(v) => onParam("ballRestitution", v)}
            />
            <div style={{ height: 14 }} />
            <Slider label="ball size" value={ballSize} min={8} max={40} step={1} unit="px" onChange={onSize} />
            <div style={{ height: 12 }} />

            <button
                onClick={onTogglePause}
                style={{
                    background: "none",
                    border: "1px solid var(--border)",
                    borderRadius: 3,
                    color: running ? "#888" : "#ccc",
                    padding: "5px 8px",
                    width: "100%",
                    textAlign: "left",
                    marginBottom: 10,
                }}
            >
                {running ? "❚❚ pause" : "▶ play"}
            </button>

            {btn(`${showTrails ? "[x]" : "[]"} trails`, onToggleTrails)}
            {btn(`${showGrid ? "[x]" : "[]"} grid`, onToggleGrid)}

            <div style={{ height: 12 }} />

            {btn("clear balls", onClearBalls, true)}
            {btn("clear obstacles", onClearObstacles, true)}
            {btn("clear all", onClearAll, true)}
        </div>
    );
}
