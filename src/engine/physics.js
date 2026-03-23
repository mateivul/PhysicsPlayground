// for updating ball position and projected trajectory
export function updateBall(ball, params, canvasW, canvasH) {
    const { gravity, friction, restitution } = params;

    ball.vy += gravity;
    ball.vx *= friction;
    ball.vy *= friction;
    ball.x += ball.vx;
    ball.y += ball.vy;

    if (ball.x + ball.radius > canvasW) {
        ball.x = canvasW - ball.radius;
        ball.vx = -ball.vx * restitution;
    }
    if (ball.x - ball.radius < 0) {
        ball.x = ball.radius;
        ball.vx = -ball.vx * restitution;
    }
    if (ball.y + ball.radius > canvasH) {
        ball.y = canvasH - ball.radius;
        ball.vy = -ball.vy * restitution;
        ball.vx *= 0.98;
        if (Math.abs(ball.vy) < 0.5) ball.vy = 0;
    }
    if (ball.y - ball.radius < 0) {
        ball.y = ball.radius;
        ball.vy = -ball.vy * restitution;
    }

    ball.trail.push({ x: ball.x, y: ball.y });
    if (ball.trail.length > 30) ball.trail.shift();
}

export function predictTrajectory(x, y, vx, vy, gravity, steps = 90) {
    const points = [];
    let px = x,
        py = y,
        pvx = vx,
        pvy = vy;
    for (let i = 0; i < steps; i++) {
        pvy += gravity;
        px += pvx;
        py += pvy;
        if (i % 3 === 0) points.push({ x: px, y: py });
    }
    return points;
}
