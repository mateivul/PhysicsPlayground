export default function InfoPanel() {
    return (
        <div style={{ padding: "8px 12px", borderTop: "1px solid var(--border)", fontSize: 11 }}>
            <div id="info-stats" style={{ color: "#555", fontFamily: "'JetBrains Mono' , monospace" }}>
                0 balls . - fps
            </div>
            <div
                id="info-selected"
                style={{ marginTop: 6, color: "$555", fontFamily: "'JetBrains Mono' , monospace", lineHeight: 1.7 }}
            ></div>
        </div>
    );
}
// just live ball counter
