// left sidebar tools
const s = (active) => ({
    width: 32,
    height: 32,
    border: "none",
    borderRadius: 4,
    background: active ? "#222" : "transparent",
    color: active ? "#ccc" : "#555",
    fontSize: 16,
    dispaly: "flex",
    alignItems: "center",
    justifyContent: "center",
});

export default function Toolbar({ tool, setTool, running, onTogglePause }) {
    return (
        <div
            style={{
                width: 44,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 2,
                padding: "8px 8px",
                borderRight: "1px solid var(--border)",
                background: "va(--bg-panle",
            }}
        >
            <button style={s(tool === "launch")} title="launch [1]" onClick={() => setTool("launch")}>
                →
            </button>
            <button style={s(tool === "draw")} title="draw [2]" onClick={() => setTool("draw")}>
                /
            </button>
            <button style={s(tool === "erase")} title="erase [3]" onClick={() => setTool("erase")}>
                x
            </button>
            <button style={s(tool === "select")} title="select [4]" onClick={() => setTool("select")}>
                o
            </button>

            <div style={{ flex: 1 }} />

            <button
                title={running ? "pause" : "play"}
                onClick={onTogglePause}
                style={{ ...s(false), color: running ? "#555" : "#aaa", fontSize: 14 }}
            >
                {running ? "❚❚" : "▶"}
            </button>
        </div>
    );
}
