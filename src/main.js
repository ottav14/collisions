import './style.css'

const canvasWidth = 500;
const canvasHeight = canvasWidth;
const circleCount = 5;
const spawnAttempts = 500;
const circleSizeFactor = 30;
const minMass = 1;
const maxMass = 5;
const g = 0.3;
const maxVelocity = 7;
const initialVelocity = maxVelocity;
const backgroundColor = '#000'
const friction = 0.00;
const timestep = 0.02;
const debug = false;

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext("2d");
canvas.width = canvasWidth;
canvas.height = canvasHeight;

const drawCircle = (x, y, r) => {
	ctx.beginPath();
	ctx.arc(x, y, r, 0, Math.PI * 2); 
	ctx.fillStyle = '#32d8c3';
	ctx.fill();
}

const drawLine = (x1, y1, x2, y2) => {
	ctx.beginPath();
	ctx.moveTo(x1, y1);
	ctx.lineTo(x2, y2);
	ctx.stroke();
}

const distance = (p1, p2) => Math.sqrt((p1.x - p2.x)**2 + (p1.y - p2.y)**2);

const dot = (v, w) => (v.x * w.x + v.y * w.y);


const magnitude = (v) => Math.sqrt(v.x**2 + v.y**2);

const normalize = (v) => {
	const mag = magnitude(v);
	return {
		x: v.x / mag,
		y: v.y / mag
	}
}

const add = (v, w) => ({ x: v.x + w.x, y: v.y + w.y });
const multiply = (c, v) => ({ x: c * v.x, y: c * v.y });

const step = (p) => {
	p.x += p.vx;
	p.y += p.vy;
}

const undoStep = (p) => {
	p.x -= p.vx;
	p.y -= p.vy;
}

const hue = (r, g, b) => {
    r /= 255; 
	g /= 255; 
	b /= 255;
    const max = Math.max(r, g, b); 
	const min = Math.min(r, g, b);
	const d = max - min;
    let h = 0; 

    if(d === 0) return 0; 

    switch(max) {
        case r: h = ((g - b) / d) % 6; break;
        case g: h = ((b - r) / d) + 2; break;
        case b: h = ((r - g) / d) + 4; break;
    }

    h = Math.round(h * 60);
    return h < 0 ? h + 360 : h;
}


const createCircles = () => {
	const newCircles = [];
	for(let i=0; i<circleCount; i++) {
		const mass = Math.floor((maxMass-minMass) * Math.random() + minMass);
		const radius = mass * circleSizeFactor;

		let position = {
			x: Math.floor((canvasWidth-2*radius)*Math.random()) + radius,
			y: Math.floor((canvasHeight-2*radius)*Math.random()) + radius,
		}
			
		for(let i=0; i<spawnAttempts; i++) {
			for(const other of newCircles) {
				if(distance(position, other) > radius+other.r)
					break;
				else {
					position = {
						x: Math.floor((canvasWidth-2*radius)*Math.random()) + radius,
						y: Math.floor((canvasHeight-2*radius)*Math.random()) + radius,
					}
				}
			}
		}

		newCircles.push({
			x: position.x,
			y: position.y,
			vx: initialVelocity,
			vy: 0,
			m: mass,
			r: Math.sqrt(mass) * circleSizeFactor
		});
	}
	console.log(newCircles);
	return newCircles;
}


const circles = createCircles();


const handleCollision = (c1, c2) => {

	if(!c1.vx || !c1.vy || !c2.vx || !c2.vy)
		return;


	const m1 = c1.m;
	const m2 = c2.m;
	const v1 = { x: c1.vx, y: c1.vy };
	const v2 = { x: c2.vx, y: c2.vy };
	const un = normalize(v1);
	const ut = { x: un.y, y: -un.x };

	const v1n = dot(v1, un);
	const v1t = dot(v1, ut);
	const v2n = dot(v2, un);
	const v2t = dot(v2, ut);

	const v1nd = (v1n * (m1 - m2) + 2 * m2 * v2n) / (m1 + m2);
	const v2nd = (v2n * (m2 - m1) + 2 * m1 * v1n) / (m1 + m2);

	const v1nf = multiply(v1nd, un);
	const v1tf = multiply(v1t, ut);
	const v2nf = multiply(v2nd, un);
	const v2tf = multiply(v2t, ut);

	const v1d = add(v1nf, v1tf);
	const v2d = add(v2nf, v2tf);

	const val = 20;

	c1.vx = v1d.x;
	c1.vy = v1d.y;
	c2.vx = v2d.x;
	c2.vy = v2d.y;

}

const checkCollisions = () => {
	for(let i=0; i<circles.length; i++) {
		for(let j=0; j<circles.length; j++) {
			const c1 = circles[i];
			const c2 = circles[j];
			if(i !== j && distance(c1, c2) < c1.r+c2.r) {
				undoStep(c1);
				undoStep(c2);
				handleCollision(c1, c2);
				step(c1);
				step(c2);
			}
		}
	}
}

const drawLoop = () => {
	ctx.fillStyle = backgroundColor;
	ctx.fillRect(0, 0, canvasWidth, canvasHeight);
	ctx.fillStyle = '#00f';
	for(const circle of circles)
		drawCircle(circle.x, circle.y, circle.r);

	// Debug
	
	if(debug) {
		for(const c of circles) {
			const n = normalize({ x: c.vx, y: c.vy });
			const t = { x: n.y, y: -n.x };
			const mag = 70;
			ctx.strokeStyle = '#00f';
			drawLine(c.x, c.y, c.x + mag * n.x, c.y + mag * n.y);
			ctx.strokeStyle = '#f00';
			drawLine(c.x, c.y, c.x + mag * t.x, c.y + mag * t.y);

		}
	}
	
	
}

const interval = setInterval(() => {
	
	for(const circle of circles) {
		circle.vy = Math.min(maxVelocity, circle.vy + g);

		circle.x += circle.vx;
		circle.y += circle.vy;

		if(circle.x + circle.r > canvasWidth || circle.x - circle.r < 0) {
			undoStep(circle);
			circle.vx *= -1+friction;
			step(circle);
		}
		if(circle.y + circle.r > canvasHeight || circle.y - circle.r < 0) {
			undoStep(circle);
			circle.vy *= -1+friction;
			step(circle);
		}

		checkCollisions();

	}

	drawLoop();
}, 1000*timestep);


