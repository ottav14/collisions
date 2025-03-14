import Point from './Point.js';

export const add = (v, w) => new Point(v.x + w.x, v.y + w.y);
export const sub = (v, w) => new Point(v.x - w.x, v.y - w.y);
export const mult = (c, w) => new Point(c * w.x, c * w.y);
export const dot = (v, w) => v.x * w.x + v.y * w.y;
export const distance = (v, w) => Math.sqrt((v.x-w.x)**2 + (v.y-w.y)**2);
export const magnitude = (v) => Math.sqrt(v.x**2 + v.y**2);
export const normalize = (v) => {
	const mag = magnitude(v);
	return new Point(v.x / mag, v.y / mag);
}
export const setMag = (v, mag) => mult(mag, normalize(v));

