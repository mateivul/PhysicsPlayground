//functions to see if a ball is close or in an obstacle
export function closestPointOnSegment(px, py, x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const lenSq = dx * dx + dy * dy;

    if (lenSq === 0) return { x: x1, y: y1 };

    let t = ((px - x1) * dx + (py - y1) * dy) / lenSq;
    t = Math.max(0, Math.min(1, t));

    return {
        x: x1 + t * dx,
        y: y1 + t * dy,
    };
}

export function distToSegment(px, py, x1, y1, x2, y2) {
    const closest = closestPointOnSegment(px, py, x1, y1, x2, y2);
    const dx = px - closest.x;
    const dy = py - closest.y;
    return Math.sqrt(dx * dx + dy * dy);
}
