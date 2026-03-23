import { closestPointOnSegment } from "./geometry.js";

export function detectBallCollisions(balls, ballRestitution) {
    //only if the distance form centers is lower than the sum of radius
    // and if dist form ceneter to segment is less than 1 radius
    for (let i = 0; i < balls.length; i++) {
        for (let j = i + 1; j < balls.length; j++) {
            const a = balls[i];
            const b = balls[j];

            const dx = b.x - a.x;
            const dy = b.y - a.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const minDist = a.radius + b.radius;

            if (dist < minDist && dist > 0) {
                const nx = dx / dist;
                const ny = dy / dist;

                const dvx = a.vx - b.vx;
                const dvy = a.vy - b.vy;
                const dvDotN = dvx * nx + dvy * ny;

                if (dvDotN <= 0) continue;

                const totalMass = a.mass + b.mass;
                const impulse = (2 * dvDotN * ballRestitution) / totalMass;

                a.vx -= impulse * b.mass * nx;
                a.vy -= impulse * b.mass * ny;
                b.vx += impulse * a.mass * nx;
                b.vy += impulse * a.mass * ny;

                const overlap = minDist - dist;
                const separateX = (overlap / 2 + 0.5) * nx;
                const separateY = (overlap / 2 + 0.5) * ny;
                a.x -= separateX;
                a.y -= separateY;
                b.x += separateX;
                b.y += separateY;
            }
        }
    }
}

export function detectObstacleCollisions(balls, obstacles, restitution) {
    for (const ball of balls) {
        for (const obs of obstacles) {
            const closest = closestPointOnSegment(ball.x, ball.y, obs.x1, obs.y1, obs.x2, obs.y2);

            const dx = ball.x - closest.x;
            const dy = ball.y - closest.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < ball.radius && dist > 0) {
                const nx = dx / dist;
                const ny = dy / dist;

                ball.x = closest.x + nx * (ball.radius + 0.5);
                ball.y = closest.y + ny * (ball.radius + 0.5);

                const dot = ball.vx * nx + ball.vy * ny;
                ball.vx = (ball.vx - 2 * dot * nx) * restitution;
                ball.vy = (ball.vy - 2 * dot * ny) * restitution;
            }
        }
    }
}
