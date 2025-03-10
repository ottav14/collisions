export const hue = (h) => {
    const c = 1; 
    const x = (1 - Math.abs((h / 60) % 2 - 1)); 
    let r = 0, g = 0, b = 0;

    if (h >= 0 && h < 60) [r, g, b] = [c, x, 0];
    else if (h >= 60 && h < 120) [r, g, b] = [x, c, 0];
    else if (h >= 120 && h < 180) [r, g, b] = [0, c, x];
    else if (h >= 180 && h < 240) [r, g, b] = [0, x, c];
    else if (h >= 240 && h < 300) [r, g, b] = [x, 0, c];
    else if (h >= 300 && h < 360) [r, g, b] = [c, 0, x];

	let rgb = [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
	let hex = rgb.map(x => x.toString(16).padStart(2, '0')).join('');

	return `#${hex}`;
}

export const clamp = (val, min, max) => {
	return Math.min(Math.max(val, min), max);
}
