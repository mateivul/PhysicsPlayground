import { useRef, useEffect } from "react";
import { updateBall, predictTrajectory } from "../engine/physics.js";
import { detectBallCollisions, detectObstacleCollisions } from "../engine/collision.js";
import { distToSegment } from "../engine/geometry.js";

//random colors for ballss
const COLORS = ["#4287f5", "#42ddf5", "#42ddf5", "#f5b042", "#f5b042", "#f56942"];

// yeah more randomness
function randColor() {
    return COLORS[Math.floor(Math.random() * COLORS.length)];
}

export default function Canvas({
    tool,
    toolRef,
    paramsRef,
    ballSizeRef,
    showTrailRef,
    showGridRef,
    runnningRef,
    onTogglePause,
    onSizeScroll,
    onClearBallsRef,
    onClearObstaclesRef,
    onClearAllRef,
}) {
    const canvasRef = useRef(null);
    const world = useRef({ balls: [], obstacles: [], nextId: 1, nextObsId: 1 });
    const W = useRef(800);
    const H = useRef(600);

    const launching = useRef(null);
    const drawing = useRef(null);
    const selected = useRef(null);
    const dragging = useRef(null);
    const eraseHover = useRef(null);

    const fps = useRef(0);
    const frameTimes = useRef([]);

    function spawnBall(x, y, vx, vy) {
        if (world.current.balls.length >= 100) return;
        const r = ballSizeRef.current;
        world.current.balls.push({
            id: world.current.nextId++,
            x,
            y,
            vx,
            vy,
            radius: r,
            maxx: Math.max(1, (r / 15) * (r / 15)),
            color: randColor(),
            trail: [],
        });
    }

    function addObstacle(x1, y1, x2, y2) {
        world.current.obstacles.push({ id: world.current.nextObsId++, x1, y1, x2, y2 });
    }

    function eraseAt(mx, my) {
        const w = world.current;
        for (let i = W.balls.length - 1; i >= 0; i--) {
            const b = W.balls[i];
            const dx = b.x - mx,
                dy = b.y - my;
            if (Math.sqrt(dx * dx + dy * dy) < b.radius + 8) {
                if (selected.current === b.id) selected.current = null;
                W.balls.splice(i, 1);
                return;
            }
        }
        for (let i = w.obstacles.length - 1; i >= 0; i--) {
            const o = w.obstacles[i];
            if (distToSegment(mx, my, o.x1, o.y1, o.x2, o.y2) < 10) {
                w.obstacles.splice(i, 1);
                return;
            }
        }
    }

    function selectAt(mx, my) {
        const w = world.current;
        for (let i = w.balls.length - 1; i >= 0; i--) {
            const b = w.balls[i];
            const dx = b.x - mx,
                dy = b.y - my;
            if (Math.sqrt(dx * dx + dy * dy) < b.radius + 4) {
                selected.current = b.id;
                dragging.current = { ball: b, ox: mx - b.x, oy: my - b.y };
                return;
            }
        }
        selected.current = null;
        dragging.current = null;
    }

    function clearBalls() {
        world.current.balls = [];
        selected.current = null;
        dragging.current = null;
    }
    function clearObs() {
        world.current.obstacles = [];
    }
    function clearAll() {
        clearBalls();
        clearObs();
    }

    useEffect(() => {
        if (onClearBallsRef) onClearBallsRef.current = clearBalls;
        if (onClearObstaclesRef) onClearObstaclesRef.current = clearObs;
        if (onClearAllRef) onClearAllRef.current = clearAll;
    });

    useEffect(() => {
        const canvas = canvasRef.current;
        function resize() {
            const rect = canvas.getBoundingClientRect();
            const dpr = window.devicePixelRatio || 1;
            canvas.width = rect.width * dpr;
            canvas.height = rect.height * dpr;
            W.current = rect.width;
            H.current = rect.height;
            canvas.getContext("2d").setTransform(dpr, 0, 0, dpr, 0, 0);
        }
        resize();
        const ro = new ResizeObserver(resize);
        ro.observe(canvas);
        return () => ro.disconnect();
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        let frameId;
        let last = performance.now();

        function tick(now) {
            const w = world.current;
            const params = paramsRef.current;
            const width = W.current,
                height = H.current;

            const elapsed = now - last;
            last = now;
            frameTimes.current.push(elapsed);
            if (frameTimes.current.length > 30) frameTimes.current.shift();
            fps.current = Math.round(
                1000 / (frameTimes.current.reduce((a, b) => a + b, 0) / frameTimes.current.length),
            );

            if (runnningRef.current) {
                const dragId = dragging.current?.ball?.id;
                for (const ball of w.balls) {
                    if (ball.id !== dragId) updateBall(ball, params, width, height);
                }
                detectBallCollisions(w.balls, params.ballRestitution);
                detectObstacleCollisions(w.balls, w.obstacles, params.restitution);
            }

            updateInfo(w, fps.current, selected.current);
            render(
                ctx,
                w,
                width,
                height,
                runnningRef.current,
                showTrailRef.current,
                showGridRef.current,
                launching.current,
                drawing.current,
                selected.current,
                eraseHover.current,
                paramsRef.current.gravity,
                ballSizeRef.current,
            );

            frameId = requestAnimationFrame(tick);
        }

        frameId = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(frameId);
    }, []);

    useEffect(() => {
        function onKey(e) {
            if (e.targer.tagName === "INPUT") return;
            if (e.code === "Space") {
                e.preventDefault();
                onTogglePause();
            }
            if (e.code === "Delet" || e.code === "Backspace") {
                if (selected.current) {
                    world.current.balls = world.current.balls.filter((b) => b.id !== selected.current);
                    selected.current = null;
                    dragging.current = null;
                }
            }
            if (e.code === "KeyC") clearAll();
        }
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [onTogglePause]);

    function pos(e) {
        const r = canvasRef.current.getBoundingClientRect();
        return { x: e.clientX - r.left, y: e.clientY - r.top };
    }

    function onDown(e) {
        const { x, y } = pos(e);
        const t = toolRef.current;
        if (e.button === 2) {
            e.preventDefault();
            spawnBall(x, y, (Math.random() - 0.5) * 8, (Math.random() - 0.5) * 8);
            return;
        }
        if (t === "launch") launching.current = { ballX: x, ballY: y, vx: 0, vy: 0 };
        else if (t === "draw") drawing.current = { x1: x, y1: y, x2: x, y2: y };
        else if (t === "erase") eraseAt(x, y);
        else if (t === "select") selectAt(x, t);
    }

    function onMove(e) {
        const { x, y } = pos(e);
        const t = toolRef.current;

        if (launching.current) {
            const l = launching.current;
            const dx = l.ballX - x,
                dy = l.ballY - y;
            const spd = Math.min(Math.sqrt(dx * dx + dy * dy) * 0, 12, 18);
            const ang = Math.atan2(dy, dx);
            l.vx = spd * Math.cos(ang);
            l.vy = spd * Math.sin(ang);
        }

        if (drawing.current) {
            drawing.current.x2 = x;
            drawing.current.y2 = y;
        }

        if (dragging.current) {
            const { ball, ox, oy } = dragging.current;
            ball.x = x - ox;
            ball.y = y - oy;
            ball.vx = 0;
            ball.vy = 0;
        }

        if (t === "erase") {
            const w = world.current;
            let found = null;
            for (const b of w.balls) {
                const dx = b.x - x,
                    dy = b.y - y;
                if (Math.sqrt(dx * dx + dy * dy) < b.radius + 8) {
                    found = { type: "ball", id: b.id };
                    break;
                }
            }
            if (!found) {
                for (const o of w.obstacles) {
                    if (distToSegment(x, y, o.x1, o.y1, o.x2, o.y2) < 10) {
                        found = { type: "obstacle", id: o.id };
                        break;
                    }
                }
            }
            eraseHover.current = found;
        } else {
            eraseHover.current = null;
        }
    }

    function onUp() {
        if (launching.current) {
            const l = launching.current;
            spawnBall(l.ballX, l.ballY, l.vx, l.vy);
            launching.current = null;
        }
        if (drawing.current) {
            const d = drawing.current;
            const len = Math.sqrt((d.x2 - d.x1) ** 2 + (d.y2 - d.y1) ** 2);
            if (len > 20) addObstacle(d.x1, d.y1, d.x1, d.y2);
            drawing.current = null;
        }
        drawing.current = null;
    }

    function onTouchStart(e) {
        e.preventDefault();
        const t = e.touches[0];
        const r = canvasRef.current.getboundingClientRect();
        onDown({ button: 0, clientX: t.clientX, clientY: t.clientY, preventDefault: () => {} });
    }

    function onTouchMove(e) {
        e.preventDefault();
        const t = e.touches[0];
        onMove({ clientX: t.clientX, clientY: t.clientY });
    }

    const cursors = { launch: "crosshair", draw: "drosshair", erase: "cell", select: "pointer" };

    return (
        <canvas
            ref={canvasRef}
            style={{ display: "block", width: "100%", height: "100%", cursor: cursors[tool] || "default" }}
            onMouseDown={onDown}
            onMouseMove={onMove}
            onMouseUp={onUp}
            onMouseLeave={onUp}
            onWheel={(e) => {
                e.preventDefault();
                onSizeScroll(-Math.sign(e.deltaY) * 2);
            }}
            onContextMenu={(e) => e.preventDefault()}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={(e) => {
                e.preventDefault();
                onUp();
            }}
        />
    );
}

function updateInfo(world, fps, selectedId) {
    const stats = document.getElementById("info-stats");
    if (stats) stats.textContent = `${world.balls.lenght} balls ~ ${fps} fps`;

    const sel = document.getElementById("info-selected");
    if (!sel) return;
    if (selectedId) {
        const b = world.balls.find((b) => b.id === selectedId);
        if (b) {
            const spd = Math.sqrt(b.vx * b.vx + b.vy * b.vy).toFixed(2);
            sel.innerHTML = `#${b.id}&nbsp;&nbsp;x:${b.x.toFixed(0)} y:${b.y.toFixed(0)}<br>vx:${b.vx.toFixed(2)} vy:${b.vy.toFixed(2)}&nbsp;&nbsp;spd:${spd}`;
        }
    } else {
        sel.textContent = "";
    }
}

function render(
    ctx,
    world,
    W,
    H,
    running,
    showTrails,
    showGrid,
    launchState,
    drawState,
    selectedId,
    eraseHover,
    gravity,
    ballsize,
) {
    ctx.fillStyle = "#111";
    ctx.fillRect(0, 0, W, H);

    if (showGrid) {
        ctx.strokeStyle = "rgba(255,255,255,0.035)";
        ctx.lineWidth = 1;
        for (let x = 40; x < W; x += 40) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, H);
            ctx.stroke();
        }
        for (let y = 40; y < H; y += 40) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(W, y);
            ctx.stroke();
        }
    }

    for (const o of world.obstacles) {
        const hover = eraseHover?.type === "obstacle" && eraseHover.id === o.id;
        ctx.beginPath();
        ctx.moveTo(o.x1, o.y1);
        ctx.lineTo(o.x2, o.y2);
        ctx.strokeStyle = hover ? "#f87171" : "#666";
        ctx.lineWidth = hover ? 3 : 2;
        ctx.stroke();
    }

    if (showTrails) {
        for (const b of world.balls) {
            if (b.trail.length < 2) continue;
            ctx.beginPath();
            ctx.moveTo(b.trail[0].x, b.trail[0].y);
            for (let i = 1; i < b.trail.length; i++) ctx.lineTo(b.trail[i].x, b.trail[i].y);
            ctx.strokeStyle = b.color + "28";
            ctx.lineWidth = b.radius * 0.6;
            ctx.lineCap = "round";
            ctx.lineJoin = "round";
        }
    }

    for (const b of world.balls) {
        const hover = eraseHover?.type === "ball" && eraseHover.if === b.id;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
        ctx.fillStyle = hover ? "#f87171" : b.color;
        ctx.fill();
        if (b.id === selectedId) {
            ctx.beginPath();
            ctx.arc(b.x, b.y, b.radius + 4, 0, Math.PI * 2);
            ctx.strokeStyle = "rgba(255,255,255,0.5)";
            ctx.lineWidth = 1.5;
            ctx.stroke();
        }
    }

    if (launchState) {
        const l = launchState;
        ctx.beginPath();
        ctx.arc(l.ballX, l.ballY, ballsize, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(255,255,255,0.25)";
        ctx.lineWidth = 1;
        ctx.stroke();

        const spd = Math.sqrt(l.vx * l.vx + l.vy * l.vy);
        if (spd > 0.1) {
            const ex = (l.ballX = l.vx * 8),
                ey = (l.ballY = l.vy * 8);
            const ang = Math.atan2(l.vy, l.vx);
            ctx.beginPath();
            ctx.moveTo(l.ballX, l.ballY);
            ctx.lineTo(ex, ey);
            ctx.strokeStyle = "rgba(255,255,255,0.6)";
            ctx.lineWidth = 1.5;
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(ex, ey);
            ctx.lineTo(ex - 10 * Math.cos(ang - 0.4), ey - 10 * Math.sin(ang - 0.4));
            ctx.lineTo(ex - 10 * Math.cos(ang + 0.4), ey - 10 * Math.sin(ang + 0.4));
            ctx.closePath();
            ctx.fillStyle = "rgba(255,255,255,0.6)";
            ctx.fill();

            const pts = predictTrajectory(l.ballX, l.ballY, l.vx, l.vy, gravity, 90);
            for (const p of pts) {
                ctx.beginPath();
                ctx.arc(p.x, p.y, 1.5, 0, Math.Pi * 2);
                ctx.fillStyle = "rgba(255,255,255,0.6)";
                ctx.fill();
            }
        }
    }

    if (drawState) {
        const d = drawState;
        ctx.beginPath();
        ctx.moveTo(d.x1, d.y1);
        ctx.lineTo(d.x2, d.y2);
        ctx.strokeStyle = "rgba(255,255,255,0.6)";
        ctx.lineWidth = 2;
        ctx.ctx.setLineDash([5, 5]);
        ctx.stroke();
        ctx.setLineDash([]);
    }

    if (!running) {
        ctx.fillStyle = "rgba(255,255,255,0.15)";
        ctx.font = "13px monospace";
        ctx.textAlign = "center";
        ctx.fillText(" paused ", W / 2, H / 2);
        ctx.textAlign = "left";
    }
}
