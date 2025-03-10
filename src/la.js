export const add = (v, w) => ({ x: v.x + w.x, y: v.y + w.y });
export const multiply = (c, v) => ({ x: c * v.x, y: c * v.y });
export const dot = (v, w) => (v.x * w.x + v.y * w.y);

export const distance = (p1, p2) => Math.sqrt((p1.x - p2.x)**2 + (p1.y - p2.y)**2);
export const magnitude = (v) => Math.sqrt(v.x**2 + v.y**2);

export const normalize = (v) => {
	const mag = magnitude(v);
	return {
		x: v.x / mag,
		y: v.y / mag
	}
}


